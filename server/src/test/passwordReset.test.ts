import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../utils/sendEmail', () => ({
  default: vi.fn().mockResolvedValue(undefined),
  isEmailConfigured: () => true,
}));

import app from '../app';
import sendEmail from '../utils/sendEmail';

describe('POST /api/v1/auth/forgot-password', () => {
  it('builds the reset link from CLIENT_URL, not request headers', async () => {
    const email = 'reset@example.com';
    await request(app).post('/api/v1/auth/signup').send({
      name: 'Reset User',
      email,
      password: 'Password123@',
      cPassword: 'Password123@',
    });

    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .set('Referer', 'https://other.example.net/')
      .set('Origin', 'https://other.example.net')
      .send({ email });
    expect(res.status).toBe(200);

    const resetMail = vi
      .mocked(sendEmail)
      .mock.calls.map(([options]) => options)
      .find(options => options.subject.startsWith('Password reset'));
    expect(resetMail?.message).toMatch(
      /https:\/\/app\.example\.com\/reset-password\/[a-f0-9]{64}/,
    );
    expect(resetMail?.message).not.toContain('other.example.net');
  });
});
