import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { createUser } from './helpers';

describe('Auth API', () => {
  describe('password-based endpoints (Google-only sign-in)', () => {
    it.each([
      ['post', '/api/v1/auth/signup'],
      ['post', '/api/v1/auth/login'],
      ['post', '/api/v1/auth/forgot-password'],
      ['patch', '/api/v1/auth/reset-password/some-token'],
    ] as const)('%s %s returns 410', async (method, url) => {
      const res = await request(app)[method](url).send({
        email: 'test@example.com',
        password: 'Password123@',
      });
      expect(res.status).toBe(410);
      expect(res.body.message).toBe('Password sign-in is disabled; use Google');
    });

    it('PATCH /api/v1/user/change-password returns 410', async () => {
      const { accessToken } = await createUser();
      const res = await request(app)
        .patch('/api/v1/user/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});
      expect(res.status).toBe(410);
    });
  });

  describe('POST /api/v1/auth/google', () => {
    it('returns 503 when Google OAuth is not configured', async () => {
      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({ code: 'whatever' });
      expect(res.status).toBe(503);
    });
  });

  describe('protected routes (verifyJWT)', () => {
    it('blocks access without a token', async () => {
      const res = await request(app).get('/api/v1/user/profile');
      expect(res.status).toBe(401);
    });

    it('rejects an invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', 'Bearer not-a-real-token');
      expect(res.status).toBe(403);
    });

    it('allows access with a valid token', async () => {
      const { accessToken, user } = await createUser();
      const profile = await request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(profile.status).toBe(200);
      expect(profile.body.data.user.email).toBe(user.email);
    });
  });

  describe('GET /api/v1/auth/refresh', () => {
    it('issues a new access token from the refresh cookie', async () => {
      const { cookie } = await createUser();
      const res = await request(app)
        .get('/api/v1/auth/refresh')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeTruthy();
      expect(res.headers['set-cookie']?.join(';')).toMatch(/refreshToken=/);
    });

    it('rejects when no refresh cookie is present', async () => {
      const res = await request(app).get('/api/v1/auth/refresh');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/logout', () => {
    it('clears the refresh cookie', async () => {
      const { cookie } = await createUser();
      const res = await request(app)
        .get('/api/v1/auth/logout')
        .set('Cookie', cookie);
      expect(res.status).toBe(204);
    });
  });
});
