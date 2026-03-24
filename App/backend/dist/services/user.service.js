"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getAllUsers = async () => {
    return await prisma_1.default.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
    });
};
exports.getAllUsers = getAllUsers;
