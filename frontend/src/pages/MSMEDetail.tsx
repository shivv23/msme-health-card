import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  TrendingUp,
  Building2,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ScoreGauge from '../components/charts/ScoreGauge';
import TrendLine from '../components/charts/TrendLine';
import CreditRecommendation from '../components/health/CreditRecommendation';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { RiskBadge } from '../components/ui/Badge';
import {
  getMSME,
  getHealthScore,
  getScoreHistory,
  getCreditAssessment,
} from '../api/client';
import type { MSME, HealthScore, ScoreHistory, CreditAssessment } from '../types';
import { formatINR, formatDate, getScoreColor } from '../lib/utils';

export default function MSMEDetail() {
  const { gstNumber } = useParams<{ gstNumber: string }>();
  const [msme, setMsme] = useState<MSME | null>(null);
  const [score, setScore] = useState<HealthScore | null>(null);
  const [history, setHistory] = useState<ScoreHistory | null>(null);
  const [credit, setCredit] = useState<CreditAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!gstNumber) return;

    const load = async () => {
      try {
        const msmeData = await getMSME(gstNumber);
        setMsme(msmeData);

        try {
          const scoreData = await getHealthScore(msmeData.id);
          setScore(scoreData);

          const [histData, creditData] = await Promise.all([
            getScoreHistory(msmeData.id).catch(() => null),
            getCreditAssessment(msmeData.id).catch(() => null),
          ]);
          setHistory(histData);
          setCredit(creditData);
        } catch {
          // No health data yet
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load MSME details');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [gstNumber]);

  if (loading) return <PageLoader label="Loading MSME details..." />;
  if (error) return <div className="text-center text-rose-400 py-20">{error}</div>;
  if (!msme) return <div className="text-center text-slate-500 py-20">MSME not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          to="/msme"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-100">{msme.business_name}</h1>
          <p className="text-sm text-slate-500 font-mono">{msme.gst_number}</p>
        </div>
        <div className="flex gap-2">
          {score && (
            <Link to={`/msme/${gstNumber}/health`}>
              <Button variant="secondary" size="sm">
                <TrendingUp size={16} />
                Full Health Card
              </Button>
            </Link>
          )}
          {!score && (
            <Link to="/assess">
              <Button size="sm">
                Run Assessment
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card hover className="flex items-center gap-3">
          <Building2 size={18} className="text-blue-400" />
          <div>
            <p className="text-xs text-slate-500">Business Type</p>
            <p className="text-sm font-medium text-slate-200">{msme.business_type}</p>
          </div>
        </Card>
        <Card hover className="flex items-center gap-3">
          <MapPin size={18} className="text-amber-400" />
          <div>
            <p className="text-xs text-slate-500">Location</p>
            <p className="text-sm font-medium text-slate-200">{msme.city}, {msme.state}</p>
          </div>
        </Card>
        <Card hover className="flex items-center gap-3">
          <Users size={18} className="text-emerald-400" />
          <div>
            <p className="text-xs text-slate-500">Employees</p>
            <p className="text-sm font-medium text-slate-200">{msme.employee_count.toLocaleString()}</p>
          </div>
        </Card>
        <Card hover className="flex items-center gap-3">
          <Calendar size={18} className="text-violet-400" />
          <div>
            <p className="text-xs text-slate-500">Annual Turnover</p>
            <p className="text-sm font-medium text-slate-200">{formatINR(msme.annual_turnover)}</p>
          </div>
        </Card>
      </div>

      {score && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col items-center justify-center py-8">
            <ScoreGauge score={score.overall_score} size={180} label="Overall Score" />
            <div className="mt-4">
              <RiskBadge score={score.overall_score} />
            </div>
          </Card>

          <div className="lg:col-span-2">
            {history && history.history && history.history.length > 0 ? (
              <Card>
                <h3 className="text-base font-semibold text-slate-200 mb-4">Score History</h3>
                <TrendLine data={history} />
              </Card>
            ) : (
              <Card className="flex items-center justify-center h-full text-slate-500">
                No score history available
              </Card>
            )}
          </div>
        </div>
      )}

      {credit && (
        <CreditRecommendation
          credit={credit}
          onApply={() => {}}
          onViewReport={() => {}}
        />
      )}

      {!score && (
        <Card className="text-center py-12">
          <p className="text-slate-400">No health assessment has been run for this MSME yet.</p>
          <Link to="/assess" className="mt-4 inline-block">
            <Button>Run Health Assessment</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
