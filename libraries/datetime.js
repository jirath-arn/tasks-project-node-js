// Load dependencies.
const moment = require('moment-timezone');

// Export modules.
module.exports = {
    now: function() {
        // Datetime now of Bangkok with format.
        const dt = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');

        return dt;
    }
};
