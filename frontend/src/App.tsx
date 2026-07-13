import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HealthAssessment from './pages/HealthAssessment';
import HealthCardView from './pages/HealthCardView';
import MSMEList from './pages/MSMEList';
import MSMEDetail from './pages/MSMEDetail';
import RegisterMSME from './pages/RegisterMSME';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/assess" element={<HealthAssessment />} />
                  <Route path="/msme" element={<MSMEList />} />
                  <Route path="/msme/:gstNumber" element={<MSMEDetail />} />
                  <Route path="/msme/:gstNumber/health" element={<HealthCardView />} />
                  <Route path="/register" element={<RegisterMSME />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
