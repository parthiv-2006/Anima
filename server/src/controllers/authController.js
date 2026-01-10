import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req, res) {
  try {
    const { username, email, password, species = 'EMBER', avatar = 'warrior' } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hash,
      avatar,
      pet: {
        species,
        stats: { str: 10, int: 10, spi: 10 },
        totalXp: 0,
        stage: 1,
        evolutionPath: `${species}_BASE`
      },
      habits: []
    });

    const token = signToken(user._id);
    return res.json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    user.lastLogin = new Date();
    await user.save();

    return res.json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
}
