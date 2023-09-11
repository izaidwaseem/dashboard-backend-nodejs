const path = require('path');
const Registeration = require('../../models/registeration');
const pdfPoppler = require('pdf-poppler');


exports.convertPdf = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Registeration.findByPk(userId);

        if (!user) {
            return res.send("User with this ID does not exist!");
        }

        // console.log(user.name)
        const inputPath = path.join(__dirname, '../../', user.CV);
        const outputPath = path.join(__dirname, '../../assets/converted');
        const name = user.firstName + user.lastName;

        const outputOptions = {
            format: 'jpeg',      // Output image format (jpeg/png)
            out_dir: outputPath, // Output directory
            out_prefix: `output-${name}` // Output image prefix
        };

        const pages = 'all';    // Convert all pages

        pdfPoppler.convert(inputPath, outputOptions, pages).then((resolve) => {
            console.log('Image converted', resolve);
            res.send('PDF converted to images successfully.');
        }).catch((error) => {
            console.error('Error converting PDF to images:', error);
            res.status(500).send('An error occurred while converting PDF to images.');
        });
    } catch (error) {
        console.error('Error in convertFile API:', error);
        res.status(500).send('An error occurred in the convertFile API.');
    }
};

