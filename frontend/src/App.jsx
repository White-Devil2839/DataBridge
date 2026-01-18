import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TutorialProvider } from './context/TutorialContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import TutorialWelcome from './components/TutorialWelcome';
import TutorialOverlay from './components/TutorialOverlay';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ConnectorList from './pages/ConnectorList';
import ConnectorDetails from './pages/ConnectorDetails';
import ConnectorForm from './components/ConnectorForm';
import JobHistory from './pages/JobHistory';
import JobDetails from './pages/JobDetails';
import RawDataViewer from './pages/RawDataViewer';
import NormalizedDataView from './pages/NormalizedDataView';
import SystemHealth from './pages/SystemHealth';

const ConnectorFormWrapper = () => {
  const { id } = useParams();
  return <ConnectorForm connectorId={id} />;
};

function App() {
  return (
    <AuthProvider>
      <TutorialProvider>
        <Router>
          <TutorialWelcome />
          <TutorialOverlay />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/connectors"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ConnectorList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/connectors/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ConnectorForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/connectors/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ConnectorDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/connectors/:id/edit"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ConnectorFormWrapper />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Layout>
                    <JobHistory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <JobDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/data/raw"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RawDataViewer />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/data/normalized"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NormalizedDataView />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/system/health"
              element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <SystemHealth />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </TutorialProvider>
    </AuthProvider>
  );
}

export default App;
