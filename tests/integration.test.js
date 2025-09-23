const request = require('supertest');
const app = require('../main');

const auth = (req) => req.set('Cookie', ['authenticated=true']);

describe('Integrationstests', () => {
  test('Datenbankverbindung', async () => {
    const res = await auth(request(app).get('/api/v1/users'));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  test('Cache-Schicht', async () => {
    const res = await auth(request(app).get('/api/v1/health/full'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('checks.cache.ok', true);
  });

  test('Externe API', async () => {
    const res = await auth(request(app).get('/api/v1/shut').set('x-test-mode', 'true'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('testMode', true);
  });

  test('GET /api/v1/hello', async () => {
    const res = await auth(request(app).get('/api/v1/hello'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('POST /api/v1/auth (valid creds)', async () => {
    const res = await auth(request(app).post('/api/v1/auth').send({ username: 'test', password: 'password' }));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
  });

  test('POST/GET/DELETE user (CRUD)', async () => {
    const create = await auth(request(app)
      .post('/api/v1/users')
      .send({ name: 'Tester', email: 'tester_crud@example.com' }));
    expect(create.status).toBe(201);
    const id = create.body.user.id;

    const getOne = await auth(request(app).get(`/api/v1/users/${id}`));
    expect(getOne.status).toBe(200);
    expect(getOne.body).toHaveProperty('user.id', id);

    const del = await auth(request(app).delete(`/api/v1/users/${id}`));
    expect(del.status).toBe(200);
  });

  test('DELETE /api/v1/data', async () => {
    const res = await auth(request(app).delete('/api/v1/data'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('Concurrent User Creation (integration)', async () => {
    const NUM_USERS = 50;
    const createUsersPromises = [];
    for (let i = 0; i < NUM_USERS; i++) {
      const testUser = {
        name: `Integration User ${i}`,
        email: `integration_user_${i}@example.com`
      };
      createUsersPromises.push(auth(request(app).post('/api/v1/users').send(testUser)));
    }
    const createResponses = await Promise.all(createUsersPromises);
    expect(createResponses.filter(res => res.status === 201).length).toBe(NUM_USERS);
  });
});
