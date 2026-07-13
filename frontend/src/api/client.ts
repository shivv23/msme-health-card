/// <reference types="vite/client" />
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
  AuthResponse,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  User,
  Notification,
  IndustryBenchmark,
  StateDistribution,
  ScoreDistribution,
  TrendData,
  ComparisonData,
  PortfolioRisk,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const msg = err.response?.data?.detail || err.message || 'An error occurred';
    return Promise.reject(new Error(msg));
  }
);

// Auth endpoints
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
};

export const register = async (regData: RegisterData): Promise<User> => {
  const { data } = await api.post<User>('/auth/register', regData);
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>('/auth/me');
  return data;
};

export const updateProfile = async (profileData: UpdateProfileData): Promise<User> => {
  const { data } = await api.put<User>('/auth/me', profileData);
  return data;
};

export const changePassword = async (pwData: ChangePasswordData): Promise<void> => {
  await api.put('/auth/me/password', pwData);
};

export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>('/auth/users');
  return data;
};

export const deactivateUser = async (id: number): Promise<void> => {
  await api.delete(`/auth/users/${id}`);
};

// Notification endpoints
export const getNotifications = async (): Promise<Notification[]> => {
  const { data } = await api.get<Notification[]>('/notifications');
  return data;
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

export const markAllRead = async (): Promise<void> => {
  await api.put('/notifications/read-all');
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
  const { data } = await api.get<{ count: number }>('/notifications/unread-count');
  return data;
};

// Export endpoints
export const exportCSV = async (): Promise<void> => {
  const { data } = await api.get('/export/csv', { responseType: 'blob' });
  const url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'msme_data.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const exportMSMECSV = async (msmeId: number): Promise<void> => {
  const { data } = await api.get(`/export/csv/${msmeId}`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `msme_${msmeId}_report.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const exportPDFData = async (msmeId: number): Promise<Record<string, unknown>> => {
  const { data } = await api.get(`/export/pdf/${msmeId}`);
  return data;
};

// Analytics endpoints
export const getIndustryBenchmark = async (): Promise<IndustryBenchmark[]> => {
  const { data } = await api.get<IndustryBenchmark[]>('/analytics/industry-benchmark');
  return data;
};

export const getStateDistribution = async (): Promise<StateDistribution[]> => {
  const { data } = await api.get<StateDistribution[]>('/analytics/state-distribution');
  return data;
};

export const getScoreDistribution = async (): Promise<ScoreDistribution[]> => {
  const { data } = await api.get<ScoreDistribution[]>('/analytics/score-distribution');
  return data;
};

export const getTrend = async (): Promise<TrendData[]> => {
  const { data } = await api.get<TrendData[]>('/analytics/trend');
  return data;
};

export const getComparison = async (ids: number[]): Promise<ComparisonData[]> => {
  const { data } = await api.get<ComparisonData[]>('/analytics/comparison', {
    params: { ids: ids.join(',') },
  });
  return data;
};

export const getPortfolioRisk = async (): Promise<PortfolioRisk> => {
  const { data } = await api.get<PortfolioRisk>('/analytics/portfolio-risk');
  return data;
};

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
  const { data } = await api.post<HealthScore>(`/health/assess/${gstNumber}`);
  return data;
};

export const getHealthScore = async (msmeId: number): Promise<HealthScore> => {
  const { data } = await api.get<HealthScore>(`/health/${msmeId}`);
  return data;
};

export const getScoreHistory = async (msmeId: number): Promise<ScoreHistory[]> => {
  const { data } = await api.get<ScoreHistory[]>(`/health/${msmeId}/history`);
  return data;
};

// Credit endpoints
export const getCreditAssessment = async (msmeId: number): Promise<CreditAssessment> => {
  const { data } = await api.get<CreditAssessment>(`/credit/${msmeId}`);
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
