// Load config.
const responseCode = require('../config/response_code_configuration');
const status = require('../config/status_configuration');

// Load libraries.
const response = require('../libraries/response');
const datetime = require('../libraries/datetime');

// Load dependencies.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();

// Load models.
const userModel = require('../models/user');
const lineModel = require('../models/line');

// Login.
/*******************************
 * Method: POST
 * Param: username, password
 * Return:
 * 0x0000-00000 -> Process Request Complete.
 * 0x0000-00001 -> The username or password is incorrect.
 * 0x8000-00000 -> Please complete the information.
********************************/
router.post('/login', async (req, res) => {
    try
    {
        const username = req.body.username;
        const password = req.body.password;

        if(!(username && password)) return response.success(res, 400, responseCode[400].CODE, responseCode[400].MESSAGE);

        // Validate if user exist in database.
        let filter = {};
        filter.select = 'users.id, users.password';
        filter.custom_where = `users.username = '${username}'`;
        filter.get_first = true;
        const user = await userModel.search(filter);

        if(user && (await bcrypt.compare(password, user.password)))
        {
            const token = {
                'access_token': jwt.sign(
                    { user_id: user.id },
                    process.env.APP_KEY,
                    { expiresIn: '1d' }
                )
            };
            
            // Line Notification.
            const message = `\r\n${username} - logged in.`;
            await lineModel.sendMessage(message, process.env.LINE_KEY);
            
            return response.success(res, 200, responseCode[200].CODE, responseCode[200].MESSAGE, token);
        }
        else
        {
            return response.success(res, 200, '0x0000-00001', 'The username or password is incorrect.');
        }
    }
    catch(err)
    {
        console.log(err);
        return response.error(res, 500, err);
    }
});

// Register.
/*******************************
 * Method: POST
 * Param: username, password, email
 * Return:
 * 0x0000-00000 -> Process Request Complete.
 * 0x0000-00001 -> User already exists. Please login.
 * 0x8000-00000 -> Please complete the information.
********************************/
router.post('/register', async (req, res) => {
    try
    {
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;

        if(!(username && password)) return response.success(res, 400, responseCode[400].CODE, responseCode[400].MESSAGE);

        // Check old user.
        let filter = {};
        filter.select = 'users.id';
        filter.custom_where = `users.username = '${username}'`;
        filter.get_first = true;
        const oldUser = await userModel.search(filter);

        if(oldUser) return response.success(res, 200, '0x0000-00001', 'User already exists. Please login.');

        // Encrypted password.
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Datetime now.
        const dt = datetime.now();

        // Create new user.
        const results = await userModel.create({
            username: username,
            password: encryptedPassword,
            email: email,
            status: status.STATUS_ACTIVATE,
            created_at: dt,
            updated_at: dt
        });

        return response.success(res, 201, responseCode[200].CODE, responseCode[200].MESSAGE, results);
    }
    catch(err)
    {
        console.log(err);
        return response.error(res, 500, err);
    }
});

// Export modules.
module.exports = router;
