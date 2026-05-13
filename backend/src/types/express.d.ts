import { IUser } from "../models/user.model";
import "express";

interface JwtUserPayload {
    id: string;
    role: "admin" | "patient" | "doctor" ;
}

declare module "express-serve-static-core" {
    interface Request {
        user?: JwtUserPayload;
    }
}