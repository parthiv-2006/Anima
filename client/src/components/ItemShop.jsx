import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shop as shopApi } from '../services/api.js';
import confetti from 'canvas-confetti';

const TABS = [
  { id: 'consumable', label: 'Potions', emoji: '🧪' },
  { id: 'background', label: 'Backgrounds', emoji: '🖼️' }
];

const BACKGROUND_GRADIENTS = {
  default: 'from-slate-800 to-slate-900',
  dojo: 'from-red-900/50 to-orange-900/50',
  library: 'from-blue-900/50 to-indigo-900/50',
  forest: 'from-green-900/50 to-emerald-900/50',
  volcano: 'from-orange-900/50 to-red-950/50',
  ocean: 'from-cyan-900/50 to-blue-950/50',
  mountain: 'from-stone-800/50 to-slate-900/50'
};

export default function ItemShop({ isOpen, onClose, coins, inventory, onPurchase, onUseItem, onSetBackground }) {
  const [activeTab, setActiveTab] = useState('consumable');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadShopItems();
    }
  }, [isOpen]);

  const loadShopItems = async () => {
    try {
      setLoading(true);
      const data = await shopApi.getItems();
      setItems(data.items);
    } catch (err) {
      setError('Failed to load shop items');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item) => {
    if (coins < item.price) {
      setError('Not enough coins!');
      setTimeout(() => setError(''), 2000);
      return;
    }

    if (item.owned) {
      setError('Already owned!');
      setTimeout(() => setError(''), 2000);
      return;
    }

    try {
      setPurchasing(item.id);
      await shopApi.purchase(item.id);
      
      // Celebrate purchase
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#fbbf24', '#f59e0b', '#d97706']
      });

      setSuccessMessage(`Purchased ${item.name}!`);
      setTimeout(() => setSuccessMessage(''), 2000);
      
      // Reload items and notify parent
      await loadShopItems();
      onPurchase?.();
    } catch (err) {
      setError(err.message || 'Purchase failed');
      setTimeout(() => setError(''), 2000);
    } finally {
      setPurchasing(null);
    }
  };

  const handleUseItem = async (itemId) => {
    try {
      await shopApi.useItem(itemId);
      setSuccessMessage('Item used!');
      setTimeout(() => setSuccessMessage(''), 2000);
      onUseItem?.();
    } catch (err) {
      setError(err.message || 'Failed to use item');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleSetBackground = async (backgroundId) => {
    try {
      await shopApi.setBackground(backgroundId);
      setSuccessMessage('Background updated!');
      setTimeout(() => setSuccessMessage(''), 2000);
      onSetBackground?.(backgroundId);
    } catch (err) {
      setError(err.message || 'Failed to set background');
      setTimeout(() => setError(''), 2000);
    }
  };

  const filteredItems = items.filter(item => item.category === activeTab);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-surface backdrop-blur-xl border border-borderSubtle rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]"
        >
          {/* Header */}
          <div className="p-6 border-b border-borderSubtle bg-surfaceElevated">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl drop-shadow-[0_0_8px_rgba(232,160,32,0.4)]">🏪</span>
                <div>
                  <h2 className="text-2xl font-bold text-textPrimary font-cinzel">Item Shop</h2>
                  <p className="text-textMuted text-sm font-sans">Spend your hard-earned coins!</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-accentAmber/10 border border-accentAmber/30 rounded-full shadow-[0_0_12px_rgba(232,160,32,0.2)]">
                  <span className="text-xl">🪙</span>
                  <span className="font-bold text-accentAmber">{coins}</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-textMuted hover:text-textPrimary hover:bg-surface rounded-lg transition"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-6 items-center">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition uppercase tracking-wider text-xs ${
                    activeTab === tab.id
                      ? 'bg-accentAmber text-background shadow-[0_0_12px_rgba(232,160,32,0.4)]'
                      : 'bg-surface text-textMuted hover:text-textPrimary hover:bg-surfaceElevated border border-borderSubtle'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
              {activeTab === 'background' && inventory?.activeBackground !== 'default' && (
                <button
                  onClick={() => handleSetBackground('default')}
                  className="ml-auto px-4 py-2 bg-surface hover:bg-surfaceElevated border border-borderSubtle rounded-lg text-textMuted hover:text-textPrimary text-xs font-bold transition flex items-center gap-2 uppercase tracking-wider"
                >
                  <span>🏠</span>
                  <span>Reset Default</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {(error || successMessage) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mx-6 mt-4 px-4 py-2 rounded-lg font-bold text-sm text-center ${
                  error 
                    ? 'bg-accentRust/20 border border-accentRust/30 text-accentRust' 
                    : 'bg-success/20 border border-success/30 text-success'
                }`}
              >
                {error || successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)] custom-scrollbar">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-textMuted font-bold">Loading shop...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4 }}
                    className={`relative bg-surface border rounded-2xl p-5 transition shadow-lg ${
                      item.owned 
                        ? 'border-success/30 bg-success/5 shadow-[0_0_12px_rgba(34,197,94,0.1)]' 
                        : 'border-borderSubtle hover:border-accentAmber/50 hover:shadow-[0_0_15px_rgba(232,160,32,0.15)]'
                    }`}
                  >
                    {/* Background preview for background items */}
                    {item.category === 'background' && (
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${BACKGROUND_GRADIENTS[item.id] || BACKGROUND_GRADIENTS.default} opacity-30`} />
                    )}

                    <div className="relative">
                      {/* Owned badge */}
                      {item.owned && (
                        <div className="absolute -top-2 -right-2 bg-success text-background text-[10px] font-bold px-2 py-1 rounded-md tracking-wider uppercase shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                          ✓ Owned
                        </div>
                      )}

                      {/* Item emoji */}
                      <div className="text-5xl mb-3 text-center drop-shadow-xl">
                        {item.emoji}
                      </div>

                      {/* Item info */}
                      <h3 className="font-bold text-lg mb-1 text-textPrimary">{item.name}</h3>
                      <p className="text-xs text-textMuted mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Price and action */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span>🪙</span>
                          <span className={`font-bold ${coins >= item.price ? 'text-accentAmber' : 'text-accentRust'}`}>
                            {item.price}
                          </span>
                        </div>

                        {item.category === 'background' ? (
                          item.owned ? (
                            <button
                              onClick={() => handleSetBackground(item.id)}
                              disabled={inventory?.activeBackground === item.id}
                              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                                inventory?.activeBackground === item.id
                                  ? 'bg-success/10 text-success border border-success/30 cursor-default shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                                  : 'bg-surfaceElevated hover:bg-surface text-textPrimary border border-borderSubtle'
                              }`}
                            >
                              {inventory?.activeBackground === item.id ? '✓ Active' : 'Set Active'}
                            </button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePurchase(item)}
                              disabled={purchasing === item.id || coins < item.price}
                              className="px-4 py-2 bg-gradient-to-r from-accentRust to-accentAmber hover:from-accentAmber hover:to-accentRust rounded-lg font-bold text-xs uppercase tracking-wider text-background shadow-[0_0_12px_rgba(232,160,32,0.3)] transition disabled:opacity-50 disabled:grayscale"
                            >
                              {purchasing === item.id ? '...' : 'Buy'}
                            </motion.button>
                          )
                        ) : (
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePurchase(item)}
                              disabled={purchasing === item.id || coins < item.price}
                              className="px-4 py-2 bg-gradient-to-r from-accentRust to-accentAmber hover:from-accentAmber hover:to-accentRust rounded-lg font-bold text-xs uppercase tracking-wider text-background shadow-[0_0_12px_rgba(232,160,32,0.3)] transition disabled:opacity-50 disabled:grayscale"
                            >
                              {purchasing === item.id ? '...' : 'Buy'}
                            </motion.button>
                          </div>
                        )}
                      </div>

                      {/* Inventory count for consumables */}
                      {item.category === 'consumable' && (
                        <div className="mt-3 pt-3 border-t border-borderSubtle flex items-center justify-between">
                          <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">In inventory:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-textPrimary text-sm">
                              {item.id.includes('healthPotion') || item.id === 'superHealthPotion'
                                ? inventory?.healthPotions || 0
                                : item.id === 'freezeStreak'
                                ? inventory?.freezeStreaks || 0
                                : 0}
                            </span>
                            {((item.id.includes('healthPotion') && (inventory?.healthPotions || 0) > 0) ||
                              (item.id === 'freezeStreak' && (inventory?.freezeStreaks || 0) > 0)) && (
                              <button
                                onClick={() => handleUseItem(item.id)}
                                className="px-3 py-1 bg-success/10 hover:bg-success/20 border border-success/30 rounded-md text-[10px] text-success font-bold uppercase tracking-wider transition shadow-[0_0_8px_rgba(34,197,94,0.1)]"
                              >
                                Use
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Inventory Summary */}
          <div className="p-4 border-t border-borderSubtle bg-surfaceElevated">
            <div className="flex items-center justify-center gap-8 text-[11px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="drop-shadow-md">🧪</span>
                <span className="text-textMuted">Health Potions:</span>
                <span className="text-accentAmber">{inventory?.healthPotions || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="drop-shadow-md">❄️</span>
                <span className="text-textMuted">Freeze Streaks:</span>
                <span className="text-accentAmber">{inventory?.freezeStreaks || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="drop-shadow-md">🖼️</span>
                <span className="text-textMuted">Backgrounds:</span>
                <span className="text-accentAmber">{inventory?.backgrounds?.length || 1}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
