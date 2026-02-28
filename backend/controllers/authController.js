import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { successResponse } from '../utils/response.js';
import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.js';
import crypto from 'crypto';
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedS3Url } from "../middlewares/s3Helper.js";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

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
            isVerified: newUser.isVerified,
            avatar: await getSignedS3Url(newUser.avatar)
        }
    });
}

const loginUser = async (req, res, next) => {
    const { username, password, rememberMe } = req.body;

    console.log("Login Details: ", username, password);

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Invalid username or password', 401));
    }

    const token = generateToken(user._id);

    // Set cookie age: 30 days if rememberMe is true, else 1 day
    const cookieAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: cookieAge
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
            isVerified: user.isVerified,
            avatar: await getSignedS3Url(user.avatar)
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

        const userWithAvatar = {
            ...user._doc,
            avatar: await getSignedS3Url(user.avatar)
        };

        return successResponse(res, "", userWithAvatar);
    } catch (error) {
        return errorResponse(res, "Token not found", 401, error);
    }
}

const forgotPassword = async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with that email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // 3) Respond to client (Email sending removed as per requirements)
    return successResponse(res, 'Reset token generated successfully (Email disabled)');
};

const resetPassword = async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Log the user in, send JWT
    const token = generateToken(user._id);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    });

    return successResponse(res, "Password Reset Successfully", {
        user: {
            id: user._id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            avatar: await getSignedS3Url(user.avatar)
        }
    });
};

const updateProfile = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return next(new AppError("Not Authenticated", 401));

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);

        if (!user) return next(new AppError("User not found", 404));

        const { fullname, email } = req.body;
        if (fullname) user.fullname = fullname;
        if (email) user.email = email;

        await user.save();

        return successResponse(res, "Profile Updated Successfully", {
            user: {
                id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                avatar: await getSignedS3Url(user.avatar)
            }
        });
    } catch (error) {
        return next(new AppError("Invalid Token", 401));
    }
};

const updatePassword = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return next(new AppError("Not Authenticated", 401));

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return next(new AppError("Please provide current and new password", 400));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);

        if (!user || !(await user.comparePassword(currentPassword))) {
            return next(new AppError("Invalid current password", 401));
        }

        user.password = newPassword;
        await user.save();

        return successResponse(res, "Password Updated Successfully");
    } catch (error) {
        return next(new AppError("Invalid Token", 401));
    }
};


const updateAvatar = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return next(new AppError("Not Authenticated", 401));

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);

        if (!user) return next(new AppError("User not found", 404));

        if (!req.file) {
            return next(new AppError("Please upload an image", 400));
        }

        // Delete old avatar if exists
        if (user.avatar && user.avatar.includes('amazonaws.com')) {
            const oldKey = user.avatar.split('.com/')[1];
            try {
                await s3.send(new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: oldKey
                }));
            } catch (err) {
                console.warn("Failed to delete old avatar", err);
            }
        }

        user.avatar = req.file.location; // location is provided by multer-s3
        await user.save();

        return successResponse(res, "Avatar Updated Successfully", {
            user: {
                id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                avatar: await getSignedS3Url(user.avatar)
            }
        });
    } catch (error) {
        return next(new AppError("Avatar update failed", 500));
    }
};

export { loginUser, registerUser, logoutUser, getCurrentUser, forgotPassword, resetPassword, updateProfile, updatePassword, updateAvatar };