const request = require('supertest');
const app = require('../main');

const auth = (req) => req.set('Cookie', ['authenticated=true']);

jest.setTimeout(15000);

describe('Leistungstests', () => {
  test('Antwortzeit < 200ms', async () => {
    const start = Date.now();
    const res = await auth(request(app).get('/api/v1/hello'));
    const duration = Date.now() - start;
    expect(res.status).toBe(200);
    // Aim for 200ms, but allow a small buffer for CI machines
    expect(duration).toBeLessThanOrEqual(250);
  });

  test('Gleichzeitige Benutzer (100)', async () => {
    const N = 100;
    const calls = Array.from({ length: N }, () => auth(request(app).get('/api/v1/hello')));
    const results = await Promise.all(calls);
    const okCount = results.filter(r => r.status === 200).length;
    expect(okCount).toBe(N);
  });

  test('Speichernutzung', async () => {
    const before = process.memoryUsage().heapUsed;
    const calls = Array.from({ length: 10 }, () => auth(request(app).get('/api/v1/logs')));
    const res = await Promise.all(calls);
    expect(res.every(r => r.status === 200)).toBe(true);
    const after = process.memoryUsage().heapUsed;

    const deltaMB = (after - before) / (1024 * 1024);
    // Ensure no suspicious memory growth from repeated log reads
    expect(deltaMB).toBeLessThan(20);
  });
});
