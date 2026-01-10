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
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center p-10 text-slate-400">
                <Scroll className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No journal entries yet. Complete quests to write your legend!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 pb-20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">📜</span> Adventure Log
            </h2>

            <div className="space-y-4">
                {logs.map((entry, index) => (
                    <motion.div
                        key={entry.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur hover:bg-white/10 transition group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-white">{entry.habitName}</h3>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(entry.date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {entry.statCategory} (+{entry.xp} XP)
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {[...Array(entry.difficulty)].map((_, i) => (
                                    <span key={i} className="text-amber-500 text-xs">★</span>
                                ))}
                            </div>
                        </div>

                        {/* Note Section */}
                        {entry.note && (
                            <div className="mt-3 relative pl-4 border-l-2 border-amber-500/30">
                                <Quote className="absolute -left-2 top-0 w-3 h-3 text-amber-500 bg-slate-900" />
                                <p className="text-slate-300 text-sm italic leading-relaxed">
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
