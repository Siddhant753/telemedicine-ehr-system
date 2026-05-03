import mongoose from 'mongoose';
import { Schema, type Document } from 'mongoose';

export interface IUserToken extends Document {
    userId: mongoose.Types.ObjectId;
    tokenType: "Verification" | "PasswordReset" | "RefreshToken";
    token: string;
    expiresAt: Date;
}

const userTokenSchema = new Schema<IUserToken>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenType: { type: String, enum: ["Verification", "PasswordReset", "RefreshToken"], required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });

const UserTokenModel = mongoose.model<IUserToken>('UserToken', userTokenSchema);
export default UserTokenModel;