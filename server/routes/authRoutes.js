import express from "express";
import { forgotPassword, login, logout, refreshAccessToken, register, resetPassword, verifyEmail } from "../controllers/authController.js";
import validate from "../middleware/validate.js";
import { registerSchema } from "../validators/authValidator.js";
import authRateLimiter from "../middleware/rateLimiter.js";
import csrfProtection from "../middleware/csrfProtection.js";



const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.get("/verify-email", verifyEmail);
router.post("/login", authRateLimiter, login);
router.post("/refresh-token", csrfProtection, refreshAccessToken);
router.post("/logout", logout)
router.post("/forgotPassword", forgotPassword)
router.post("/reset-password/:token", resetPassword);

export default router;