import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function HabitRadar({ stats }) {
  const data = [
    { stat: 'STR', value: stats.str },
    { stat: 'INT', value: stats.int },
    { stat: 'SPI', value: stats.spi }
  ];

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="stat" stroke="#cbd5f5" tickLine={false} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} />
          <Radar name="Stats" dataKey="value" stroke="#f97316" fill="#fb923c" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
