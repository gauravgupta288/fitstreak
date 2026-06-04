"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const dns_1 = __importDefault(require("dns"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const workoutRoutes_1 = __importDefault(require("./routes/workoutRoutes"));
const exerciseRoutes_1 = __importDefault(require("./routes/exerciseRoutes"));
// Load environment variables
dotenv_1.default.config();
// Resolve MongoDB Atlas DNS issues by forcing Google Public DNS
try {
    dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
}
catch (e) {
    console.warn('Could not set custom DNS servers:', e);
}
// Connect to Database
(0, db_1.default)();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: '*', // For local development, allow all origins
    credentials: true,
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/workouts', workoutRoutes_1.default);
app.use('/api/exercises', exerciseRoutes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'FitStreak API is healthy' });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: err.message || 'An unexpected error occurred on the server',
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
