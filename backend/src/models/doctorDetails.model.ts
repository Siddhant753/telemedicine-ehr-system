import mongoose from "mongoose";
import { Schema, type Document } from "mongoose";

export interface IDoctorDetails extends Document {
    userId: mongoose.Types.ObjectId;
    specialization: string;
    registrationNumber: string;
    qualifications: string[];
    experience: number;
    consultationFee: number;
    bio: string;
    availability: {
        day: string;
        slots: {
            startTime: string;
            endTime: string;
        }
    }
    rating: number;
    totalReviews: number;    
}

const doctorDetailsSchema = new Schema<IDoctorDetails>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    specialization:  { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    qualifications:  { type: [String], default: [] },
    experience: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    bio: { type: String },
    availability: {
        day: { type: String, },
        slots: [{
            startTime: { type: String },
            endTime: { type: String }
        }]
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
}, { timestamps: true});

const DoctorDetailsModel = mongoose.model<IDoctorDetails>('DoctorDetails', doctorDetailsSchema);
export default DoctorDetailsModel;