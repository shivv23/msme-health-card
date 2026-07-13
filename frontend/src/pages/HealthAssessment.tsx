import { useState } from 'react';
import { Search, Stethoscope, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import HealthCard from '../components/health/HealthCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { assessHealth } from '../api/client';
import type { HealthScore } from '../types';

export default function HealthAssessment() {
  const [gstNumber, setGSTNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthScore | null>(null);
  const [error, setError] = useState('');

  const handleAssess = async () => {
    if (!gstNumber.trim()) {
      setError('Please enter a GST number');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const score = await assessHealth(gstNumber.trim());
      setResult(score);
    } catch (e: any) {
      setError(e.message || 'Assessment failed. Please check the GST number and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <Card className="text-center space-y-6 py-12">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <Stethoscope size={32} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Health Assessment</h1>
          <p className="text-slate-400 mt-2 max-w-md mx-auto">
            Enter a GST number to run a comprehensive financial health assessment
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter GST Number (e.g. 27AABCU9603R1ZM)"
                value={gstNumber}
                onChange={(e) => { setGSTNumber(e.target.value.toUpperCase()); setError(''); }}
                icon={<Search size={16} />}
                error={error}
              />
            </div>
            <Button
              onClick={handleAssess}
              loading={loading}
              size="lg"
            >
              Assess Health
            </Button>
          </div>
        </div>
      </Card>

      {loading && (
        <Card className="py-16">
          <LoadingSpinner
            size="lg"
            label="Running financial health assessment... This may take a few seconds."
          />
        </Card>
      )}

      {error && !loading && (
        <Card className="border-rose-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-rose-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-rose-400">Assessment Error</h3>
              <p className="text-sm text-slate-400 mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {result && !loading && (
        <HealthCard score={result} showShap={true} />
      )}
    </div>
  );
}
