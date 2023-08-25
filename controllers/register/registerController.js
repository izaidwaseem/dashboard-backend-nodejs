const path = require('path');
const multer  = require('multer')
const sequelize = require('../../util/database')
const User = require('../../models/users');
const Registeration = require('../../models/registeration');
const nodemailer = require("nodemailer");
const { Op } = require('sequelize'); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './assets');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedFileTypes = /pdf|jpg|jpeg|png/;
        const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedFileTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Error: Only PDF, JPG, JPEG, and PNG files are allowed!'));
        }
    },
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB limit
    }
}).single('CV');


exports.registerUser = async (req, res) => {
    try {
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).send('Error: File size should be less than 2 MB.');
                } else {
                    return res.status(400).send('Error: Invalid file format. Only PDF, JPG, JPEG, and PNG files are allowed.');
                }
            } else if (err) {
                console.error('Error uploading file:', err);
                return res.status(500).send('An error occurred while uploading the file.');
            }

            const newRegistration = req.body;
           // console.log('newRegistration:', newRegistration);

            const existingRegistration = await Registeration.findOne({ where: { email: newRegistration.email } });
            if (existingRegistration) {
                return res.send({ success: false, msg: 'Registration with this email already exists!' });
            }

            if (!req.file) {
                return res.status(400).send('Error: CV file is required.');
            }

            newRegistration.CV = req.file.path; // Set the CV field to the file path
            await Registeration.create(newRegistration);

            res.send({ success: true, msg: `${newRegistration.firstName} added successfully!` });
        });
    } catch (error) {
        console.error('Error handling file upload and registering user:', error);
        res.status(500).send('An error occurred while processing the file upload and registration.');
    }
};



exports.sendMail = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Registeration.findByPk(userId);

        console.log("user", user);

        if (!user) {
            return res.status(404).send("User with this ID does not exist");
        }

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'zaidwaseem9669@gmail.com', // Your Gmail email address
                pass: 'sdbbjmsbvghkxtnz' // Your Gmail password or an app-specific password
            }
        });

        let mailOptions;

        if (user.flag) {
            // If the flag is true, send a success email template
            mailOptions = {
                from: 'zaidwaseem9669@gmail.com', // Sender's email address
                to: user.email, // User's email address
                subject: 'Registration Success',
                text: 'Congratulations! Your registration was successful.'
            };
        } else {
            // If the flag is false, send an alternate email template
            mailOptions = {
                from: 'zaidwaseem9669@gmail.com',
                to: user.email,
                subject: 'Registration Incomplete',
                text: 'Your registration is incomplete. Please complete the registration process.'
            };
        }

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).send('An error occurred while sending the email.');
            } else {
                console.log('Email sent:', info.response);
                res.send('Email sent successfully.');
            }
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('An error occurred while sending the email.');
    }
};


exports.downloadCV = async (req, res) => {
    const userId = req.params.id;
    const user = await Registeration.findByPk(userId);

    if (!user){
        res.send("User with this ID does not exist!")
    }
    console.log(user.CV);
    const filePath = path.join(__dirname, '../../', user.CV); // Path to the file to download
    const fileName = 'sample.pdf'; 

    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('An error occurred while downloading the file.');
        }
    });
}


exports.displayUsers = async (req, res) => {
    // console.log("testing");
    try {
        const page = req.query.page || 1;
        const perPage = 10;
        const searchKey = req.query.search;

        let whereClause = {}; 

        if (searchKey) {
            // If search query is provided, search by firstName and email
            whereClause = {
                [Op.or]: [
                    { firstName: { [Op.like]: `%${searchKey}%` } },
                    { lastName: { [Op.like]: `%${searchKey}%` } },
                    { email: { [Op.like]: `%${searchKey}%` } }
                ]
            };
        }

        const users = await Registeration.findAll({
            where: whereClause, 
            limit: perPage,
            offset: (page - 1) * perPage,
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('An error occurred while fetching users.');
    }
}