"use strict";
const listEndpoints = require('express-list-endpoints');
function logRoutes(app) {
    const endpoints = listEndpoints(app);
    console.log('\n=== API Endpoints ===\n');
    endpoints.forEach(endpoint => {
        console.log(`${endpoint.methods.join(', ')} ${endpoint.path}`);
    });
    console.log('\n');
}
module.exports = logRoutes;
