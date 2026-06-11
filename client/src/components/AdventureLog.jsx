import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scroll, Calendar, Tag, Quote, BookOpen } from 'lucide-react';
import { habits, ai } from '../services/api.js';
import { usePetStore } from '../state/petStore.js';

export default function AdventureLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [narratives, setNarratives] = useState({});
    const [narratingLoading, setNarratingLoading] = useState(false);

    const pet = usePetStore((s) => s.pet);

    useEffect(() => {
        async function fetchLog() {
            try {
                const data = await habits.getLog();
                setLogs(data);
                if (data.length > 0) {
                    generateNarratives(data);
                }
            } catch (err) {
                console.error('Failed to load adventure log', err);
            } finally {
                setLoading(false);
            }
        }
        fetchLog();
    }, []);

    async function generateNarratives(logEntries) {
        setNarratingLoading(true);
        try {
            const petContext = {
                species: pet?.species || 'EMBER',
                stage: pet?.stage || 1,
                nickname: pet?.nickname || 'Nova'
            };
            const { narratives: result } = await ai.narrate(logEntries.slice(0, 12), petContext);
            const map = {};
            result.forEach(n => {
                if (n.id && n.text) map[String(n.id)] = n.text;
            });
            setNarratives(map);
        } catch (err) {
            console.error('Failed to generate narratives', err);
        } finally {
            setNarratingLoading(false);
        }
    }

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
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-textPrimary font-cinzel flex items-center gap-3">
                    <span className="text-3xl drop-shadow-[0_0_8px_rgba(232,160,32,0.4)]">📜</span> Adventure Log
                </h2>
                {narratingLoading && (
                    <div className="flex items-center gap-2 text-[11px] text-textMuted font-bold tracking-widest uppercase">
                        <BookOpen className="w-3.5 h-3.5 animate-pulse" style={{ color: 'var(--sp-accent)' }} />
                        Chronicling your legend...
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {logs.map((entry, index) => {
                    const narrativeText = narratives[String(entry.id)];
                    const isNarrativeLoading = narratingLoading && index < 12 && !narrativeText;

                    return (
                        <motion.div
                            key={entry.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="bg-surfaceElevated border border-borderSubtle rounded-[14px] overflow-hidden backdrop-blur hover:bg-surface transition group shadow-lg"
                        >
                            {/* Narrative prose section */}
                            {isNarrativeLoading ? (
                                <div className="px-5 pt-5 pb-3 space-y-2">
                                    <div className="h-3.5 rounded-full bg-white/5 animate-pulse w-full" />
                                    <div className="h-3.5 rounded-full bg-white/5 animate-pulse w-4/5" />
                                </div>
                            ) : narrativeText ? (
                                <div
                                    className="px-5 pt-5 pb-4 border-b border-borderSubtle"
                                    style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--sp-accent)', borderLeftStyle: 'solid' }}
                                >
                                    <p className="text-textPrimary text-[14px] leading-relaxed italic font-serif"
                                       style={{ textShadow: '0 0 20px var(--sp-soft)' }}>
                                        {narrativeText}
                                    </p>
                                </div>
                            ) : null}

                            {/* Metadata row */}
                            <div className="px-5 py-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`font-bold text-textPrimary ${narrativeText ? 'text-sm' : 'text-lg'}`}>
                                            {entry.habitName}
                                        </h3>
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

                                {/* User note */}
                                {entry.note && (
                                    <div className="mt-3 relative pl-4 border-l-2 border-accentAmber/30">
                                        <Quote className="absolute -left-2.5 top-0 w-4 h-4 text-accentAmber bg-surfaceElevated p-0.5 rounded-full" />
                                        <p className="text-textMuted text-sm italic leading-relaxed font-serif">
                                            "{entry.note}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
