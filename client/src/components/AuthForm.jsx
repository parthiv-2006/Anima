import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../services/api.js';
import { useAuthStore } from '../state/authStore.js';

const AVATARS = [
  { id: 'warrior', emoji: '⚔️', label: 'Warrior' },
  { id: 'mage',    emoji: '🧙', label: 'Mage'    },
  { id: 'ranger',  emoji: '🏹', label: 'Ranger'  },
  { id: 'healer',  emoji: '💚', label: 'Healer'  },
  { id: 'rogue',   emoji: '🗡️', label: 'Rogue'   },
  { id: 'monk',    emoji: '🧘', label: 'Monk'    },
  { id: 'dragon',  emoji: '🐉', label: 'Dragon'  },
  { id: 'phoenix', emoji: '🔥', label: 'Phoenix' },
];

const inputClass =
  'w-full px-4 py-3 bg-surfaceElevated border border-borderSubtle rounded-xl text-textPrimary placeholder-textMuted focus:outline-none focus:border-accentAmber/50 focus:ring-1 focus:ring-accentAmber/50 transition text-sm';

const labelClass = 'block text-xs font-bold tracking-[1.5px] uppercase text-textMuted mb-2';

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', avatar: 'warrior' });
  const [error, setError]     = useState('');
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
        response = await auth.login({ email: formData.email, password: formData.password });
      }
      localStorage.setItem('token', response.token);
      setAuthData(response.token, response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accentAmber/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accentRust/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accentRust to-accentAmber shadow-[0_0_32px_rgba(232,160,32,0.35)] mb-4"
          >
            <span className="text-3xl">🔥</span>
          </motion.div>
          <motion.h1
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-4xl font-bold text-textPrimary font-cinzel tracking-wide mb-2"
          >
            Anima
          </motion.h1>
          <motion.p
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-textMuted text-sm tracking-wide"
          >
            Your companion awaits
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-surfaceElevated border border-borderSubtle rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Tab switcher */}
          <div className="flex border-b border-borderSubtle">
            {[{ label: 'Login', value: false }, { label: 'Register', value: true }].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => { setIsRegister(value); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-bold tracking-[1px] uppercase font-cinzel transition ${
                  isRegister === value
                    ? 'text-accentAmber border-b-2 border-accentAmber bg-accentAmber/5'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-7">
            <AnimatePresence mode="wait">
              <motion.form
                key={isRegister ? 'register' : 'login'}
                initial={{ opacity: 0, x: isRegister ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRegister ? -20 : 20 }}
                transition={{ duration: 0.22 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {isRegister && (
                  <>
                    <div>
                      <label className={labelClass}>Username</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className={inputClass}
                        placeholder="Choose your name"
                        required
                      />
                    </div>

                    {/* Avatar picker */}
                    <div>
                      <label className={labelClass}>Choose Your Avatar</label>
                      <div className="grid grid-cols-4 gap-2">
                        {AVATARS.map((a) => (
                          <motion.button
                            key={a.id}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFormData({ ...formData, avatar: a.id })}
                            className={`relative p-3 rounded-xl border-2 text-center transition ${
                              formData.avatar === a.id
                                ? 'border-accentAmber bg-accentAmber/15 shadow-[0_0_12px_rgba(232,160,32,0.2)]'
                                : 'border-borderSubtle bg-surface hover:border-accentAmber/30'
                            }`}
                          >
                            <span className="text-xl block">{a.emoji}</span>
                            <span className="block text-[9px] text-textMuted mt-1 font-cinzel tracking-wide">{a.label}</span>
                            {formData.avatar === a.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-accentAmber rounded-full flex items-center justify-center"
                              >
                                <svg className="w-2.5 h-2.5 text-background" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </motion.div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={inputClass}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                    >
                      <p className="text-red-400 text-sm font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 bg-gradient-to-r from-accentRust to-accentAmber rounded-xl font-bold text-background text-sm tracking-[1px] uppercase shadow-[0_0_20px_rgba(232,160,32,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition mt-2"
                >
                  {loading ? 'Loading...' : isRegister ? 'Begin Your Journey' : 'Enter the Sanctuary'}
                </motion.button>
              </motion.form>
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-center text-textMuted text-xs mt-6 tracking-wide">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-accentAmber hover:text-accentAmber/80 font-semibold transition"
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
