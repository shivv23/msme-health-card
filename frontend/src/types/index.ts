export interface MSME {
  id: number;
  gst_number: string;
  business_name: string;
  business_type: string;
  industry: string;
  state: string;
  city: string;
  employee_count: number;
  annual_turnover: number;
  incorporation_date: string;
  created_at: string;
}

export interface HealthScore {
  id: number;
  msme_id: number;
  gst_number: string;
  overall_score: number;
  revenue_score: number;
  payment_score: number;
  compliance_score: number;
  employment_score: number;
  digital_score: number;
  cashflow_score: number;
  risk_category: 'GREEN' | 'AMBER' | 'RED';
  strengths: string[];
  weaknesses: string[];
  data_sources_used: string[];
  assessment_date: string;
  model_version: string;
  shap_explanations: Record<string, number>;
}

export interface CreditAssessment {
  id: number;
  msme_id: number;
  eligible: boolean;
  recommended_amount: number;
  tenure_months: number;
  interest_rate: number;
  risk_factors: string[];
  assessment_date: string;
}

export interface ScoreHistory {
  date: string;
  overall_score: number;
  revenue_score: number;
  payment_score: number;
  compliance_score: number;
  employment_score: number;
  digital_score: number;
  cashflow_score: number;
}

export interface DashboardStats {
  total_msmes: number;
  average_score: number;
  green_percentage: number;
  pending_assessments: number;
}

export interface RiskDistribution {
  green: number;
  amber: number;
  red: number;
}

export interface TopMSME {
  id: number;
  business_name: string;
  gst_number: string;
  overall_score: number;
  risk_category: string;
}

export interface RecentAssessment {
  id: number;
  msme_name: string;
  gst_number: string;
  overall_score: number;
  risk_category: string;
  assessment_date: string;
}

export interface MSMEFormData {
  business_name: string;
  gst_number: string;
  business_type: string;
  industry: string;
  state: string;
  city: string;
  employee_count: number;
  annual_turnover: number;
}

export type DimensionKey =
  | 'revenue_score'
  | 'payment_score'
  | 'compliance_score'
  | 'employment_score'
  | 'digital_score'
  | 'cashflow_score';

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  revenue_score: 'Revenue',
  payment_score: 'Payment',
  compliance_score: 'Compliance',
  employment_score: 'Employment',
  digital_score: 'Digital',
  cashflow_score: 'Cash Flow',
};

export const RISK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GREEN: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  AMBER: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  RED: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh',
  'Puducherry', 'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli',
  'Lakshadweep',
];

export const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'Private Limited',
  'Public Limited',
  'LLP',
  'Cooperative',
];

export const INDUSTRIES = [
  'Manufacturing',
  'Trading',
  'Services',
  'Textiles',
  'Food Processing',
  'IT & Electronics',
  'Construction',
  'Agriculture',
  'Healthcare',
  'Education',
  'Transportation',
  'Hospitality',
  'Other',
];
