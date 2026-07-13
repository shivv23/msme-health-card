import { AlertTriangle, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatINR } from '../../lib/utils';
import type { CreditAssessment } from '../../types';

interface CreditRecommendationProps {
  credit: CreditAssessment;
  onApply?: () => void;
  onViewReport?: () => void;
}

export default function CreditRecommendation({ credit, onApply, onViewReport }: CreditRecommendationProps) {
  return (
    <Card className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Credit Assessment</h3>
        <Badge variant={credit.eligibility ? 'green' : 'red'}>
          {credit.eligibility ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
        </Badge>
      </div>

        {credit.eligibility && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-slate-800/50 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Recommended Amount</p>
            <p className="text-xl font-bold text-emerald-400">{formatINR(credit.recommended_amount)}</p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Tenure</p>
            <p className="text-xl font-bold text-slate-100">{credit.recommended_tenure_months} months</p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Interest Rate</p>
            <p className="text-xl font-bold text-blue-400">{credit.recommended_rate}% p.a.</p>
          </div>
        </div>
      )}

      {Object.keys(credit.risk_factors).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            Risk Factors
          </h4>
          <ul className="space-y-1.5">
            {Object.entries(credit.risk_factors).map(([factor, desc], i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-rose-400 mt-0.5">•</span>
                {factor.replace(/_/g, ' ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 pt-2">
      {credit.eligibility && (
          <Button onClick={onApply} className="flex-1">
            Apply Now
            <ArrowRight size={16} />
          </Button>
        )}
        <Button variant="secondary" onClick={onViewReport} className={!credit.eligibility ? 'flex-1' : ''}>
          <FileText size={16} />
          View Detailed Report
        </Button>
      </div>
    </Card>
  );
}
