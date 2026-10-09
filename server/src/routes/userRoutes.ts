import { Router } from 'express';
import { passwordAuthDisabled } from '../controllers/authController';
import {
  deleteAccount,
  getProfile,
  resizeUserPhoto,
  updateProfile,
  uploadUserPhoto,
} from '../controllers/userController';

const router = Router();

router.patch('/change-password', passwordAuthDisabled);
router.patch('/profile', uploadUserPhoto, resizeUserPhoto, updateProfile);
router.get('/profile', getProfile);
router.delete('/delete-account', deleteAccount);

export default router;
