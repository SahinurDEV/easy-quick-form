import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { createUser } from './helpers';
import FormResponse from '../models/formResponseModel';

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
  it('returns 400 when creating a form without elements', async () => {
    const res = await request(app)
      .post('/api/v1/forms')
      .set(auth(ownerToken))
      .send({ name: 'Form without elements' });

    expect(res.status).toBe(400);
    expect(res.body.errors.elements).toBeDefined();
  });
});

describe('Forms API: response counts', () => {
  const createForm = async (token: string, name: string) => {
    const res = await request(app)
      .post('/api/v1/forms')
      .set(auth(token))
      .send({ name, elements: [{ id: 'q1', type: 'text' }] });
    return res.body.data.form._id as string;
  };

  const submitResponse = (formId: string) =>
    request(app)
      .post(`/api/v1/forms/${formId}/responses`)
      .send({
        response: [{ elementType: 'text', question: 'Name', answer: 'hi' }],
      });

  it('includes the response count for every form', async () => {
    const token = await signup('counts@example.com');
    const empty = await createForm(token, 'No responses');
    const answered = await createForm(token, 'Answered');
    await submitResponse(answered);
    await submitResponse(answered);

    const res = await request(app).get('/api/v1/forms').set(auth(token));
    expect(res.status).toBe(200);

    const counts = Object.fromEntries(
      res.body.data.forms.map(
        (form: { _id: string; responseCount: number }) => [
          form._id,
          form.responseCount,
        ],
      ),
    );
    expect(counts).toEqual({ [empty]: 0, [answered]: 2 });
  });

  it('sorts forms by response count', async () => {
    const token = await signup('sort-counts@example.com');
    const empty = await createForm(token, 'No responses');
    const answered = await createForm(token, 'Answered');
    await submitResponse(answered);

    const res = await request(app)
      .get('/api/v1/forms?sort=-responseCount')
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(
      res.body.data.forms.map((form: { _id: string }) => form._id),
    ).toEqual([answered, empty]);
  });
});

describe('Forms API: deleting removes responses', () => {
  const createFormWithResponse = async (token: string, name: string) => {
    const res = await request(app)
      .post('/api/v1/forms')
      .set(auth(token))
      .send({ name, elements: [{ id: 'q1', type: 'text' }] });
    const id: string = res.body.data.form._id;
    await request(app)
      .post(`/api/v1/forms/${id}/responses`)
      .send({
        response: [{ elementType: 'text', question: 'Name', answer: 'hi' }],
      });
    return id;
  };

  it('deletes the responses of a single deleted form only', async () => {
    const token = await signup('single@example.com');
    const deleted = await createFormWithResponse(token, 'Deleted');
    const kept = await createFormWithResponse(token, 'Kept');

    const res = await request(app)
      .delete(`/api/v1/forms/${deleted}`)
      .set(auth(token));
    expect(res.status).toBe(204);

    expect(await FormResponse.countDocuments({ form: deleted })).toBe(0);
    expect(await FormResponse.countDocuments({ form: kept })).toBe(1);
  });

  it('bulk delete removes only the owned deleted forms responses', async () => {
    const token = await signup('bulk@example.com');
    const otherToken = await signup('bulk-other@example.com');
    const a = await createFormWithResponse(token, 'A');
    const b = await createFormWithResponse(token, 'B');
    const kept = await createFormWithResponse(token, 'Kept');
    const others = await createFormWithResponse(otherToken, 'Other');

    const res = await request(app)
      .patch('/api/v1/forms/bulk-delete')
      .set(auth(token))
      .send({ forms: [a, b, others] });
    expect(res.status).toBe(204);

    expect(await FormResponse.countDocuments({ form: { $in: [a, b] } })).toBe(
      0,
    );
    expect(await FormResponse.countDocuments({ form: kept })).toBe(1);
    expect(await FormResponse.countDocuments({ form: others })).toBe(1);
  });
});
