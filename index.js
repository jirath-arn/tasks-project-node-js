// Load dependencies.
const http = require('http');
const app = require('./app');

// Create server.
const server = http.createServer(app);
const port = process.env.APP_PORT;

// Server listening.
server.listen(port, () => {
    // console.log(`Server running on port ${port}`);
    console.log(`Server running at ${process.env.APP_URL}:${port}`);
});
