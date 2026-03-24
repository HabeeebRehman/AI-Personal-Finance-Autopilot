"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const prisma_1 = __importDefault(require("../prisma"));
const error_middleware_1 = require("./error.middleware");
/**
 * Middleware to protect routes and verify JWT token
 */
const protect = async (req, res, next) => {
    let token;
    // Check if token is present in Authorization header
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new error_middleware_1.AppError(401, 'Not authorized, token missing'));
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        // Get user from database
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
        if (!user) {
            return next(new error_middleware_1.AppError(401, 'Not authorized, user not found'));
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        console.error('JWT Verification Error:', error);
        return next(new error_middleware_1.AppError(401, 'Not authorized, token invalid'));
    }
};
exports.protect = protect;
