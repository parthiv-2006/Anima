import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function HabitRadar({ stats }) {
  const data = [
    { stat: 'STR', value: stats.str, fullMark: Math.max(stats.str, stats.int, stats.spi, 50) },
    { stat: 'INT', value: stats.int, fullMark: Math.max(stats.str, stats.int, stats.spi, 50) },
    { stat: 'SPI', value: stats.spi, fullMark: Math.max(stats.str, stats.int, stats.spi, 50) }
  ];

  // Custom tick for stat labels with colors
  const CustomTick = ({ payload, x, y, textAnchor }) => {
    const colors = { STR: '#ef4444', INT: '#3b82f6', SPI: '#10b981' };
    const icons = { STR: '⚔️', INT: '📚', SPI: '🌿' };
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          textAnchor={textAnchor} 
          fill={colors[payload.value]} 
          fontSize={11}
          fontWeight="bold"
        >
          {icons[payload.value]} {payload.value}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
        <PolarAngleAxis dataKey="stat" tick={<CustomTick />} />
        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
        <Radar 
          name="Stats" 
          dataKey="value" 
          stroke="#f59e0b" 
          strokeWidth={2}
          fill="url(#statGradient)" 
          fillOpacity={0.4}
          dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }}
        />
        <defs>
          <linearGradient id="statGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#ea580c" stopOpacity={0.4} />
          </linearGradient>
        </defs>
      </RadarChart>
    </ResponsiveContainer>
  );
}
