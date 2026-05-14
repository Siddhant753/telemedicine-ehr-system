import mongoose from "mongoose";
import { Schema, type Document } from "mongoose";

export interface IEHRRecord extends Document {
    patientId: mongoose.Types.ObjectId;
    recordNumber: string;
    recordType: "consultation" | "lab" | "imaging" | "prescription" | "visit" | "notes";
    createdBy: mongoose.Types.ObjectId;
    appointmentId: mongoose.Types.ObjectId;
    dateOfRecord: Date;
    description: string;
    attachments: string[];
    encryptedData: {
        chiefComplaint: { type: String },
        diagnosis:      { type: String },
        symptoms:       { type: String },
        medications:    { type: String },
        allergies:      { type: String },
        vitalSigns:     { type: String },
        notes:          { type: String },
        labResults:     { type: String },
        imagingResults: { type: String },
        treatmentPlan:  { type: String },
    },
    createdAt: Date;
    updatedAt: Date;
}

const EHRRecordSchema = new Schema<IEHRRecord>({
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recordNumber: { type: String, required: true, unique: true },
    recordType: { type: String, enum: ["consultation", "lab", "imaging", "prescription", "visit", "notes"], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true },
    dateOfRecord: { type: Date, required: true, default: Date.now },
    description: { type: String, default: "" },
    attachments: { type: [String], default: [] },
    encryptedData: {
        chiefComplaint: { type: String },
        diagnosis:      { type: String },
        symptoms:       { type: String },
        medications:    { type: String },
        allergies:      { type: String },
        vitalSigns:     { type: String },
        notes:          { type: String },
        labResults:     { type: String },
        imagingResults: { type: String },
        treatmentPlan:  { type: String },
    }
}, { timestamps: true });

EHRRecordSchema.index({ patientId: 1, dateOfRecord: -1 });
EHRRecordSchema.index({ patientId: 1, recordType: 1 });

const EHRRecordModel = mongoose.model<IEHRRecord>('EHRRecord', EHRRecordSchema);
export default EHRRecordModel;