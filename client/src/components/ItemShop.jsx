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
          className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏪</span>
                <div>
                  <h2 className="text-2xl font-bold">Item Shop</h2>
                  <p className="text-slate-400 text-sm">Spend your hard-earned coins!</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full">
                  <span className="text-xl">🪙</span>
                  <span className="font-bold text-amber-300">{coins}</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
              {activeTab === 'background' && inventory?.activeBackground !== 'default' && (
                <button
                  onClick={() => handleSetBackground('default')}
                  className="ml-auto px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded-lg text-slate-300 text-sm font-semibold transition flex items-center gap-2"
                >
                  <span>🏠</span>
                  <span>Reset to Default</span>
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
                className={`mx-6 mt-4 px-4 py-2 rounded-lg ${
                  error 
                    ? 'bg-red-500/20 border border-red-500/30 text-red-300' 
                    : 'bg-green-500/20 border border-green-500/30 text-green-300'
                }`}
              >
                {error || successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-slate-400">Loading shop...</p>
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
                    className={`relative bg-white/5 border rounded-2xl p-5 transition ${
                      item.owned 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Background preview for background items */}
                    {item.category === 'background' && (
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${BACKGROUND_GRADIENTS[item.id] || BACKGROUND_GRADIENTS.default} opacity-30`} />
                    )}

                    <div className="relative">
                      {/* Owned badge */}
                      {item.owned && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          ✓ Owned
                        </div>
                      )}

                      {/* Item emoji */}
                      <div className="text-5xl mb-3 text-center">
                        {item.emoji}
                      </div>

                      {/* Item info */}
                      <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Price and action */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span>🪙</span>
                          <span className={`font-bold ${coins >= item.price ? 'text-amber-300' : 'text-red-400'}`}>
                            {item.price}
                          </span>
                        </div>

                        {item.category === 'background' ? (
                          item.owned ? (
                            <button
                              onClick={() => handleSetBackground(item.id)}
                              disabled={inventory?.activeBackground === item.id}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                                inventory?.activeBackground === item.id
                                  ? 'bg-green-500/20 text-green-300 cursor-default'
                                  : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
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
                              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg font-semibold text-sm text-white transition disabled:opacity-50"
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
                              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg font-semibold text-sm text-white transition disabled:opacity-50"
                            >
                              {purchasing === item.id ? '...' : 'Buy'}
                            </motion.button>
                          </div>
                        )}
                      </div>

                      {/* Inventory count for consumables */}
                      {item.category === 'consumable' && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs text-slate-400">In inventory:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
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
                                className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-xs text-green-300 font-semibold transition"
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
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <span>🧪</span>
                <span className="text-slate-400">Health Potions:</span>
                <span className="font-bold text-white">{inventory?.healthPotions || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>❄️</span>
                <span className="text-slate-400">Freeze Streaks:</span>
                <span className="font-bold text-white">{inventory?.freezeStreaks || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🖼️</span>
                <span className="text-slate-400">Backgrounds:</span>
                <span className="font-bold text-white">{inventory?.backgrounds?.length || 1}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
