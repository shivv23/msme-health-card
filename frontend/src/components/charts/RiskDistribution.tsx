import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { RiskDistribution } from '../../types';

interface RiskDistributionChartProps {
  data: RiskDistribution;
}

const COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

export default function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  const chartData = [
    { name: 'Green (Low Risk)', value: data.green },
    { name: 'Amber (Medium Risk)', value: data.amber },
    { name: 'Red (High Risk)', value: data.red },
  ];

  const total = data.green + data.amber + data.red;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
            formatter={(value: number) => [`${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
            formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2">
        {chartData.map((item, i) => (
          <div key={item.name} className="text-center">
            <div className="text-2xl font-bold" style={{ color: COLORS[i] }}>
              {item.value}
            </div>
            <div className="text-xs text-slate-500">
              {item.name.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
