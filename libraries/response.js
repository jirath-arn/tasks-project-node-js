// Export modules.
module.exports = {
    success: function(res, httpCode = 200, code, message, data = null) {
        return res.status(httpCode).send({
            code: code,
            message: message,
            data: data
        });
    },
    error: function(res, httpCode, message) {
        return res.status(httpCode).send({
            error: {
                code: httpCode,
                message: message
            }
        });
    }
};
