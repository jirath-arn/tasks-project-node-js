// Load dependencies.
require('dotenv').config();
require('./config/database').connect();

// Load libraries.
const response = require('./libraries/response');

// Load routes.
const authRoute = require('./routes/auth');
const taskRoute = require('./routes/task');

// Create application.
const express = require('express');
const app = express();

app.use(express.json());
app.use('/auth', authRoute);
app.use('/task', taskRoute);
app.use((req, res) => {
    return response.error(res, 404, 'Not found.');
});

// Export modules.
module.exports = app;
