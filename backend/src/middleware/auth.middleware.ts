import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import type { JwtUserPayload } from "../types/express";

type UserRole = 'admin' | 'doctor' | 'patient';

export const getTokenFromHeader = (req: Request): string | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    return token || null;
} 

const authMiddleware = (req: Request, res: Response, nxt: NextFunction) => {
    try {
        const token = getTokenFromHeader(req);
        if (!token) {
            return res.status(401).json({ massage: "Token not found or expired." })
        }

        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN_KEY as string) as JwtUserPayload;
        req.user = decoded;

        nxt();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }
}

export const roleMiddleware = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`,
            });
            return;
        }
        next();
    };
};


export default authMiddleware;