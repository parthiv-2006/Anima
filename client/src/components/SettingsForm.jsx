import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Palette, X, Check, Sparkles } from 'lucide-react';

const AVATAR_OPTIONS = [
  { id: 'warrior', emoji: '⚔️', label: 'Warrior' },
  { id: 'mage', emoji: '🧙', label: 'Mage' },
  { id: 'ranger', emoji: '🏹', label: 'Ranger' },
  { id: 'healer', emoji: '💚', label: 'Healer' },
  { id: 'rogue', emoji: '🗡️', label: 'Rogue' },
  { id: 'monk', emoji: '🧘', label: 'Monk' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
  { id: 'phoenix', emoji: '🔥', label: 'Phoenix' }
];

import { auth } from '../services/api.js';

export default function SettingsForm({ isOpen, onClose, user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [username, setUsername] = useState(user?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'warrior');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update local storage and context
    const updatedUser = { ...user, username, avatar: selectedAvatar };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    onUpdateUser?.(updatedUser);

    setSaving(false);
    showSuccessToast('Profile updated successfully! ✨');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showSuccessToast('Passwords do not match! ❌');
      return;
    }
    if (newPassword.length < 6) {
      showSuccessToast('Password must be at least 6 characters! ❌');
      return;
    }

    setSaving(true);

    try {
      await auth.updatePassword({ currentPassword, newPassword });

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      showSuccessToast('Password changed successfully! 🔐');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <p className="text-xs text-slate-400">Customize your experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition ${activeTab === 'profile'
                  ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition ${activeTab === 'security'
                  ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <Lock className="w-4 h-4" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition ${activeTab === 'appearance'
                  ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <Palette className="w-4 h-4" />
              Avatar
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-semibold text-white shadow-lg shadow-amber-500/25 disabled:opacity-50 transition"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleChangePassword}
                    disabled={saving || !currentPassword || !newPassword}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-semibold text-white shadow-lg shadow-amber-500/25 disabled:opacity-50 transition"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </motion.button>
                </motion.div>
              )}

              {/* Avatar Tab */}
              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Choose Your Avatar
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {AVATAR_OPTIONS.map((avatar) => (
                        <motion.button
                          key={avatar.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedAvatar(avatar.id)}
                          className={`relative p-4 rounded-xl border-2 transition ${selectedAvatar === avatar.id
                              ? 'border-amber-500 bg-amber-500/20'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                            }`}
                        >
                          <span className="text-3xl block text-center">{avatar.emoji}</span>
                          <span className="text-[10px] text-slate-400 block text-center mt-1">{avatar.label}</span>
                          {selectedAvatar === avatar.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-semibold text-white shadow-lg shadow-amber-500/25 disabled:opacity-50 transition"
                  >
                    {saving ? 'Saving...' : 'Save Avatar'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 bg-green-500/20 border border-green-500/30 rounded-xl p-4 backdrop-blur"
              >
                <p className="text-green-300 text-sm font-medium text-center">{toastMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
