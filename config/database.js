// Load dependencies.
const mysql = require('mysql');

// Create connection to the database.
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    timezone: '+HH:MM'
});

// Export modules.
module.exports = {
    connect: function() {
        // Connecting to the database.
        connection.connect((err) => {
            if(err)
            {
                console.log('Error connecting to MySQL database.');
                console.error(err);
                process.exit(1);
            }
            console.log('MySQL successfully connected!');
        });
    },
    connection
};
