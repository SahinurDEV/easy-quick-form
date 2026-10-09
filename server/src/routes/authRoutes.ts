import { Router } from 'express';
import {
  googleLogin,
  logout,
  passwordAuthDisabled,
} from '../controllers/authController';
import refreshTokenHandler from '../controllers/refreshTokenController';
import { loginLimiter } from '../middleware/rateLimiters';

const router = Router();

router.post('/google', loginLimiter, googleLogin);
router.get('/refresh', refreshTokenHandler);
router.get('/logout', logout);

// Sign-in is Google-only.
router.post('/signup', passwordAuthDisabled);
router.post('/login', passwordAuthDisabled);
router.post('/forgot-password', passwordAuthDisabled);
router.patch('/reset-password/:token', passwordAuthDisabled);

export default router;
