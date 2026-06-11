import request from 'supertest';
import app from '../../app.js';

const BASE = '/api/auth';
const validUser = {
  username: 'TestWarrior',
  email: 'test@anima.dev',
  password: 'Password123!',
  species: 'EMBER'
};

describe('Auth — register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app).post(`${BASE}/register`).send(validUser);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.pet.species).toBe('EMBER');
  });

  it('rejects duplicate email', async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
    const res = await request(app).post(`${BASE}/register`).send(validUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });
});

describe('Auth — login', () => {
  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: 'wrongpass' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('rejects unknown email', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: 'nobody@anima.dev', password: 'anything' });
    expect(res.status).toBe(400);
  });
});
