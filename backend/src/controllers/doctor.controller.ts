import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/user.model';
import DoctorDetailsModel from '../models/doctorDetails.model';

export const getDoctorsController = async (req: Request, res: Response, nxt: NextFunction) => {
    try {
        const doctors = await UserModel.find({ role: 'doctor', isActive: true}).select('fname lname profileImage');
        const profiles = await DoctorDetailsModel.find({ userId: { $in: doctors.map(d => d._id) }});

        const result = doctors.map(doc => ({
            ...doc.toJSON,
            profile: profiles.find(p => p.userId.toString() === doc._id.toString())
        }))

        res.json({ success: true, message: 'Doctors fetched', data: { doctors: result } });
    } catch (err) {
        nxt(err);
    }
}

export const getDoctorDetailsController = async (req: Request, res: Response, nxt: NextFunction) => {
    try {
        const id = req.params.id;

        if (!id || Array.isArray(id)) {
            res.status(400).json({ success: false, message: 'Please provide a valid doctor ID' });
            return;
        }
        const doctor = await UserModel.findOne({ _id: id, role: 'doctor', isActive: true });
        if (!doctor) {
            res.status(404).json({ success: false, message: 'Doctor not found' });
            return;
        }
        const profile = await DoctorDetailsModel.findOne({ userId: doctor._id });
        res.json({ success: true, message: 'Doctor fetched', data: { doctor: { ...doctor.toJSON(), profile } } });
    } catch (err) {
        nxt(err);
    }
}

export const updateDoctorProfileController = async (req: Request, res: Response, nxt: NextFunction) => {
    try {
        const userId = req.user?.id as string;

        const doctor = await UserModel.findOne({ _id: userId, role: 'doctor' });
        if (!doctor) {
            res.status(404).json({ success: false, message: 'Doctor not found' });
            return;
        }
        const profile = await DoctorDetailsModel.findOneAndUpdate(
            { userId: doctor._id },
            { $set: req.body },
            { new: true, runValidators: true }
        );
        res.json({ success: true, message: 'Profile updated', data: { profile } });
    } catch (err) {
        nxt(err);
    }
}