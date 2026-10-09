import crypto from 'crypto';
import { type Response, type Request, type NextFunction } from 'express';
import { hash, compare } from 'bcrypt';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@form-builder/validation';
import { sign } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

import User from '../models/userModel';
import catchAsyncError from '../utils/catchAsyncError';
import AppError from '../utils/appError';
import {
  accessTokenExpiresIn,
  cookieOptions,
  refreshTokenExpiresIn,
} from '../utils/constants';
import sendEmail, { isEmailConfigured } from '../utils/sendEmail';
import { env } from '../utils/env';
import { pruneRefreshTokens } from '../utils/refreshTokens';

export const signAccessToken = (id: string) =>
  sign({ id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: accessTokenExpiresIn,
  });

export const signRefreshToken = (id: string) =>
  sign({ id }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: refreshTokenExpiresIn,
  });

export const signUp = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await registerSchema.safeParseAsync(req.body);
    if (!result.success)
      return next(
        new AppError(
          'Validation failed!',
          400,
          result.error.flatten().fieldErrors,
        ),
      );

    const foundUser = await User.findOne({ email: result.data.email }).exec();
    if (foundUser)
      return next(
        new AppError('User already exists!', 409, {
          email: ['Email already exists'],
        }),
      );

    const { name, email } = result.data;
    const password = await hash(result.data.password, 12);

    const newUser = await User.create({ name, email, password });

    sendEmail({
      email: newUser.email,
      subject: 'Welcome to Easy Quick Form',
      message: 'Thank you for signing up with Easy Quick Form!',
    });

    const newRefreshToken = signRefreshToken(newUser._id.toString());
    newUser.refreshToken = [newRefreshToken];
    await newUser.save();

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.status(201).json({
      status: 'success',
      accessToken: signAccessToken(newUser._id.toString()),
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
        },
      },
    });
  },
);

export const login = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cookies } = req;

    const result = await loginSchema.safeParseAsync(req.body);
    if (!result.success)
      return next(
        new AppError(
          'Validation failed!',
          400,
          result.error.flatten().fieldErrors,
        ),
      );
    const { email, password } = result.data;

    const foundUser = await User.findOne({ email }).select('+password').exec();
    if (!foundUser || !(await compare(password, foundUser.password)))
      return next(new AppError('Incorrect email or password!', 401));

    const newRefreshToken = signRefreshToken(foundUser._id.toString());
    let newRefreshTokenArray = !cookies?.refreshToken
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter(r => r !== cookies.refreshToken);
    if (cookies?.refreshToken) {
      /* For this scenario: 
        1) User logs in but never uses refresh token and does not log out
        2) Refresh token is stolen
        3) If 1 and 2 happen, reuse detection is needed to clear all refresh tokens when user logs in 
      */
      const foundToken = await User.findOne({
        refreshToken: cookies.refreshToken,
      }).exec();
      // Detected refresh token reuse
      if (!foundToken) newRefreshTokenArray = [];

      res.clearCookie('refreshToken', cookieOptions);
    }

    foundUser.refreshToken = [
      ...pruneRefreshTokens(newRefreshTokenArray),
      newRefreshToken,
    ];
    await foundUser.save();

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.status(200).json({
      status: 'success',
      accessToken: signAccessToken(foundUser._id.toString()),
      data: {
        user: {
          id: foundUser._id,
          name: foundUser.name,
          email: foundUser.email,
          avatar: foundUser.avatar,
        },
      },
    });
  },
);

export const logout = catchAsyncError(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res.sendStatus(204);
    return;
  }

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie('refreshToken', cookieOptions);
    res.sendStatus(204);
    return;
  }

  foundUser.refreshToken = foundUser.refreshToken.filter(
    r => r !== refreshToken,
  );
  await foundUser.save();

  res.clearCookie('refreshToken', cookieOptions);
  res.sendStatus(204);
});

export const forgotPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // Reset links always point at the configured frontend, never at a
    // request header.
    const clientUrl =
      env.CLIENT_URL ??
      (env.NODE_ENV === 'production' ? undefined : 'http://localhost:4400');
    if (!isEmailConfigured() || !clientUrl)
      return next(
        new AppError('Password reset by email is not available yet.', 503),
      );

    // Validate email
    const result = await forgotPasswordSchema.safeParseAsync(req.body);
    if (!result.success)
      return next(
        new AppError(
          'Validation failed!',
          400,
          result.error.flatten().fieldErrors,
        ),
      );

    // Get user based on email
    const foundUser = await User.findOne({ email: result.data.email }).exec();
    if (!foundUser)
      return next(
        new AppError('There is no user with that email address!', 404),
      );

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    foundUser.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    foundUser.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await foundUser.save();

    // Send it to user's email
    const resetUrl = `${clientUrl.replace(
      /\/+$/,
      '',
    )}/reset-password/${resetToken}`;

    const message =
      'You are receiving this email because you have just requested to reset your Easy Quick Form password. Please click on the link below or copy and paste the URL in a new browser window to reset your password:\n\n' +
      `${resetUrl}\n\n` +
      'If you did not request this, please ignore this email and your password will remain unchanged.';

    try {
      await sendEmail({
        email: foundUser.email,
        subject:
          'Password reset token for Easy Quick Form account (valid for 10 minutes)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Email sent successfully',
      });
    } catch (err) {
      foundUser.passwordResetToken = undefined;
      foundUser.passwordResetExpires = undefined;
      await foundUser.save();

      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500,
        ),
      );
    }
  },
);

export const resetPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const foundUser = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).exec();

    // If token has not expired, and there is user, and success in validation, set the new password
    if (!foundUser)
      return next(new AppError('Token is invalid or has expired!', 400));

    // Validate password and confirm password
    const result = await resetPasswordSchema.safeParseAsync(req.body);
    if (!result.success)
      return next(
        new AppError(
          'Validation failed!',
          400,
          result.error.flatten().fieldErrors,
        ),
      );

    foundUser.password = await hash(result.data.newPassword, 12);
    foundUser.passwordResetToken = undefined;
    foundUser.passwordResetExpires = undefined;
    foundUser.passwordChangedAt = new Date();
    await foundUser.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  },
);

export const googleLogin = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)
      return next(new AppError('Google sign-in is not available yet.', 503));

    if (!req.body.code)
      return next(new AppError('Authorization code is required!', 400));

    const oAuth2Client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      'postmessage',
    );

    // Exchange the one-time auth code for tokens, then verify the ID token
    // against Google to securely obtain the user's profile.
    let payload;
    try {
      const { tokens } = await oAuth2Client.getToken(req.body.code);
      if (!tokens.id_token) throw new Error('No ID token from Google');

      const ticket = await oAuth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      // Expired/invalid codes or tokens are a client problem, not a 500.
      return next(
        new AppError('Google sign-in failed. Please try again.', 401),
      );
    }
    if (!payload?.email)
      return next(new AppError('Google account has no email!', 400));

    const { email, name, picture } = payload;

    // Find the existing account or provision one for this Google user.
    let user = await User.findOne({ email }).exec();
    if (!user) {
      const randomPassword = await hash(
        crypto.randomBytes(32).toString('hex'),
        12,
      );
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        avatar: picture || null,
      });
    }

    const newRefreshToken = signRefreshToken(user._id.toString());
    user.refreshToken = [
      ...pruneRefreshTokens(user.refreshToken),
      newRefreshToken,
    ];
    await user.save();

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.status(200).json({
      status: 'success',
      accessToken: signAccessToken(user._id.toString()),
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      },
    });
  },
);
