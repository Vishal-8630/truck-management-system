import express from 'express';
import { getCurrentUser, loginUser, logoutUser, registerUser, forgotPassword, resetPassword, updateProfile, updatePassword, updateAvatar } from '../controllers/authController.js';
import { loginValidation, registerValidation } from '../validators/authValidator.js';
import rateLimiter from '../middlewares/rateLimitor.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, rateLimiter, loginUser);
router.post("/logout", logoutUser);
router.get("/me", getCurrentUser);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/update-profile", updateProfile);
router.patch("/update-password", updatePassword);
router.patch("/update-avatar", upload.single("avatar"), updateAvatar);

export default router;