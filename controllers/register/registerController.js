const path = require('path');
const multer  = require('multer')
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

const findUserById = async (userId) => {
    try {
        const user = await Registeration.findByPk(userId);
        return user;
    } catch (error) {
        console.error('Error finding user by ID:', error);
        res.status(500).send('An error occurred while finding user by ID.');
    }
};


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

            newRegistration.CV = req.file.path; 
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
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).send("User with this ID does not exist");
        }

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'zaidwaseem9669@gmail.com',
                pass: 'sdbbjmsbvghkxtnz'
            }
        });

        let mailOptions;
        let subject;
        let emailContent;

        if (user.flag === 'true') {
            // If the flag is true, prepare a success email template
            subject = 'Congratulations buddy';
            emailContent = `
                <html>
                <head>
                    <style>
                        /* Inline CSS styles for the email */
                        body {
                            font-family: Arial, sans-serif;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f7f7f7;
                            border-radius: 10px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Congratulations!</h1>
                        </div>
                        <p>Dear Candidate,</p>
                        <p>Your CV has been approved. We are excited to have you on board.</p>
                    </div>
                </body>
                </html>
            `;
        } else if (user.flag === 'false') {
            // If the flag is false, prepare a rejection email template
            subject = 'Bad Scene';
            emailContent = `
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f7f7f7;
                            border-radius: 10px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Sorry...</h1>
                        </div>
                        <p>Dear Candidate,</p>
                        <p>Unfortunately, your CV has been rejected. Don't worry, keep improving and applying.</p>
                    </div>
                </body>
                </html>
            `;
        }
        // Send the email
        mailOptions = {
            from: 'zaidwaseem9669@gmail.com',
            to: user.email,
            subject: subject,
            html: emailContent
        };

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
    try {
        const userId = req.params.id;
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).send("User with this ID does not exist!");
        }

        if (!user.CV) {
            return res.status(400).send("User does not have a CV file.");
        }

        const filePath = path.join(__dirname, '../../', user.CV); // Path to the file to download
        const fileName = 'sample.pdf'; 

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('An error occurred while downloading the file.');
            }
        });
    } catch (error) {
        console.error('Error downloading CV:', error);
        res.status(500).send('An error occurred while downloading the CV.');
    }
};


exports.displayUsers = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const perPage = 10;
        const searchKey = req.query.search;
        const filter = req.query.filter;
        const ageFilter = req.query.age;
        const genderFilter = req.query.gender;

        let whereClause = {};
        let filterClause = {};

        if (searchKey) {
            // If search query is provided, search by firstName, lastName, and email
            whereClause = {
                [Op.or]: [
                    { firstName: { [Op.like]: `%${searchKey}%` } },
                    { lastName: { [Op.like]: `%${searchKey}%` } },
                    { email: { [Op.like]: `%${searchKey}%` } }
                ]
            };
        }

        if (filter) {
            filterClause.flag = filter; 
        }

        if (ageFilter) {
            filterClause.age = ageFilter;
        }

        if (genderFilter) {
            filterClause.gender = genderFilter;
        }

        const users = await Registeration.findAll({
            where: {
                ...whereClause,
                ...filterClause 
            },
            limit: perPage,
            offset: (page - 1) * perPage,
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('An error occurred while fetching users.');
    }
};

