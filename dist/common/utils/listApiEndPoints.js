"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listApiEndpoints = void 0;
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const listApiEndpoints = (app) => {
    const endpoints = (0, express_list_endpoints_1.default)(app);
    console.log('\n=== API Endpoints ===\n');
    endpoints.forEach(endpoint => {
        console.log(`${endpoint.methods.join(', ')} ${endpoint.path}`);
    });
    console.log('\n');
};
exports.listApiEndpoints = listApiEndpoints;
