import axios from 'axios';
import type {
  MSME,
  HealthScore,
  CreditAssessment,
  ScoreHistory,
  DashboardStats,
  RiskDistribution,
  TopMSME,
  RecentAssessment,
  MSMEFormData,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message || 'An error occurred';
    return Promise.reject(new Error(msg));
  }
);

// MSME endpoints
export const getMSMEs = async (): Promise<MSME[]> => {
  const { data } = await api.get<MSME[]>('/msme/');
  return data;
};

export const getMSME = async (gstNumber: string): Promise<MSME> => {
  const { data } = await api.get<MSME>(`/msme/${gstNumber}`);
  return data;
};

export const registerMSME = async (formData: MSMEFormData): Promise<MSME> => {
  const { data } = await api.post<MSME>('/msme/', formData);
  return data;
};

// Health assessment endpoints
export const assessHealth = async (gstNumber: string): Promise<HealthScore> => {
  const { data } = await api.post<HealthScore>(`/msme/${gstNumber}/assess`);
  return data;
};

export const getHealthScore = async (msmeId: number): Promise<HealthScore> => {
  const { data } = await api.get<HealthScore>(`/msme/${msmeId}/health`);
  return data;
};

export const getScoreHistory = async (msmeId: number): Promise<ScoreHistory[]> => {
  const { data } = await api.get<ScoreHistory[]>(`/msme/${msmeId}/score-history`);
  return data;
};

// Credit endpoints
export const getCreditAssessment = async (msmeId: number): Promise<CreditAssessment> => {
  const { data } = await api.get<CreditAssessment>(`/msme/${msmeId}/credit`);
  return data;
};

// Dashboard endpoints
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get<DashboardStats>('/dashboard/stats');
  return data;
};

export const getRiskDistribution = async (): Promise<RiskDistribution> => {
  const { data } = await api.get<RiskDistribution>('/dashboard/risk-distribution');
  return data;
};

export const getTopMSMEs = async (): Promise<TopMSME[]> => {
  const { data } = await api.get<TopMSME[]>('/dashboard/top-msmes');
  return data;
};

export const getRecentAssessments = async (): Promise<RecentAssessment[]> => {
  const { data } = await api.get<RecentAssessment[]>('/dashboard/recent-assessments');
  return data;
};

export default api;
