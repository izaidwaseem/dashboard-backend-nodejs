const { use } = require('express/lib/application');
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../../users.json');
const rateLimit = require('express-rate-limit')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const accessTokenKey = 'access-token'
const refreshTokenKey = 'refresh-token'
const multer  = require('multer')
const sequelize = require('../../util/database')
const User = require('../../models/users');
const Registeration = require('../../models/registeration');
const nodemailer = require("nodemailer");
const { Op } = require('sequelize'); 


//function to get users
exports.getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);

        if (!user) {
            res.status(404).send("User with this ID does not exist");
        } else {
            res.send(user);
        }
    } catch (error) {
        res.status(500).send("An error occurred while fetching the user.");
    }
};

exports.createAccountLimiter = rateLimit({
    windowMs: 5000, // 5 second
    max: 1, // Limit to 1 request per windowMs
    message: 'Rate Limit Reached'
});

//function to create new user
exports.createUser = async (req, res) => {
    try {
        const newUser = req.body;
        const hashedPassword = await bcrypt.hash(newUser.password, 10);
        newUser.password = hashedPassword;

        const existingUser = await User.findOne({ where: { email: newUser.email } });
        if (existingUser) {
            return res.send({ success: false, msg: 'User with this email already exists!' });
        }

        await User.create(newUser);

        res.send({ success: true, msg: `${newUser.name} added successfully!` });
    } catch (error) {
        res.status(500).send("An error occurred while creating the user.");
    }
};

//function to delete a user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const userToDelete = await User.findByPk(userId);

        if (!userToDelete) {
            return res.send({ success: false, msg: 'User not found' });
        }

        await userToDelete.destroy();

        res.send({ success: true, msg: `${userToDelete.name} deleted successfully!` });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({ success: false, msg: 'An error occurred while deleting the user' });
    }
};


//function to update user
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const userToUpdate = await User.findByPk(userId);
        const user = userToUpdate;
    

        if (!userToUpdate) {
            return res.send({ success: false, msg: 'User not found' });
        }

        const body = req.body;
        //console.log(body);

        if ('name' in body) {
            userToUpdate.name = body.name;
        }

        if ('email' in body) {
            userToUpdate.email = body.email;
        }

        await userToUpdate.save();

        res.send({ success: true, msg: `${user.name}'s details updated successfully!` });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ success: false, msg: 'An error occurred while updating the user.' });
    }
};



// Function to access Profile
exports.profileUser = async (req, res) => {
    try {
        const user = req.user; // The authenticated user from the verifyToken middleware

        if (!user) {
            res.status(403).json({ message: 'Invalid token' });
        } else {
            res.json({
                message: 'Profile accessed',
                authUser: user.authUser 
            });
        }
    } catch (error) {
        console.error('Error profiling user:', error);
        res.status(500).send('An error occurred while profiling the user.');
    }
};



// Function to Login user
exports.loginUser = async (req, res) => {
    try {
        const loggedUserEmail = req.params.email;
        const authUser = await User.findOne({ where: { email: loggedUserEmail } });

        if (!authUser) {
            res.send('User does not exist!');
        } else {
            jwt.sign({ authUser }, accessTokenKey, { expiresIn: '1000s' }, (err, token) => {
                if (err) {
                    res.status(500).json({ error: 'Error signing the token.' });
                } else {
                    jwt.sign({ authUser }, refreshTokenKey, { expiresIn: '5000s' }, (err, refreshToken) => {
                        if (err) {
                            res.status(500).json({ error: 'Error signing the refresh token.' });
                        } else {
                        
                            res.json({
                                token,
                                refreshToken,
                                message: `${authUser.name} logged in successfully`
                            });
                        }
                    });
                }
            });
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('An error occurred while logging in the user.');
    }
};

OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: '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'
})


async function generateResponse(userMessage) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 150
      });
  
      const content = response.choices[0].message.content; // Get the content
      if (content !== undefined) {
        return content.trim(); // Trim the content if it's defined
      } else {
        console.error('Empty response content');
        return 'An error occurred while generating a response.';
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'An error occurred while generating a response.';
    }
}
  
module.exports.generateResponse = generateResponse;
  

exports.sendAiResponse = async (req, res) => {
    try {
      const userMessage = req.body.message;
   
      const gpt3Response = await generateResponse(userMessage);
  
      res.json({ response: gpt3Response });
    } catch (error) {
      console.error('Error handling AI response:', error);
      res.status(500).send('An error occurred while processing the AI response.');
    }
};






const pdfPoppler = require('pdf-poppler');

exports.convertFile = async (req, res) => {
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



