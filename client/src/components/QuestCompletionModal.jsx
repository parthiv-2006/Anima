import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Zap, Star } from 'lucide-react';

export default function QuestCompletionModal({ habit, isOpen, onClose, onConfirm }) {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !habit) return null;

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm(habit, note);
        setLoading(false);
        setNote('');
    };

    const xpReward = 10 * habit.difficulty;
    const statReward = 5 * habit.difficulty;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-amber-500/10"
                >
                    {/* Header with Rewards */}
                    <div className="bg-gradient-to-b from-amber-500/20 to-transparent p-6 text-center border-b border-white/5">
                        <h2 className="text-2xl font-bold text-white mb-1">Quest Complete!</h2>
                        <p className="text-slate-400 text-sm mb-4">{habit.name}</p>

                        <div className="flex justify-center gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 min-w-[80px]">
                                <p className="text-xs uppercase tracking-wider text-slate-400">XP</p>
                                <p className="text-xl font-bold text-amber-400">+{xpReward}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 min-w-[80px]">
                                <p className="text-xs uppercase tracking-wider text-slate-400">{habit.statCategory}</p>
                                <p className="text-xl font-bold text-white">+{statReward}</p>
                            </div>
                        </div>
                    </div>

                    {/* Note Input */}
                    <div className="p-6">
                        <label className="block text-sm font-medium text-amber-400/80 mb-2 flex items-center gap-2">
                            <Scroll className="w-4 h-4" /> Captain's Log (Optional)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 min-h-[100px] resize-none"
                            placeholder="How did it go? What did you learn?"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 pt-0 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                'Claiming...'
                            ) : (
                                <>
                                    <Star className="w-4 h-4 fill-white" /> Claim Reward
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
