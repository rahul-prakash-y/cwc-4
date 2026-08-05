"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.authenticate = authenticate;
exports.isAdmin = isAdmin;
exports.isStudent = isStudent;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
/**
 * Helper to generate JWT token for authenticated users
 */
function generateToken(payload, expiresIn = '7d') {
    return jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_SECRET, { expiresIn });
}
/**
 * PreHandler Middleware to verify JWT token
 */
async function authenticate(request, reply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Authentication token missing or malformed',
            });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
        request.user = decoded;
    }
    catch (err) {
        return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Invalid or expired authentication token',
        });
    }
}
/**
 * PreHandler Middleware to check for Admin role
 */
async function isAdmin(request, reply) {
    if (!request.user) {
        return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Authentication required',
        });
    }
    if (request.user.role !== 'admin') {
        return reply.status(403).send({
            error: 'Forbidden',
            message: 'Access denied: Admin privileges required',
        });
    }
}
/**
 * PreHandler Middleware to check for Student role
 */
async function isStudent(request, reply) {
    if (!request.user) {
        return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Authentication required',
        });
    }
    if (request.user.role !== 'student') {
        return reply.status(403).send({
            error: 'Forbidden',
            message: 'Access denied: Student privileges required',
        });
    }
}
