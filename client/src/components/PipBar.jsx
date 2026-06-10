// Segmented pip gauge (FF-style ATB bar). Fills pip-by-pip with a staggered
// pop instead of a smooth gradient sweep.
export default function PipBar({ label, value, max, color, dimColor, count = 20, rightText }) {
  const clamped = Math.max(0, Math.min(value, max));
  const filled = Math.round((clamped / max) * count);

  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-textMuted mb-1.5 font-bold tracking-widest uppercase">
        <span>{label}</span>
        <span>{rightText ?? `${clamped}/${max}`}</span>
      </div>
      <div className="flex gap-[3px]">
        {[...Array(count)].map((_, i) => {
          const isFilled = i < filled;
          return (
            <div
              key={i}
              className={`flex-1 h-2.5 ${isFilled ? 'pip-fill' : ''}`}
              style={{
                // skewed pips read as a gauge, not a progress bar
                transform: 'skewX(-12deg)',
                animationDelay: isFilled ? `${i * 28}ms` : undefined,
                background: isFilled ? color : 'rgba(255,255,255,0.06)',
                boxShadow: isFilled ? `0 0 6px ${dimColor || color}` : 'none',
                borderRadius: '2px'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
