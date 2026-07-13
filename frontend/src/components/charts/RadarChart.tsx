import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { HealthScore } from '../../types';
import { DIMENSION_LABELS, type DimensionKey } from '../../types';

interface RadarChartProps {
  score: HealthScore;
}

const DIMENSIONS: DimensionKey[] = [
  'revenue_score',
  'payment_score',
  'compliance_score',
  'employment_score',
  'digital_score',
  'cashflow_score',
];

export default function RadarChart({ score }: RadarChartProps) {
  const data = DIMENSIONS.map((key) => ({
    dimension: DIMENSION_LABELS[key],
    value: score[key],
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#e2e8f0',
          }}
          formatter={(value: number) => [`${value}/100`, 'Score']}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
