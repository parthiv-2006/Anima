import request from 'supertest';
import app from '../../app.js';
import { User } from '../../models/User.js';

async function registerAndLogin(species = 'TERRA') {
  const email = `pet_${Date.now()}_${Math.random().toString(36).slice(2)}@anima.dev`;
  await request(app).post('/api/auth/register').send({
    username: 'PetOwner',
    email,
    password: 'Password123!',
    species
  });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Password123!' });
  return { token: res.body.token, email };
}

describe('Pet — auth guard', () => {
  it('GET /api/pet without token → 401', async () => {
    const res = await request(app).get('/api/pet');
    expect(res.status).toBe(401);
  });
});

describe('Pet — GET', () => {
  let token;
  beforeEach(async () => { ({ token } = await registerAndLogin('TERRA')); });

  it('returns initial pet state with correct species and defaults', async () => {
    const res = await request(app)
      .get('/api/pet')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.species).toBe('TERRA');
    expect(res.body.stage).toBe(1);
    expect(res.body.totalXp).toBe(0);
    expect(res.body.hp).toBe(100);
    expect(res.body.stats).toMatchObject({ str: 10, int: 10, spi: 10 });
  });
});

describe('Pet — update', () => {
  let token;
  beforeEach(async () => { ({ token } = await registerAndLogin('AQUA')); });

  it('updates XP and stats, recalculates stage 2 evolution', async () => {
    const res = await request(app)
      .post('/api/pet/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ totalXp: 150, stats: { str: 5, int: 30, spi: 5 } });
    expect(res.status).toBe(200);
    expect(res.body.stage).toBe(2);
    expect(res.body.evolutionPath).toBe('AQUA_INT');
    expect(res.body.totalXp).toBe(150);
  });

  it('evolves to stage 3 PURE path when dominant stat is at least 2x the minimum', async () => {
    const res = await request(app)
      .post('/api/pet/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ totalXp: 600, stats: { str: 5, int: 60, spi: 5 } });
    expect(res.status).toBe(200);
    expect(res.body.stage).toBe(3);
    expect(res.body.evolutionPath).toBe('AQUA_INT_PURE');
  });

  it('evolves to stage 3 HYBRID path when stats are balanced', async () => {
    const res = await request(app)
      .post('/api/pet/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ totalXp: 600, stats: { str: 20, int: 20, spi: 15 } });
    expect(res.status).toBe(200);
    expect(res.body.stage).toBe(3);
    expect(res.body.evolutionPath).toBe('AQUA_HYBRID');
  });
});

describe('Pet — decay', () => {
  let token, email;
  beforeEach(async () => { ({ token, email } = await registerAndLogin('EMBER')); });

  it('is a no-op within 24 hours — HP stays at 100', async () => {
    const res = await request(app)
      .post('/api/pet/decay')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.pet.hp).toBe(100);
  });

  it('deducts 10% HP when last login was more than 24 hours ago', async () => {
    await User.findOneAndUpdate(
      { email },
      { lastLogin: new Date(Date.now() - 25 * 60 * 60 * 1000) }
    );
    const res = await request(app)
      .post('/api/pet/decay')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.pet.hp).toBe(90);
  });

  it('resets all isCompletedToday flags after decay', async () => {
    // Complete a habit first
    const habitRes = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Morning Run', statCategory: 'STR', difficulty: 1 });
    const id = habitRes.body[0]._id;
    await request(app)
      .post(`/api/habits/${id}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    await User.findOneAndUpdate(
      { email },
      { lastLogin: new Date(Date.now() - 25 * 60 * 60 * 1000) }
    );

    const res = await request(app)
      .post('/api/pet/decay')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.habits.every(h => h.isCompletedToday === false)).toBe(true);
  });
});
