import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Share2, ArrowLeft } from 'lucide-react';
import HealthCard from '../components/health/HealthCard';
import CreditRecommendation from '../components/health/CreditRecommendation';
import TrendLine from '../components/charts/TrendLine';
import { PageLoader } from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { getHealthScore, getCreditAssessment, getScoreHistory, getMSME } from '../api/client';
import type { HealthScore, CreditAssessment, ScoreHistory, MSME } from '../types';

export default function HealthCardView() {
  const { gstNumber } = useParams<{ gstNumber: string }>();
  const [msme, setMsme] = useState<MSME | null>(null);
  const [score, setScore] = useState<HealthScore | null>(null);
  const [credit, setCredit] = useState<CreditAssessment | null>(null);
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!gstNumber) return;

    const load = async () => {
      try {
        const [msmeData, scoreData] = await Promise.all([
          getMSME(gstNumber),
          getHealthScore(0).catch(() => null),
        ]);
        setMsme(msmeData);

        if (scoreData) {
          setScore(scoreData);
          const [hist, creditData] = await Promise.all([
            getScoreHistory(scoreData.msme_id).catch(() => []),
            getCreditAssessment(scoreData.msme_id).catch(() => null),
          ]);
          setHistory(hist);
          setCredit(creditData);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load health card');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [gstNumber]);

  if (loading) return <PageLoader label="Loading health card..." />;
  if (error) return <div className="text-center text-rose-400 py-20">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/msme/${gstNumber}`}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              {msme?.business_name || gstNumber}
            </h1>
            <p className="text-sm text-slate-500">Complete Health Card & Credit Assessment</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Download size={16} />
            Download PDF
          </Button>
          <Button variant="secondary" size="sm">
            <Share2 size={16} />
            Share
          </Button>
        </div>
      </div>

      {score ? (
        <HealthCard score={score} showShap={true} />
      ) : (
        <div className="text-center py-12 text-slate-500">
          No health assessment data available for this MSME
        </div>
      )}

      {credit && (
        <CreditRecommendation credit={credit} />
      )}

      {history.length > 0 && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
          <h3 className="text-base font-semibold text-slate-200 mb-4">Score History</h3>
          <TrendLine data={history} />
        </div>
      )}
    </div>
  );
}
