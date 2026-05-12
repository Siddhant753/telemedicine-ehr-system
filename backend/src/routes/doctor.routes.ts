import { Router } from "express";
import authMiddleware from '../middleware/auth.middleware';
import { getDoctorDetailsController, getDoctorsController, updateDoctorProfileController } from "../controllers/doctor.controller";

const docRouter = Router();

docRouter.get('/get-all', getDoctorsController);
docRouter.get('/get-doctor/:id', getDoctorDetailsController);
docRouter.put('/update-doctor/:id', authMiddleware, updateDoctorProfileController);

export default docRouter;