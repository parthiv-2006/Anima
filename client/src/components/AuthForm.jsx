import { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../services/api.js';
import { useAuthStore } from '../state/authStore.js';

const SPECIES_OPTIONS = [
  { value: 'EMBER', label: 'Ember Spirit', emoji: '🔥', color: 'from-amber-500 to-red-500' },
  { value: 'AQUA', label: 'Aqua Wisp', emoji: '💧', color: 'from-sky-500 to-blue-500' },
  { value: 'TERRA', label: 'Terra Golem', emoji: '🌿', color: 'from-emerald-500 to-lime-500' }
];

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    species: 'EMBER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuthData = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isRegister) {
        response = await auth.register(formData);
      } else {
        response = await auth.login({
          email: formData.email,
          password: formData.password
        });
      }

      // Store token and user data
      localStorage.setItem('token', response.token);
      setAuthData(response.token, response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-display flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Evo Habit</h1>
          <p className="text-slate-400">Your Tamagotchi for Productivity</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                !isRegister
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                isRegister
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  placeholder="Choose your name"
                  required={isRegister}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                placeholder="••••••••"
                required
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Choose Your Starter Pet
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {SPECIES_OPTIONS.map((species) => (
                    <button
                      key={species.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, species: species.value })}
                      className={`relative p-4 rounded-lg border transition ${
                        formData.species === species.value
                          ? 'border-white/30 bg-white/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${species.color} opacity-20`} />
                      <div className="relative text-center">
                        <p className="text-3xl mb-1">{species.emoji}</p>
                        <p className="text-xs font-semibold">{species.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : isRegister ? 'Start Your Journey' : 'Login'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
