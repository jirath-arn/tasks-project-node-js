// Load dependencies.
const jwt = require('jsonwebtoken');

// Load libraries.
const response = require('../libraries/response');

// Verify the token.
const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    
    // Empty token.
    if(!token) return response.error(res, 401, 'A token is required for authentication.');

    // Decode token.
    try
    {
        const decoded = jwt.verify(token, process.env.APP_KEY);
        req.user = decoded;
    }
    catch(err)
    {
        return response.error(res, 403, 'Invalid token.');
    }

    return next();
};

// Export modules.
module.exports = verifyToken;
