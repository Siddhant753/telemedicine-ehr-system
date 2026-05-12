import mongoose from "mongoose";
import { Schema, type Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IAppointment extends Document {
    patientId: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId;
    scheduledAt: Date;
    duration: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    type: 'video' | 'in_person';
    reason: string;
    notes?: string;
    roomToken?: string;
    timezone: string;
    reminderSent: boolean;
    cancelledBy?: mongoose.Types.ObjectId;
    cancelReason?: string;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scheduledAt: { type: Date, required: true, index: true },
    duration: { type: Number, default: 30 },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'], default: 'pending', index: true },
    type: { type: String, enum: ['video', 'in_person'], default: 'video' },
    reason: { type: String, required: true },
    notes: { type: String },
    roomToken: { type: String },
    timezone: { type: String, default: 'UTC' },
    reminderSent: { type: Boolean, default: false },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancelReason: { type: String },
    completedAt: { type: Date },
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, scheduledAt: 1, status: 1 }, { unique: false });
appointmentSchema.pre('save', function () {
    if (this.type === 'video' && !this.roomToken) {
        this.roomToken = `room_${uuidv4()}`;
    }
});

const AppointmentModel = mongoose.model<IAppointment>('Appointment', appointmentSchema);
export default AppointmentModel;