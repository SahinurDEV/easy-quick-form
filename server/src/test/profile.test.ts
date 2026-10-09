import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { createUser } from './helpers';

describe('PATCH /api/v1/user/profile', () => {
  it('rejects an email change', async () => {
    const { accessToken } = await createUser('owner@example.com');
    const res = await request(app)
      .patch('/api/v1/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'someone-else@example.com' });
    expect(res.status).toBe(400);

    const profile = await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(profile.body.data.user.email).toBe('owner@example.com');
  });

  it('still updates the name (and accepts the unchanged email)', async () => {
    const { accessToken } = await createUser('owner@example.com');
    const res = await request(app)
      .patch('/api/v1/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'New Name', email: 'owner@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('New Name');
    expect(res.body.data.user.email).toBe('owner@example.com');
  });
});
