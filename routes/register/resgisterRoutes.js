const express = require('express');
const router = express.Router();
const registerController = require('../../controllers/register/registerController')

//registeration routes
router.post('/register-user', registerController.registerUser);
router.get('/download/:id', registerController.downloadCV);
router.post('/send-mail/:id', registerController.sendMail);
router.get('/display-users', registerController.displayUsers);

module.exports = router