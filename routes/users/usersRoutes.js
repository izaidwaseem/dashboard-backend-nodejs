const express = require('express');
const router = express.Router();
const userController = require('../../controllers/users/usersContoller');
const authentication = require('../../middleware/authentication');

// Create user routes

router.post('/create', userController.createAccountLimiter, userController.createUser);
router.get('/get-user/:id', userController.getUser);
router.delete('/delete/:id', userController.deleteUser);
router.put('/update/:id', userController.updateUser);
router.post('/login/:email', userController.loginUser);

// Profile route with token renewal using refresh token
router.post('/profile', authentication.verifyAccessToken, userController.profileUser);
router.post('/refresh', authentication.refreshTokens); // Route to refresh access token

router.post('/send-ai-response', userController.sendAiResponse);


module.exports = router;
