import { Router } from "express";
import {
    bookAppointmentController,
    getDoctorAppointmentsController,
    updateAppointmentController,
    getRoomTokenController,
    getDoctorAvailableSlotsController
} from "../controllers/appointment.controller";
import authMiddleware, { roleMiddleware } from "../middleware/auth.middleware";

const appointmentRouter = Router();

appointmentRouter.use(authMiddleware);

appointmentRouter.post('/book-appointment', roleMiddleware('patient'), bookAppointmentController);
appointmentRouter.get('/get-doctor-appointments', getDoctorAppointmentsController);
appointmentRouter.put('/:id/update-appointment', roleMiddleware('doctor'), updateAppointmentController);
appointmentRouter.get('/:id/appointment-room-token', getRoomTokenController);
appointmentRouter.get('/doctors/:doctorId/available-slots', getDoctorAvailableSlotsController);

export default appointmentRouter;