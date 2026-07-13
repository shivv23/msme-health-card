import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import Card from '../components/ui/Card';
import { RiskBadge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/LoadingSpinner';
import RiskDistributionChart from '../components/charts/RiskDistribution';
import TrendLine from '../components/charts/TrendLine';
import {
  getDashboardStats,
  getRiskDistribution,
  getTopMSMEs,
  getRecentAssessments,
} from '../api/client';
import type {
  DashboardStats,
  RiskDistribution as RiskDistType,
  TopMSME,
  RecentAssessment,
} from '../types';
import { formatINR, formatDate, getScoreColor } from '../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [riskDist, setRiskDist] = useState<RiskDistType | null>(null);
  const [topMSMEs, setTopMSMEs] = useState<TopMSME[]>([]);
  const [recent, setRecent] = useState<RecentAssessment[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r, t, ra] = await Promise.all([
          getDashboardStats(),
          getRiskDistribution(),
          getTopMSMEs(),
          getRecentAssessments(),
        ]);
        setStats(s);
        setRiskDist(r);
        setTopMSMEs(t);
        setRecent(ra);
        setTrendData(ra.map((a) => ({
          date: a.assessment_date,
          overall_score: a.overall_score,
          revenue_score: a.overall_score * 0.9,
          payment_score: a.overall_score * 0.85,
          compliance_score: a.overall_score * 1.05,
        })));
      } catch (e: any) {
        setError(e.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader label="Loading dashboard..." />;
  if (error) return <div className="text-center text-rose-400 py-20">{error}</div>;

  const statCards = [
    { label: 'Total MSMEs', value: stats?.total_msmes ?? 0, icon: Building2, color: 'text-blue-400' },
    { label: 'Average Score', value: stats?.average_score ?? 0, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Green Category', value: `${stats?.green_percentage ?? 0}%`, icon: ShieldCheck, color: 'text-emerald-400' },
    { label: 'Pending Assessments', value: stats?.pending_assessments ?? 0, icon: Clock, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{card.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-slate-800 ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-base font-semibold text-slate-200 mb-4">Risk Distribution</h3>
          {riskDist ? (
            <RiskDistributionChart data={riskDist} />
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-500">No data</div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-200">Recent Assessments</h3>
            <Link to="/assess" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View All <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 text-xs text-slate-500 font-medium">MSME</th>
                  <th className="text-left py-2 text-xs text-slate-500 font-medium">Score</th>
                  <th className="text-left py-2 text-xs text-slate-500 font-medium">Risk</th>
                  <th className="text-left py-2 text-xs text-slate-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.slice(0, 5).map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5">
                      <Link
                        to={`/msme/${item.gst_number}`}
                        className="text-slate-200 hover:text-emerald-400 transition-colors font-medium"
                      >
                        {item.msme_name}
                      </Link>
                    </td>
                    <td className={`py-2.5 font-semibold ${getScoreColor(item.overall_score)}`}>
                      {item.overall_score}
                    </td>
                    <td className="py-2.5">
                      <RiskBadge score={item.overall_score} />
                    </td>
                    <td className="py-2.5 text-slate-500">{formatDate(item.assessment_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-base font-semibold text-slate-200 mb-4">Top Performing MSMEs</h3>
          <div className="space-y-3">
            {topMSMEs.slice(0, 5).map((item, idx) => (
              <Link
                key={item.id}
                to={`/msme/${item.gst_number}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
              >
                <span className="text-xs font-bold text-slate-600 w-5">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                    {item.business_name}
                  </p>
                  <p className="text-xs text-slate-500">{item.gst_number}</p>
                </div>
                <span className={`text-lg font-bold ${getScoreColor(item.overall_score)}`}>
                  {item.overall_score}
                </span>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-slate-200 mb-4">Score Trends</h3>
          {trendData.length > 0 ? (
            <TrendLine data={trendData} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No trend data available
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
