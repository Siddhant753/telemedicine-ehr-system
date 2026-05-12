import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

import authRouter from './routes/auth.routes';
import docRouter from './routes/doctor.routes';

const app = express();

app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
}))

app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
    res.send({ message: 'Backend running on port ' + process.env.PORT });
})

app.use('/api/auth', authRouter);
app.use('/api/doctors', docRouter);

export default app;