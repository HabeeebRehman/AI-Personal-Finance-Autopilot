"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const prisma_1 = __importDefault(require("./prisma"));
const startServer = async () => {
    try {
        // Check database connection
        await prisma_1.default.$connect();
        console.log('Database connected successfully');
        const port = config_1.config.port;
        const server = app_1.default.listen(port, () => {
            console.log(`Server is running on port ${port} in ${config_1.config.nodeEnv} mode`);
        });
        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                prisma_1.default.$disconnect();
            });
        });
        process.on('SIGINT', async () => {
            console.log('SIGINT signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                prisma_1.default.$disconnect();
            });
        });
    }
    catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};
startServer();
