// Load dependencies.
const axios = require('axios');

// Export modules.
module.exports = {
    sendMessage: async function(message, token) {
        message = message.replace(/\\r/g, "\r");
        message = message.replace(/\\n/g, "\n");
        
        const queryData = {
            message: message
        };
        
        const formData = new URLSearchParams();
        for(const [key, value] of Object.entries(queryData))
        {
            formData.append(key, value);
        }
        
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${token}`,
                'Content-Length': formData.toString().length
            }
        };
        
        try
        {
            const response = await axios.post(process.env.LINE_BASE_URL, formData, config);
            return response.data != null;
        }
        catch(err)
        {
            return false;
        }
    }
};
