import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authMiddleware from '../middleware/auth.middleware';
import { 
    signupController,
    verifyEmailController,
    loginController,
    logoutController,
    verifyAccessTokenController,
    refreshTokenController,
    getCurrentUserController,
} from '../controllers/auth.controller';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Try again later.' },
});

const authRouter = Router();

authRouter.post('/signup', authLimiter, signupController);
authRouter.post('/verify-email/:token', verifyEmailController);
authRouter.post('/login', authLimiter, loginController);
authRouter.get('/verify-token', authMiddleware, verifyAccessTokenController);
authRouter.post('/refresh-token', refreshTokenController);
authRouter.post('/logout', authMiddleware, logoutController);
authRouter.get('/profile', authMiddleware, getCurrentUserController);

export default authRouter;