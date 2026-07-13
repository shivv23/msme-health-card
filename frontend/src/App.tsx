import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import HealthAssessment from './pages/HealthAssessment';
import HealthCardView from './pages/HealthCardView';
import MSMEList from './pages/MSMEList';
import MSMEDetail from './pages/MSMEDetail';
import RegisterMSME from './pages/RegisterMSME';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assess" element={<HealthAssessment />} />
        <Route path="/msme" element={<MSMEList />} />
        <Route path="/msme/:gstNumber" element={<MSMEDetail />} />
        <Route path="/msme/:gstNumber/health" element={<HealthCardView />} />
        <Route path="/register" element={<RegisterMSME />} />
      </Routes>
    </Layout>
  );
}
