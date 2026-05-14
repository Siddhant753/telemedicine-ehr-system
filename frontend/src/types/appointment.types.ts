import type { User } from './auth.types';

export type Appointment = {
    _id: string;
    patientId: User | string;
    doctorId:  User | string;
    scheduledAt: string;
    duration: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    type: 'video' | 'in_person';
    reason: string;
    notes?: string;
    roomToken?: string;
    timezone: string;
    createdAt: string;
}

export interface TimeSlot {
    time: string;
    available: boolean;
}