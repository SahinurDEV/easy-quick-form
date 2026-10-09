import crypto from 'crypto';
import { type Response, type Request, type NextFunction } from 'express';
import { hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

import User from '../models/userModel';
import catchAsyncError from '../utils/catchAsyncError';
import AppError from '../utils/appError';
import {
  accessTokenExpiresIn,
  clearCookieOptions,
  cookieOptions,
  refreshTokenExpiresIn,
} from '../utils/constants';
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


// Sign-in is Google-only; the old email/password endpoints answer 410 Gone.
export const passwordAuthDisabled = (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => next(new AppError('Password sign-in is disabled; use Google', 410));


export const logout = catchAsyncError(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res.sendStatus(204);
    return;
  }

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
   res.clearCookie('refreshToken', clearCookieOptions);
    res.sendStatus(204);
    return;
  }

  foundUser.refreshToken = foundUser.refreshToken.filter(
    r => r !== refreshToken,
  );
  await foundUser.save();
res.clearCookie('refreshToken', clearCookieOptions);
  res.sendStatus(204);
});

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
