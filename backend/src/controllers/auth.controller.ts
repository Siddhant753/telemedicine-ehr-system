import type { Request, Response, NextFunction } from "express";
import bcryptjs from 'bcryptjs';
import crypto from "crypto";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model";
import UserTokenModel from "../models/userToken.model";
import DoctorDetailsModel from "../models/doctorDetails.model";
import { createError } from "../middleware/error.middleware";
import { createUser, findUserByEmail, findUserById, verifyToken } from "../services/auth.service";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils";

interface JwtPayload {
    id: string;
}

export const signupController = async (req: Request, res: Response, nxt: NextFunction) => {
    try {
        const { fname, lname, email, password, role, phone, specialization, registrationNumber, dateOfBirth, gender } = req.body;

        const existinguser = await findUserByEmail(email);
        if (existinguser) {
            return nxt(createError("Email already registered", 400));
        };

        const { user, rawToken } = await createUser(fname, lname, email, password, role, phone);

        if (role === "doctor") {
            if (!specialization || !registrationNumber) {
                return nxt(createError('Specialization and registration number are required for doctors', 400));
            }
            await DoctorDetailsModel.create({ 
                userId: user._id,
                specialization,
                registrationNumber,
            });
        }

        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;

        // email sending logic here using nodemailer or any email service provider
        console.log(`Verification link (send this via email): ${verificationLink}`);  // For testing purposes, we log the link. In production, you would send this via email.
        res.status(201).json({ message: "User created successfully, please verify your email" });
    } catch (err) {
        nxt(err);
    }
}

export const verifyEmailController = async (req: Request, res: Response, nxt: NextFunction) => {
    try {
        const { token } = req.params;

        if (!token || Array.isArray(token)) {
            return nxt(createError("Please provide a valid token", 400));
        }

        const user = await verifyToken(token);
        if (!user) return nxt(createError("Invalid or expired token", 400));

        // Optionally, you can generate a JWT token here for immediate login after verification
    
        res.status(200).json({ message: "Email verified successfully." });
    } catch (err) {
        nxt(err);
    }
}

export const loginController = async (req: Request, res: Response, nxt: NextFunction) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) return nxt(createError("Email and password are required", 400));

        const user = await findUserByEmail(email);
        if (!user) return nxt(createError("Invalid email or password", 400));

        if (user.isActive === false) return nxt(createError("Please verify your email before logging in", 400));

        const passwordMatch = await bcryptjs.compare(password, user.hashPassword);
        if (!passwordMatch) return nxt(createError("Invalid email or password", 400));

        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true only on HTTPS
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 30
        })

        console.log(`Access Token: ${accessToken}`); // For testing purposes, log the access token. In production, you would not do this.
        console.log(`Refresh Token: ${refreshToken}`); // For testing purposes, log the refresh token. In production, you would not do this.
        return res.status(200).json({ message: "Login successful", accessToken, user });
    } catch (err) {
        nxt(err);
    }
}

export const verifyAccessTokenController = async (req: Request, res: Response, nxt: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) return nxt(createError("Authorization header missing or malformed", 401));

        const token = authHeader.split(" ")[1];
        if (!token) return nxt(createError("Invalid token format", 401));

        const ACCESS_TOKEN_SECRET = process.env.SECRET_ACCESS_TOKEN_KEY;
        if (!ACCESS_TOKEN_SECRET) throw new Error("ACCESS_TOKEN_SECRET is not defined");

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

        return res.status(200).json({ success: true, message: "Access token valid", user: decoded });
    } catch (err) {
        nxt(createError(`Invalid or expired access token: ${err}`, 401));
    }
};

export const refreshTokenController = async (req: Request, res: Response, nxt: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return nxt(createError("Refresh token missing", 401));

        const REFRESH_TOKEN_SECRET = process.env.SECRET_REFRESH_TOKEN_KEY;
        if (!REFRESH_TOKEN_SECRET) {
            throw new Error("REFRESH_TOKEN_SECRET is not defined");
        }

        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload;

        const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const storedToken = await UserTokenModel.findOne({ token: hashedToken, tokenType: "RefreshToken" });

        if (!storedToken) return nxt(createError("Invalid or reused refresh token", 401))

        await storedToken.deleteOne();
        const user = await UserModel.findById(decoded.id);

        if (!user) return nxt(createError("User not found", 404));

        const accessToken = await generateAccessToken(user);
        const newRefreshToken = await generateRefreshToken(user);

        const newHashedToken = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
        await UserTokenModel.create({ userId: user._id, token: newHashedToken, tokenType: "RefreshToken" });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 30,
        });

        return res.status(200).json({ success: true, accessToken });
    } catch (error) {
        return nxt(createError(`Invalid or expired refresh token: ${error}`, 401));
    }
};

export const logoutController = async (req: Request, res: Response, nxt: NextFunction) => {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        return nxt(createError("Refresh token not found", 400));
    }
    
    const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await UserTokenModel.deleteOne({ token: hashedToken, tokenType: "RefreshToken" });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    })

    return res.json({ success: true, message: "Logged out successfully" });
}

export const getCurrentUserController = async (req: Request, res: Response, nxt: NextFunction) => {
    try {
        const id = req.user?.id as string;
        const user = await findUserById(id);
        if (!user) return nxt(createError("User not found", 404));

        if (user.isActive === false) return nxt(createError("User is inactive", 403));

        return res.status(200).json({ success: true, message: "User data fetched successfully", user });
    } catch (error) {
        return nxt(createError("User not found", 404));
    }
}