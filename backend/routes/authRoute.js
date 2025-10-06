import express from 'express';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../controllers/authController.js';
import { loginValidation, registerValidation } from '../validators/authValidator.js';
import rateLimiter from '../middlewares/rateLimitor.js';

const router = express.Router();

router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, rateLimiter, loginUser);
router.post("/logout", logoutUser);
router.get("/me", getCurrentUser);

export default router;