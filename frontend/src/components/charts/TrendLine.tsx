import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ScoreHistory } from '../../types';
import { formatDate } from '../../lib/utils';

interface TrendLineProps {
  data: ScoreHistory;
}

export default function TrendLine({ data }: TrendLineProps) {
  const chartData = (data.history || []).map((d) => ({
    date: formatDate(d.assessment_date),
    score: d.overall_score,
    revenue: d.revenue_stability,
    payment: d.payment_discipline,
    compliance: d.compliance_health,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#e2e8f0',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
          name="Overall"
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={1.5}
          dot={false}
          name="Revenue"
          strokeDasharray="5 5"
        />
        <Line
          type="monotone"
          dataKey="payment"
          stroke="#f59e0b"
          strokeWidth={1.5}
          dot={false}
          name="Payment"
          strokeDasharray="5 5"
        />
        <Line
          type="monotone"
          dataKey="compliance"
          stroke="#a855f7"
          strokeWidth={1.5}
          dot={false}
          name="Compliance"
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
