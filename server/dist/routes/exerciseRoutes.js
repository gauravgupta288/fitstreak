"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exerciseController_1 = require("../controllers/exerciseController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
// Protect all routes
router.use(auth_1.default);
router.get('/', exerciseController_1.getExercises);
exports.default = router;
