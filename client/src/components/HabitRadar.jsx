import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function HabitRadar({ stats }) {
  const data = [
    { stat: 'STR', value: stats.str, fullMark: Math.max(stats.str, stats.int, stats.spi, 100) },
    { stat: 'INT', value: stats.int, fullMark: Math.max(stats.str, stats.int, stats.spi, 100) },
    { stat: 'SPI', value: stats.spi, fullMark: Math.max(stats.str, stats.int, stats.spi, 100) }
  ];

  // Custom tick for stat labels with colors
  const CustomTick = ({ payload, x, y, textAnchor }) => {
    const colors = { STR: '#e8a020', INT: '#3b82f6', SPI: '#22c55e' };
    const icons = { STR: '⚔', INT: '📘', SPI: '🌿' };
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          textAnchor={textAnchor} 
          fill={colors[payload.value]} 
          fontSize={11}
          fontWeight="bold"
          fontFamily='"DM Sans", sans-serif'
        >
          {icons[payload.value]} {payload.value}
        </text>
      </g>
    );
  };

  const statColors = { str: '#e8a020', int: '#3b82f6', spi: '#22c55e' };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid gridType="polygon" stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis dataKey="stat" tick={<CustomTick />} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} tickCount={5} />
            <Radar 
              name="Stats" 
              dataKey="value" 
              stroke="#e8a020" 
              strokeWidth={2}
              fill="#e8a020" 
              fillOpacity={0.2}
              dot={{ fill: '#e8a020', strokeWidth: 0, r: 4 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Mini Stat Bars */}
      <div className="flex gap-2 justify-center mt-2 px-2">
        {Object.entries(stats).map(([stat, val]) => {
          const maxVal = Math.max(stats.str, stats.int, stats.spi, 100);
          const pct = Math.min((val / maxVal) * 100, 100);
          return (
            <div key={stat} className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between text-[9px] font-bold uppercase text-textMuted">
                <span>{stat}</span>
                <span>{val}</span>
              </div>
              <div className="h-1 rounded-full bg-surfaceElevated overflow-hidden border border-borderSubtle">
                <div 
                  className="h-full shadow-lg" 
                  style={{ 
                    width: `${pct}%`, 
                    backgroundColor: statColors[stat],
                    boxShadow: `0 0 6px ${statColors[stat]}88`
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
