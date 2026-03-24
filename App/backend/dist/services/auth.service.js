"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const prisma_1 = __importDefault(require("../prisma"));
const hash_1 = require("../utils/hash");
const error_middleware_1 = require("../middleware/error.middleware");
/**
 * Generate a JWT token for a user
 * @param userId The ID of the user
 * @returns The generated token
 */
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, config_1.config.jwtSecret, {
        expiresIn: config_1.config.jwtExpiresIn,
    });
};
exports.generateToken = generateToken;
/**
 * Register a new user
 * @param data The user registration data
 * @returns The registered user and token
 */
const register = async (data) => {
    const { email, password, name } = data;
    // Check if user already exists
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new error_middleware_1.AppError(400, 'User with this email already exists');
    }
    // Hash password
    const hashedPassword = await (0, hash_1.hashPassword)(password);
    // Create user
    const user = await prisma_1.default.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
    });
    // Generate token
    const token = (0, exports.generateToken)(user.id);
    return { user, token };
};
exports.register = register;
/**
 * Login a user
 * @param data The user login data
 * @returns The user and token
 */
const login = async (data) => {
    const { email, password } = data;
    // Find user
    const user = await prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new error_middleware_1.AppError(401, 'Invalid credentials');
    }
    // Check password
    const isPasswordValid = await (0, hash_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new error_middleware_1.AppError(401, 'Invalid credentials');
    }
    // Generate token
    const token = (0, exports.generateToken)(user.id);
    // Prepare response user data
    const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
    };
    return { user: userData, token };
};
exports.login = login;
