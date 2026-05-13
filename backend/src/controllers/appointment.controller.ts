import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/user.model';
import { createError } from '../middleware/error.middleware';
import AppointmentModel from '../models/appointment.model';
import { generateRoomToken } from '../utils/jwt.utils';
// import { AuthRequest, PaginationQuery } from '../types';

const checkCollision = async ( doctorId: string, scheduledAt: Date, duration: number, excludeId?: string ): Promise<boolean> => {
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    const query: any = {
        doctorId,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
            {
                scheduledAt: { $lt: endTime },
                $expr: {
                    $gt: [
                        { $add: ['$scheduledAt', { $multiply: ['$duration', 60000] }] },
                        startTime.getTime(),
                    ],
                },
            },
        ]
    };

    if (excludeId) query._id = { $ne: excludeId };

    const conflict = await AppointmentModel.findOne(query);
    return !!conflict;
}

export const bookAppointmentController = async (req: Request, res: Response, nxt: NextFunction): Promise<void> => {
    try {
        const { doctorId, scheduledAt, duration = 30, reason, type = 'video', timezone = 'UTC' } = req.body;
        const patientId = req.user!.id as string;

        // Validate doctor exists
        const doctor = await UserModel.findOne({ _id: doctorId, role: 'doctor', isActive: true });
        if (!doctor) return nxt(createError('Doctor not found', 404));

        const apptDate = new Date(scheduledAt);
        if (apptDate < new Date()) return nxt(createError('Cannot book appointments in the past', 400));

        const hasConflict = await checkCollision(doctorId, apptDate, duration);
        if (hasConflict) {
            return nxt(createError('This time slot is already booked. Please choose another time.', 409));
        }

        const appointment = await AppointmentModel.create({
            patientId,
            doctorId,
            scheduledAt: apptDate,
            duration,
            reason,
            type,
            timezone,
            status: 'pending',
        });

        console.log(`New appointment booked: Patient ${patientId} with Doctor ${doctorId} at ${scheduledAt}`); // Logging for debugging
        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: { appointment },  
        });
    } catch (err) {
        nxt(err);
    }
}

export const getDoctorAppointmentsController = async (req: Request, res: Response, nxt: NextFunction): Promise<void> => {
    try {
        const { page = '1', limit = '10', status, from, to } = req.query as any;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;

        const filter: any = {};

        if (req.user!.role === 'patient') filter.patientId = req.user!.id as string;
        else if (req.user!.role === 'doctor') filter.doctorId = req.user!.id as string;

        if (status) filter.status = status;
        if (from || to) {
            filter.scheduledAt = {};
            if (from) filter.scheduledAt.$gte = new Date(from);
            if (to)   filter.scheduledAt.$lte = new Date(to);
        }

        const [appointments, total] = await Promise.all([
            AppointmentModel.find(filter)
                .populate('patientId', 'firstName lastName email phone avatar')
                .populate('doctorId', 'firstName lastName email avatar')
                .sort({ scheduledAt: -1 })
                .skip(skip)
                .limit(limitNum),
                AppointmentModel.countDocuments(filter),
        ]);
        
        res.json({
            success: true,
            message: 'Appointments fetched',
            data: { appointments },
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
        });
    } catch (err) {
        nxt(err);
    }
}

export const updateAppointmentController = async (req: Request, res: Response, nxt: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, cancelReason } = req.body;

        const appointment = await AppointmentModel.findById(id);

        if (!appointment) return nxt(createError('Appointment not found', 404));

        // Authorization check
        const userId = req.user!.id as string;
        const isDoctor  = req.user!.role === 'doctor' && appointment.doctorId.toString() === userId;
        const isPatient = req.user!.role === 'patient' && appointment.patientId.toString() === userId;
        const isAdmin   = req.user!.role === 'admin';
        if (!isDoctor && !isPatient && !isAdmin) {
            return nxt(createError('Not authorized to update this appointment', 403));
        }

        appointment.status = status;
        if (status === 'cancelled') {
            appointment.cancelledBy = isDoctor ? appointment.doctorId : appointment.patientId;
            appointment.cancelReason = cancelReason;
        }

        if (status === 'completed') {
            appointment.completedAt = new Date();
        }
        res.json({ success: true, message: `Appointment ${status}`, data: { appointment } });
    } catch (err) {
        nxt(err);
    }
}

// Get Room Token (for video join)
export const getRoomTokenController = async (req: Request, res: Response, nxt: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user!.id as string;

        if (!id || Array.isArray(id)) return nxt(createError('Appointment ID is required', 400));
        const appointment = await AppointmentModel.findById(id);
        if (!appointment) return nxt(createError('Appointment not found', 404));

        const isRoomParticipant = appointment.patientId.toString() === userId || appointment.doctorId.toString() === userId;
        if (!isRoomParticipant) return nxt(createError('You are not a participant of this appointment', 403));

        if (appointment.status !== 'confirmed') return nxt(createError('Appointment must be confirmed to join', 400));
        if (!appointment.roomToken) return nxt(createError('No room token available', 400));

        const token = generateRoomToken(userId, id, appointment.roomToken);

        res.json({ success: true, message: 'Room token generated', data: { roomToken: token, roomId: appointment.roomToken } });
    } catch (err) {
        nxt(err);
    }
}

export const getDoctorAvailableSlotsController = async (req: Request, res: Response, nxt: NextFunction): Promise<void> => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query as { date: string };

        if (!doctorId) return nxt(createError('Doctor ID is required', 400));
        if (!date) return nxt(createError('Date is required', 400));

        const targetDate = new Date(date);
        const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
        const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

        const bookedSlots = await AppointmentModel.find({
            doctorId,
            scheduledAt: { $gte: dayStart, $lte: dayEnd },
            status: { $in: ['pending', 'confirmed'] },
        }).select('scheduledAt duration');

        // Generate 30-min slots from 09:00 to 17:00
        const slots = [];
        const slotStart = new Date(dayStart);
        slotStart.setHours(9, 0, 0, 0);

        for (let i = 0; i < 16; i++) {
            const slotTime = new Date(slotStart.getTime() + i * 30 * 60000);
            const slotEnd  = new Date(slotTime.getTime() + 30 * 60000);

            const isBooked = bookedSlots.some((apt) => {
                const aptEnd = new Date(apt.scheduledAt.getTime() + apt.duration * 60000);
                return apt.scheduledAt < slotEnd && aptEnd > slotTime;
            });

            slots.push({
                time: slotTime.toISOString(),
                available: !isBooked && slotTime > new Date(),
            });
        }

        res.json({ success: true, message: 'Slots fetched', data: { slots } });
    } catch (err) {
        nxt(err);
    }
}