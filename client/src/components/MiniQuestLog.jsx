import { motion } from 'framer-motion';

export default function MiniQuestLog({ habits }) {
  const typeColors = { STR: "#e8a020", INT: "#3b82f6", SPI: "#22c55e" };
  const typeIcons = { STR: "⚔", INT: "📘", SPI: "🌿" };
  const typeLabels = { STR: "STRENGTH", INT: "INTELLECT", SPI: "SPIRIT" };
  
  const grouped = habits.reduce((acc, q) => {
    if (!acc[q.statCategory]) acc[q.statCategory] = [];
    acc[q.statCategory].push(q);
    return acc;
  }, {});

  return (
    <div className="bg-surfaceElevated border border-borderSubtle rounded-[12px] p-3.5 mb-2.5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-[7px]">
          <span className="text-[13px] opacity-80">📜</span>
          <span className="text-[11px] font-bold text-textPrimary tracking-[1px] uppercase font-cinzel">Quest Log</span>
        </div>
      </div>
      {Object.entries(grouped).map(([type, qs]) => (
        <div key={type} className="mb-3">
          <div className="text-[9px] text-textMuted font-bold tracking-[1.5px] mb-1.5 flex items-center gap-1.5 uppercase">
            <span>{typeIcons[type]}</span> {typeLabels[type]} QUESTS
          </div>
          {qs.map(q => (
            <div 
              key={q._id} 
              className="relative bg-[rgba(255,255,255,0.02)] border rounded-lg p-2.5 mb-1.5 transition-colors duration-300"
              style={{ borderColor: q.isCompletedToday ? `${typeColors[type]}55` : "rgba(255,255,255,0.06)" }}
            >
              <div className="flex gap-1.5 mb-1 items-center">
                <span className="text-[9px] font-bold px-[5px] py-[1px] rounded-[3px] uppercase tracking-wider" style={{ color: typeColors[type], background: `${typeColors[type]}22` }}>
                  {type}
                </span>
                <div className="flex gap-0.5">
                  {"★".repeat(q.difficulty).split("").map((s, i) => (
                    <span key={i} className="text-accentAmber text-[9px]">★</span>
                  ))}
                </div>
              </div>
              <div className="text-[12px] text-textPrimary font-semibold mb-1 pr-4 truncate">{q.name}</div>
              <div className="text-[10px] text-textMuted">+{q.difficulty * 10} XP · Boosts {type}</div>
              {q.isCompletedToday && (
                <div className="absolute top-2 right-2 text-success text-[14px]">✓</div>
              )}
            </div>
          ))}
        </div>
      ))}
      {habits.length === 0 && (
        <div className="text-center py-4">
          <p className="text-[10px] text-textMuted uppercase font-bold tracking-widest">No Quests Active</p>
        </div>
      )}
    </div>
  );
}
