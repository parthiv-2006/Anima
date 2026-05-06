import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scroll, Calendar, Tag, Quote } from 'lucide-react';
import { habits } from '../services/api.js';

export default function AdventureLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLog() {
            try {
                const data = await habits.getLog();
                setLogs(data);
            } catch (err) {
                console.error('Failed to load adventure log', err);
            } finally {
                setLoading(false);
            }
        }
        fetchLog();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accentAmber" />
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center p-10 text-textMuted">
                <Scroll className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No journal entries yet. Complete quests to write your legend!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 pb-20">
            <h2 className="text-2xl font-bold text-textPrimary font-cinzel mb-6 flex items-center gap-3">
                <span className="text-3xl drop-shadow-[0_0_8px_rgba(232,160,32,0.4)]">📜</span> Adventure Log
            </h2>

            <div className="space-y-4">
                {logs.map((entry, index) => (
                    <motion.div
                        key={entry.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-surfaceElevated border border-borderSubtle rounded-[14px] p-5 backdrop-blur hover:bg-surface transition group shadow-lg"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-textPrimary">{entry.habitName}</h3>
                                <div className="flex items-center gap-3 text-xs text-textMuted mt-1 font-bold uppercase tracking-wider">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-accentAmber" />
                                        {new Date(entry.date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Tag className="w-3 h-3 text-accentAmber" />
                                        <span className={`
                                            ${entry.statCategory === 'STR' ? 'text-statSTR' : ''}
                                            ${entry.statCategory === 'INT' ? 'text-statINT' : ''}
                                            ${entry.statCategory === 'SPI' ? 'text-statSPI' : ''}
                                        `}>
                                            {entry.statCategory}
                                        </span> 
                                        <span className="text-accentAmber">(+{entry.xp} XP)</span>
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {[...Array(entry.difficulty)].map((_, i) => (
                                    <span key={i} className="text-accentAmber text-xs drop-shadow-[0_0_4px_rgba(232,160,32,0.6)]">★</span>
                                ))}
                            </div>
                        </div>

                        {/* Note Section */}
                        {entry.note && (
                            <div className="mt-4 relative pl-4 border-l-2 border-accentAmber/30">
                                <Quote className="absolute -left-2.5 top-0 w-4 h-4 text-accentAmber bg-surfaceElevated p-0.5 rounded-full" />
                                <p className="text-textMuted text-sm italic leading-relaxed font-serif">
                                    "{entry.note}"
                                </p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
