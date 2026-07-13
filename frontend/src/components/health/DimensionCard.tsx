import { cn, getScoreColor } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DimensionCardProps {
  name: string;
  score: number;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

export default function DimensionCard({ name, score, trend = 'stable', description }: DimensionCardProps) {
  const barColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-300">{name}</span>
        <div className="flex items-center gap-1">
          {trend === 'up' && <TrendingUp size={14} className="text-emerald-400" />}
          {trend === 'down' && <TrendingDown size={14} className="text-rose-400" />}
          {trend === 'stable' && <Minus size={14} className="text-slate-500" />}
        </div>
      </div>
      <div className={cn('text-2xl font-bold mb-2', getScoreColor(score))}>{score}</div>
      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${score}%` }}
        />
      </div>
      {description && (
        <p className="text-xs text-slate-500 mt-2">{description}</p>
      )}
    </div>
  );
}
