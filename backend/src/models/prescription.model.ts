import mongoose, { Schema, type Document } from "mongoose";

export interface IMedication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    route?: string;
    instructions?: string;
}

export interface IPrescription extends Document {
    rxNumber: string;
    patientId: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId;
    appointmentId?: mongoose.Types.ObjectId;
    medications: IMedication[];
    diagnosis: string;
    notes?: string;
    validUntil: Date;
    issuedAt: Date;
    /* Cryptographic */
    digitalSignature: string;
    signatureTimestamp: Date;
    qrCode?: string;
    verificationHash: string;
    pdfPath?: string;
    isFilled: boolean;
}

const medicationSchema = new Schema<IMedication>(
    {
        name: { type: String, required: true, trim: true },
        dosage: { type: String, required: true, trim: true },
        frequency: { type: String, required: true, trim: true },
        duration: { type: String, required: true, trim: true },
        route: { type: String, trim: true },
        instructions: { type: String, trim: true },
    },
    {_id: false}
);

const prescriptionSchema = new Schema<IPrescription>(
    {
        rxNumber: { type: String, required: true, unique: true, index: true, trim: true },
        patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
        medications: {
            type: [medicationSchema],
            required: true,
            validate: {
                validator: function (
                    meds: IMedication[]
                ) {
                    return meds.length > 0;
                },
                message: "At least one medication is required",
            },
        },
        diagnosis: { type: String, required: true, trim: true },
        notes: { type: String, trim: true },
        validUntil: { type: Date, required: true },
        issuedAt: { type: Date, default: Date.now },
        digitalSignature: { type: String, required: true },
        signatureTimestamp: { type: Date, required: true },
        qrCode: { type: String },
        verificationHash: { type: String, required: true, unique: true, index: true },
        pdfPath: { type: String },
        isFilled: { type: Boolean, default: false },
    }, { timestamps: true }
);

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });
prescriptionSchema.index({ appointmentId: 1 });
prescriptionSchema.index({ isFilled: 1 });

const PrescriptionModel = mongoose.model<IPrescription>("Prescription", prescriptionSchema);
export default PrescriptionModel;