import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import catchAsyncError from '../utils/catchAsyncError';
import { userProfileSchema } from '@form-builder/validation';
import AppError from '../utils/appError';
import User from '../models/userModel';
import { compare, hash } from 'bcrypt';
import { clearCookieOptions, cookieOptions } from '../utils/constants';
import sharp from 'sharp';
import { saveAvatar } from '../utils/storage';

/* const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'public', 'img', 'users'));
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.userId}-${Date.now()}.${ext}`);
  },
}); */
const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new AppError('Not an image! Please upload only images.', 400));
  },
});
export const uploadUserPhoto = upload.single('avatar');

export const resizeUserPhoto = catchAsyncError(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.file) return next();

    const filename = `user-${req.userId}-${Date.now()}.jpeg`;

    // Normalize to a 500x500 JPEG, then persist (Cloudinary or local disk).
    // req.file.filename holds the resulting public URL for updateProfile.
    const buffer = await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    req.file.filename = await saveAvatar(buffer, filename, req);

    next();
  },
);
export const updateProfile = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate user profile fields
    const result = await userProfileSchema.safeParseAsync(req.body);
    if (!result.success)
      return next(
        new AppError(
          'Validation failed!',
          400,
          result.error.flatten().fieldErrors,
        ),
      );

    const { name, email } = result.data;

    // The email is managed by Google (sign-in matches accounts by email), so
    // it can't be changed here.
    if (email !== undefined) {
      const currentUser = await User.findById(req.userId).exec();
      if (email.toLowerCase() !== currentUser?.email)
        return next(
          new AppError(
            'Email is managed by Google and cannot be changed',
            400,
            {
              email: ['Email is managed by Google and cannot be changed'],
            },
          ),
        );
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        name,
        avatar: req.file ? req.file.filename : req.body.avatar,
      },
      { new: true },
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: updatedUser?._id,
          name: updatedUser?.name,
          email: updatedUser?.email,
          avatar: updatedUser?.avatar,
        },
      },
    });
  },
);

export const deleteAccount = catchAsyncError(
  async (req: Request, res: Response) => {
    await User.findByIdAndUpdate(req.userId, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    res.sendStatus(204);
  },
);

export const getProfile = catchAsyncError(
  async (req: Request, res: Response) => {
    const foundUser = await User.findById(req.userId)
      .select('-refreshToken -__v')
      .exec();

    res.status(200).json({
      status: 'success',
      data: {
        user: foundUser,
      },
    });
  },
);
