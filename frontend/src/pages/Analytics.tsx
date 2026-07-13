import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MapPin, Activity, AlertTriangle, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type {
  IndustryBenchmark, StateDistribution, ScoreDistribution, TrendData, PortfolioRisk,
} from '../types';
import * as api from '../api/client';

const CHART_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

export default function Analytics() {
  const [benchmark, setBenchmark] = useState<IndustryBenchmark[]>([]);
  const [stateData, setStateData] = useState<StateDistribution[]>([]);
  const [scoreDist, setScoreDist] = useState<ScoreDistribution[]>([]);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const results = await Promise.allSettled([
        api.getIndustryBenchmark(),
        api.getStateDistribution(),
        api.getScoreDistribution(),
        api.getTrend(),
        api.getPortfolioRisk(),
      ]);

      if (results[0].status === 'fulfilled') setBenchmark(results[0].value);
      else setErrors((e) => ({ ...e, benchmark: 'Failed to load' }));
      if (results[1].status === 'fulfilled') setStateData(results[1].value);
      else setErrors((e) => ({ ...e, state: 'Failed to load' }));
      if (results[2].status === 'fulfilled') setScoreDist(results[2].value);
      else setErrors((e) => ({ ...e, score: 'Failed to load' }));
      if (results[3].status === 'fulfilled') setTrend(results[3].value);
      else setErrors((e) => ({ ...e, trend: 'Failed to load' }));
      if (results[4].status === 'fulfilled') setPortfolio(results[4].value);
      else setErrors((e) => ({ ...e, portfolio: 'Failed to load' }));

      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
        <span className="ml-3 text-sm text-slate-400">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <BarChart3 size={20} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Analytics Dashboard</h1>
          <p className="text-xs text-slate-500">Portfolio insights and benchmark comparisons</p>
        </div>
      </div>

      {portfolio && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <p className="text-xs text-slate-500 mb-1">Total Assessments</p>
            <p className="text-2xl font-bold text-slate-100">{portfolio.portfolio_summary.total_assessments}</p>
          </div>
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <p className="text-xs text-slate-500 mb-1">Green</p>
            <p className="text-2xl font-bold text-emerald-400">{portfolio.risk_breakdown.green.percentage}%</p>
          </div>
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <p className="text-xs text-slate-500 mb-1">Amber</p>
            <p className="text-2xl font-bold text-amber-400">{portfolio.risk_breakdown.amber.percentage}%</p>
          </div>
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <p className="text-xs text-slate-500 mb-1">Red / At Risk</p>
            <p className="text-2xl font-bold text-rose-400">{portfolio.risk_breakdown.red.percentage}%</p>
            <p className="text-[10px] text-slate-500">{portfolio.risk_breakdown.red.count} at risk</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Industry Benchmark</h3>
          </div>
          {errors.benchmark ? (
            <p className="text-xs text-rose-400">{errors.benchmark}</p>
          ) : benchmark.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={benchmark} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis type="category" dataKey="industry_sector" tick={{ fill: '#94a3b8', fontSize: 11 }} width={140} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="avg_score" radius={[0, 4, 4, 0]}>
                  {benchmark.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Score Trend</h3>
          </div>
          {errors.trend ? (
            <p className="text-xs text-rose-400">{errors.trend}</p>
          ) : trend.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="avg_score" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                <Line type="monotone" dataKey="assessment_count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} yAxisId={0} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Score Distribution</h3>
          </div>
          {errors.score ? (
            <p className="text-xs text-rose-400">{errors.score}</p>
          ) : scoreDist.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDist} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDist.map((_, i) => {
                    let color = '#10b981';
                    if (i > scoreDist.length * 0.6) color = '#f59e0b';
                    if (i > scoreDist.length * 0.8) color = '#f43f5e';
                    return <Cell key={i} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">State Distribution</h3>
          </div>
          {errors.state ? (
            <p className="text-xs text-rose-400">{errors.state}</p>
          ) : stateData.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No data available</p>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-slate-800">
                    <th className="text-left py-2 pr-4">State</th>
                    <th className="text-right py-2 px-4">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {stateData.map((s) => (
                    <tr key={s.state} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 pr-4 text-slate-300 text-xs">{s.state}</td>
                      <td className="py-2.5 px-4 text-right text-slate-400 text-xs">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {portfolio && portfolio.risk_breakdown.red.count > 0 && (
        <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-rose-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-rose-400">Portfolio Risk Alert</p>
            <p className="text-xs text-slate-400 mt-1">
              {portfolio.risk_breakdown.red.count} MSMEs are in the red zone. Average score: {portfolio.portfolio_summary.avg_score.toFixed(1)}.
              Review flagged accounts for potential intervention.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
