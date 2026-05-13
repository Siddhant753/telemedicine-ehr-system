import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JwtUserPayload } from '../types/express';
import UserTokenModel from '../models/userToken.model';
import { IUser } from '../models/user.model';

export const generateAccessToken = (user: IUser) => {
    const accessToken = jwt.sign({ userId: user._id, role: user.role, email: user.email }, process.env.SECRET_ACCESS_TOKEN_KEY as string, { expiresIn: '15m' });
    return accessToken;
}

export const generateRefreshToken = async (user: IUser) => {
    const refreshToken = jwt.sign({ userId: user._id, role: user.role, email: user.email }, process.env.SECRET_REFRESH_TOKEN_KEY as string, { expiresIn: '7d' });

    const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await UserTokenModel.create({
        userId: user._id,
        token: hashedRefreshToken,
        tokenType: "RefreshToken",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    return refreshToken;
}

export const verifyAccessToken = (token: string): JwtUserPayload => {
    const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN_KEY as string) as JwtUserPayload;
    return decoded;
}

export const verifyRefreshToken = async (token: string): Promise<JwtUserPayload> => {
    const decoded = jwt.verify(token, process.env.SECRET_REFRESH_TOKEN_KEY as string) as JwtUserPayload;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    const storedToken = await UserTokenModel.findOne({ token: hashedToken, tokenType: "RefreshToken" });

    if (!storedToken) throw new Error("Invalid or expired refresh token");
    if (storedToken.expiresAt < new Date()) {
        await UserTokenModel.deleteOne({ _id: storedToken._id });
        throw new Error("Refresh token expired, please log in again");
    }

    return decoded;
}

export const generateRoomToken = (userId: string, appointmentId: string, roomId: string): string => {
    const payload = { userId, appointmentId, roomId };
    return jwt.sign(payload, process.env.SECRET_ROOM_TOKEN_KEY as string, { expiresIn: '2h' });
}