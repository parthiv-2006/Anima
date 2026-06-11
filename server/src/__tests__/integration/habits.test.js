import request from 'supertest';
import app from '../../app.js';

const BASE = '/api/habits';

async function registerAndLogin() {
  const email = `user_${Date.now()}@anima.dev`;
  await request(app).post('/api/auth/register').send({
    username: 'Tester',
    email,
    password: 'Password123!',
    species: 'TERRA'
  });
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Password123!' });
  return loginRes.body.token;
}

describe('Habits — auth guard', () => {
  it('GET /api/habits without token → 401', async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(401);
  });
});

describe('Habits — CRUD', () => {
  let token;
  let habitId;

  beforeEach(async () => {
    token = await registerAndLogin();
  });

  it('GET /api/habits returns empty array for new user', async () => {
    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it('POST /api/habits creates a habit', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Morning Run', statCategory: 'STR', difficulty: 2 });
    expect(res.status).toBe(201);
    expect(res.body[0].name).toBe('Morning Run');
    habitId = res.body[0]._id;
  });

  it('completes a habit and awards XP + stats + coins', async () => {
    const createRes = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Read Books', statCategory: 'INT', difficulty: 2 });
    const id = createRes.body[0]._id;

    const res = await request(app)
      .post(`${BASE}/${id}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({ note: 'Great chapter!' });

    expect(res.status).toBe(200);
    // XP = 10 × difficulty = 20
    expect(res.body.pet.totalXp).toBe(20);
    // INT stat = base(10) + 5×difficulty(10) = 20
    expect(res.body.pet.stats.int).toBe(20);
    // coins = baseCoins(10) + streakBonus(1) = 11
    expect(res.body.coins).toBe(11);
  });

  it('prevents duplicate completion of same habit', async () => {
    const createRes = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Meditation', statCategory: 'SPI', difficulty: 1 });
    const id = createRes.body[0]._id;

    await request(app)
      .post(`${BASE}/${id}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    const res2 = await request(app)
      .post(`${BASE}/${id}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res2.status).toBe(400);
    expect(res2.body.message).toMatch(/already completed/i);
  });

  it('resets a habit and reverts XP/stats/coins', async () => {
    const createRes = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Push-ups', statCategory: 'STR', difficulty: 3 });
    const id = createRes.body[0]._id;

    await request(app)
      .post(`${BASE}/${id}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    const res = await request(app)
      .post(`${BASE}/${id}/reset`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    // XP returns to 0 (base pet XP is 0, + 30 awarded, − 30 reverted)
    expect(res.body.pet.totalXp).toBe(0);
    expect(res.body.coins).toBe(0);
  });

  it('GET /api/habits/log returns flat completion entries', async () => {
    const createRes = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Yoga', statCategory: 'SPI', difficulty: 1 });
    const id = createRes.body[0]._id;

    await request(app)
      .post(`${BASE}/${id}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({ note: 'Felt great' });

    const res = await request(app)
      .get(`${BASE}/log`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].habitName).toBe('Yoga');
    expect(res.body[0].xp).toBe(10);
  });
});
