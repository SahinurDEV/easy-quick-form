import User from '../models/userModel';
import {
  signAccessToken,
  signRefreshToken,
} from '../controllers/authController';

/**
 * Creates a user directly in the database (sign-in is Google-only, so there is
 * no signup endpoint) and returns an access token and refresh cookie for it.
 */
export const createUser = async (email = 'test@example.com') => {
  const user = await User.create({
    name: 'Test User',
    email,
    password: 'unused-google-only-password',
  });
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshToken = [refreshToken];
  await user.save();

  return {
    user,
    accessToken: signAccessToken(user._id.toString()),
    cookie: `refreshToken=${refreshToken}`,
  };
};
