export interface MSME {
  id: number;
  gst_number: string;
  business_name: string;
  business_type: string;
  industry_sector: string;
  registration_date: string;
  state: string;
  city: string;
  employee_count: number;
  annual_turnover: number;
  created_at: string;
  updated_at: string;
}

export interface HealthScore {
  id: number;
  msme_id: number;
  overall_score: number;
  revenue_stability: number;
  payment_discipline: number;
  compliance_health: number;
  employment_strength: number;
  digital_presence: number;
  cash_flow_quality: number;
  risk_category: string;
  strengths: Record<string, number>;
  weaknesses: Record<string, number>;
  shap_values: Record<string, number>;
  data_sources_used: Record<string, boolean>;
  assessment_date: string;
  model_version: string;
}

export interface CreditAssessment {
  id: number;
  msme_id: number;
  health_score_id: number;
  recommended_amount: number;
  recommended_tenure_months: number;
  recommended_rate: number;
  eligibility: boolean;
  confidence_score: number;
  risk_factors: Record<string, unknown>;
  assessment_date: string;
}

export interface ScoreHistory {
  msme_id: number;
  business_name: string;
  history: HealthScore[];
}

export interface DashboardStats {
  total_msme: number;
  total_assessments: number;
  avg_score: number;
  green_count: number;
  amber_count: number;
  red_count: number;
  avg_turnover: number;
  total_eligible: number;
}

export interface RiskDistribution {
  green: number;
  amber: number;
  red: number;
  green_pct: number;
  amber_pct: number;
  red_pct: number;
}

export interface TopMSME {
  msme_id: number;
  business_name: string;
  gst_number: string;
  overall_score: number;
  risk_category: string;
  annual_turnover: number;
}

export interface RecentAssessment {
  msme_id: number;
  business_name: string;
  gst_number: string;
  overall_score: number;
  risk_category: string;
  recommended_amount: number;
  assessment_date: string;
}

export interface MSMEFormData {
  business_name: string;
  gst_number: string;
  business_type: string;
  industry_sector: string;
  registration_date: string;
  state: string;
  city: string;
  employee_count: number;
  annual_turnover: number;
}

export type DimensionKey =
  | 'revenue_stability'
  | 'payment_discipline'
  | 'compliance_health'
  | 'employment_strength'
  | 'digital_presence'
  | 'cash_flow_quality';

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  revenue_stability: 'Revenue Stability',
  payment_discipline: 'Payment Discipline',
  compliance_health: 'Compliance Health',
  employment_strength: 'Employment Strength',
  digital_presence: 'Digital Presence',
  cash_flow_quality: 'Cash Flow Quality',
};

export const RISK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Red: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
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
  'Manufacturing', 'Services', 'Trading', 'Other',
];

export const INDUSTRIES = [
  'Automotive Components', 'Textiles & Garments', 'Food Processing',
  'Pharmaceuticals', 'IT Services', 'Electronics Manufacturing',
  'Chemicals & Dyes', 'Plastics & Polymers', 'Metal Fabrication',
  'Packaging Solutions', 'Agricultural Equipment', 'Construction Materials',
  'Paper & Stationery', 'Rubber Products', 'Glass & Ceramics',
  'Wood & Furniture', 'Printing & Publishing', 'Leather Goods',
  'Engineering Services', 'Logistics & Warehousing',
];

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'officer' | 'msme_owner';
  phone: string | null;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  phone?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'info' | 'warning' | 'success' | 'alert';
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface IndustryBenchmark {
  industry: string;
  avg_score: number;
  count: number;
}

export interface StateDistribution {
  state: string;
  count: number;
  avg_score: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
}

export interface TrendData {
  month: string;
  avg_score: number;
  assessments: number;
}

export interface ComparisonData {
  msme_id: number;
  name: string;
  [key: string]: string | number;
}

export interface PortfolioRisk {
  total: number;
  green_pct: number;
  amber_pct: number;
  red_pct: number;
  at_risk_count: number;
  avg_recovery_score: number;
}
