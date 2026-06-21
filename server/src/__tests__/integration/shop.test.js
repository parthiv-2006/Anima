import request from 'supertest';
import app from '../../app.js';
import { User } from '../../models/User.js';

const BASE = '/api/shop';

async function registerAndLogin() {
  const email = `shop_${Date.now()}_${Math.random().toString(36).slice(2)}@anima.dev`;
  await request(app).post('/api/auth/register').send({
    username: 'Shopper',
    email,
    password: 'Password123!',
    species: 'EMBER'
  });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Password123!' });
  return { token: res.body.token, email };
}

async function giveCoins(email, amount) {
  await User.findOneAndUpdate({ email }, { coins: amount });
}

describe('Shop — auth guard', () => {
  it('GET /api/shop/items without token → 401', async () => {
    const res = await request(app).get(`${BASE}/items`);
    expect(res.status).toBe(401);
  });
});

describe('Shop — items listing', () => {
  let token;
  beforeEach(async () => { ({ token } = await registerAndLogin()); });

  it('returns all shop items with ownership flags and current coins', async () => {
    const res = await request(app)
      .get(`${BASE}/items`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(typeof res.body.coins).toBe('number');
    expect(res.body.inventory).toBeDefined();
  });

  it('backgrounds are marked as not owned for a new user', async () => {
    const res = await request(app)
      .get(`${BASE}/items`)
      .set('Authorization', `Bearer ${token}`);
    const backgrounds = res.body.items.filter(i => i.category === 'background');
    expect(backgrounds.every(b => b.owned === false)).toBe(true);
  });
});

describe('Shop — purchase consumable', () => {
  let token, email;
  beforeEach(async () => { ({ token, email } = await registerAndLogin()); });

  it('purchases a health potion and deducts 50 coins', async () => {
    await giveCoins(email, 200);
    const res = await request(app)
      .post(`${BASE}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'healthPotion', quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.body.coins).toBe(150);
    expect(res.body.inventory.healthPotions).toBe(1);
  });

  it('rejects purchase when coins are insufficient', async () => {
    const res = await request(app)
      .post(`${BASE}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'healthPotion', quantity: 1 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not enough coins/i);
  });

  it('rejects unknown item id', async () => {
    await giveCoins(email, 999);
    const res = await request(app)
      .post(`${BASE}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'unicornPowder' });
    expect(res.status).toBe(404);
  });
});

describe('Shop — purchase background', () => {
  let token, email;
  beforeEach(async () => { ({ token, email } = await registerAndLogin()); });

  it('purchases a background and adds it to inventory', async () => {
    await giveCoins(email, 500);
    const res = await request(app)
      .post(`${BASE}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'dojo' });
    expect(res.status).toBe(200);
    expect(res.body.inventory.backgrounds).toContain('dojo');
    expect(res.body.coins).toBe(300);
  });

  it('rejects a duplicate background purchase', async () => {
    await giveCoins(email, 1000);
    await request(app)
      .post(`${BASE}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'dojo' });
    const res = await request(app)
      .post(`${BASE}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'dojo' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already owned/i);
  });
});

describe('Shop — use item', () => {
  let token, email;
  beforeEach(async () => { ({ token, email } = await registerAndLogin()); });

  it('health potion restores 25 HP', async () => {
    await giveCoins(email, 200);
    await User.findOneAndUpdate({ email }, { 'pet.hp': 50 });
    await request(app)
      .post(`${BASE}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'healthPotion' });
    const res = await request(app)
      .post(`${BASE}/use`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'healthPotion' });
    expect(res.status).toBe(200);
    expect(res.body.pet.hp).toBe(75);
    expect(res.body.inventory.healthPotions).toBe(0);
  });

  it('super health potion restores HP to 100', async () => {
    await giveCoins(email, 300);
    await User.findOneAndUpdate({ email }, { 'pet.hp': 40 });
    await request(app)
      .post(`${BASE}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'superHealthPotion' });
    const res = await request(app)
      .post(`${BASE}/use`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'superHealthPotion' });
    expect(res.status).toBe(200);
    expect(res.body.pet.hp).toBe(100);
  });

  it('fails when no health potions in inventory', async () => {
    const res = await request(app)
      .post(`${BASE}/use`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'healthPotion' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no health potions/i);
  });

  it('freeze streak sets freezeProtectionUntil and consumes the token', async () => {
    await giveCoins(email, 200);
    await request(app)
      .post(`${BASE}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'freezeStreak' });
    const res = await request(app)
      .post(`${BASE}/use`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'freezeStreak' });
    expect(res.status).toBe(200);
    expect(res.body.freezeProtectionUntil).toBeDefined();
    expect(res.body.inventory.freezeStreaks).toBe(0);
  });
});

describe('Shop — set background', () => {
  let token, email;
  beforeEach(async () => { ({ token, email } = await registerAndLogin()); });

  it('sets active background to "default" without ownership check', async () => {
    const res = await request(app)
      .post(`${BASE}/background`)
      .set('Authorization', `Bearer ${token}`)
      .send({ backgroundId: 'default' });
    expect(res.status).toBe(200);
    expect(res.body.activeBackground).toBe('default');
  });

  it('rejects setting an unowned background', async () => {
    const res = await request(app)
      .post(`${BASE}/background`)
      .set('Authorization', `Bearer ${token}`)
      .send({ backgroundId: 'dojo' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not owned/i);
  });

  it('sets an owned background as active', async () => {
    await giveCoins(email, 500);
    await request(app)
      .post(`${BASE}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'dojo' });
    const res = await request(app)
      .post(`${BASE}/background`)
      .set('Authorization', `Bearer ${token}`)
      .send({ backgroundId: 'dojo' });
    expect(res.status).toBe(200);
    expect(res.body.activeBackground).toBe('dojo');
  });
});
