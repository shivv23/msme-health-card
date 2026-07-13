import {
  CheckCircle,
  XCircle,
  Database,
  Calendar,
  Cpu,
  BarChart3,
} from 'lucide-react';
import Card from '../ui/Card';
import ScoreGauge from '../charts/ScoreGauge';
import RadarChart from '../charts/RadarChart';
import DimensionCard from './DimensionCard';
import { DIMENSION_LABELS, type DimensionKey, type HealthScore } from '../../types';
import { formatDate, getScoreColor } from '../../lib/utils';

interface HealthCardProps {
  score: HealthScore;
  compact?: boolean;
  showShap?: boolean;
}

const DIMENSIONS: DimensionKey[] = [
  'revenue_stability',
  'payment_discipline',
  'compliance_health',
  'employment_strength',
  'digital_presence',
  'cash_flow_quality',
];

export default function HealthCard({ score, compact = false, showShap = true }: HealthCardProps) {
  const shapEntries = Object.entries(score.shap_values || {})
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
    .slice(0, 8);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Health Score #{score.id}</h2>
            <p className="text-sm text-slate-400 mt-1">Financial Health Assessment</p>
          </div>
          <div className="text-right text-sm">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar size={14} />
              {formatDate(score.assessment_date)}
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 mt-1">
              <Cpu size={14} />
              Model: {score.model_version}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-shrink-0">
            <ScoreGauge score={score.overall_score} size={compact ? 160 : 220} label="Overall Score" />
          </div>
          <div className="flex-1 w-full">
            <RadarChart score={score} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DIMENSIONS.map((key) => (
            <DimensionCard
              key={key}
              name={DIMENSION_LABELS[key]}
              score={score[key]}
            />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {Object.keys(score.strengths).length > 0 ? (
              Object.entries(score.strengths).map(([key, val], i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  {key.replace(/_/g, ' ')} ({val > 0 ? '+' : ''}{val.toFixed(2)})
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">No strengths identified</li>
            )}
          </ul>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <XCircle size={16} className="text-rose-400" />
            Weaknesses
          </h3>
          <ul className="space-y-2">
            {Object.keys(score.weaknesses).length > 0 ? (
              Object.entries(score.weaknesses).map(([key, val], i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <XCircle size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                  {key.replace(/_/g, ' ')} ({val > 0 ? '+' : ''}{val.toFixed(2)})
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">No weaknesses identified</li>
            )}
          </ul>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Database size={16} className="text-blue-400" />
          Data Sources Used
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(score.data_sources_used).length > 0 ? (
            Object.entries(score.data_sources_used).filter(([, used]) => used).map(([source], i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {source}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-500">No data sources recorded</span>
          )}
        </div>
      </Card>

      {showShap && shapEntries.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-violet-400" />
            Key Contributing Factors (SHAP)
          </h3>
          <div className="space-y-3">
            {shapEntries.map(([feature, value]) => {
              const absVal = Math.abs(value);
              const maxAbs = Math.abs(shapEntries[0]?.[1] ?? 1);
              const width = (absVal / maxAbs) * 100;
              const isPositive = value >= 0;

              return (
                <div key={feature} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-36 text-right capitalize">
                    {feature.replace(/_/g, ' ')}
                  </span>
                  <div className="flex-1 h-5 bg-slate-800 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPositive ? 'bg-emerald-500/40' : 'bg-rose-500/40'
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono w-16 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {value > 0 ? '+' : ''}{value.toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
