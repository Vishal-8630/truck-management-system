import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { successResponse } from '../utils/response.js';
import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

const registerUser = async (req, res, next) => {
    const { fullname, username, email, password } = req.body;

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });
    if (existingUser) {
        if (existingUser.email === email) {
            return next(new AppError('Email already in use', 400));
        }
        if (existingUser.username === username) {
            return next(new AppError('Username already in use', 400));
        }
    }

    const newUser = await User.create({ fullname, username, email, password });
    if (!newUser) {
        return next(new AppError('Failed to create user', 500));
    }

    const token = generateToken(newUser._id);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return successResponse(res, "User Registered Successfully", {
        user: {
            id: newUser._id,
            fullname: newUser.fullname,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt,
            isAdmin: newUser.isAdmin,
            isVerified: newUser.isVerified
        }
    });
}

const loginUser = async (req, res, next) => {
    const { username, password } = req.body;

    console.log("Login Details: ", username, password);

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Invalid username or password', 401));
    }

    const token = generateToken(user._id);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    console.log("User: ", user);

    return successResponse(res, "User Logged In Successfully", {
        user: {
            id: user._id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified
        }
    });
}

const logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    return successResponse(res, "User Logged Out Successfully");
}

const getCurrentUser = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return next(new AppError("Not Authenticated", 401));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).select("-password");

        if (!user) {
            return next(new AppError("User not found", 401));
        }
        return successResponse(res, "", user);
    } catch (error) {
        return errorResponse(res, "Token not found", 401, error);
    }
}

export { loginUser, registerUser, logoutUser, getCurrentUser };