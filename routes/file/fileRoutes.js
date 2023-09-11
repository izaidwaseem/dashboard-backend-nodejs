const express = require('express');
const router = express.Router();
const fileController = require('../../controllers/fileManipulation/fileController');


router.get('/convert-pdf-to-jpeg/:id', fileController.convertPdf);
// router.get('/convert-jpeg-to-pdf/:id', fileController.convertJpeg);

module.exports = router