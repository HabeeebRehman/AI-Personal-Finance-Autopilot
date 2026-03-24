"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        data: {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        },
    });
});
exports.default = router;
