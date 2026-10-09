import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { createUser } from './helpers';

const signup = async (email: string) => (await createUser(email)).accessToken;

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('Forms API: ownership', () => {
  let ownerToken: string;
  let otherToken: string;
  let formId: string;

  beforeEach(async () => {
    ownerToken = await signup('owner@example.com');
    otherToken = await signup('other@example.com');

    const res = await request(app)
      .post('/api/v1/forms')
      .set(auth(ownerToken))
      .send({ name: 'Owner form', elements: [{ id: 'q1', type: 'text' }] });
    formId = res.body.data.form._id;

    await request(app)
      .post(`/api/v1/forms/${formId}/responses`)
      .send({
        response: [{ elementType: 'text', question: 'Name', answer: 'hello' }],
      });
  });

  it('keeps public viewing and submission open', async () => {
    const view = await request(app).get(`/api/v1/forms/${formId}`);
    expect(view.status).toBe(200);

    const submit = await request(app)
      .post(`/api/v1/forms/${formId}/responses`)
      .send({
        response: [{ elementType: 'text', question: 'Name', answer: 'again' }],
      });
    expect(submit.status).toBe(201);
  });

  it('does not let another user edit the form', async () => {
    const res = await request(app)
      .patch(`/api/v1/forms/${formId}`)
      .set(auth(otherToken))
      .send({ name: 'Changed' });
    expect(res.status).toBe(404);

    const view = await request(app).get(`/api/v1/forms/${formId}`);
    expect(view.body.data.form.name).toBe('Owner form');
  });

  it('does not let another user delete the form', async () => {
    const res = await request(app)
      .delete(`/api/v1/forms/${formId}`)
      .set(auth(otherToken));
    expect(res.status).toBe(404);

    const bulk = await request(app)
      .patch('/api/v1/forms/bulk-delete')
      .set(auth(otherToken))
      .send({ forms: [formId] });
    expect(bulk.status).toBe(204);

    const view = await request(app).get(`/api/v1/forms/${formId}`);
    expect(view.status).toBe(200);
  });

  it("does not let another user read the form's responses", async () => {
    const res = await request(app)
      .get(`/api/v1/forms/${formId}/responses`)
      .set(auth(otherToken));
    expect(res.status).toBe(404);
  });

  it('still lets the owner edit, read responses and delete', async () => {
    const edit = await request(app)
      .patch(`/api/v1/forms/${formId}`)
      .set(auth(ownerToken))
      .send({ name: 'Renamed' });
    expect(edit.status).toBe(200);
    expect(edit.body.data.form.name).toBe('Renamed');

    const responses = await request(app)
      .get(`/api/v1/forms/${formId}/responses`)
      .set(auth(ownerToken));
    expect(responses.status).toBe(200);
    expect(responses.body.data.responses).toHaveLength(1);

    const del = await request(app)
      .delete(`/api/v1/forms/${formId}`)
      .set(auth(ownerToken));
    expect(del.status).toBe(204);
  });
});
