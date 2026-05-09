import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WorkerProvider, useWorker } from './contexts/WorkerContext';
import './index.css';

// Admin pages - placeholders for now
const AdminDashboard = () => <div className="p-8">Admin Dashboard</div>;
const AdminWorks = () => <div className="p-8">Admin Works</div>;
const AdminWorkers = () => <div className="p-8">Admin Workers</div>;
const AdminCategories = () => <div className="p-8">Admin Categories</div>;
const AdminReports = () => <div className="p-8">Admin Reports</div>;
const AdminLogin = () => <div className="p-8">Admin Login</div>;

// Worker pages - placeholders for now
const WorkerHome = () => <div className="p-8">Worker Home</div>;
const WorkerCheckin = () => <div className="p-8">Worker Checkin</div>;
const WorkerDailyPart = () => <div className="p-8">Worker Daily Part</div>;
const WorkerLogin = () => <div className="p-8">Worker Login</div>;

// Protected route components
const AdminRoute = ({ children }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!user || userRole !== 'admin') {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

const WorkerRoute = ({ children }) => {
  const { worker, loading } = useWorker();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!worker) {
    return <Navigate to="/worker/login" />;
  }

  return children;
};

function AppRoutes() {
  const { user, userRole } = useAuth();

  return (
    <Routes>
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/works"
        element={
          <AdminRoute>
            <AdminWorks />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/workers"
        element={
          <AdminRoute>
            <AdminWorkers />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminRoute>
            <AdminCategories />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <AdminReports />
          </AdminRoute>
        }
      />

      {/* Worker routes */}
      <Route path="/worker/login" element={<WorkerLogin />} />
      <Route
        path="/worker/home"
        element={
          <WorkerRoute>
            <WorkerHome />
          </WorkerRoute>
        }
      />
      <Route
        path="/worker/checkin"
        element={
          <WorkerRoute>
            <WorkerCheckin />
          </WorkerRoute>
        }
      />
      <Route
        path="/worker/daily-part"
        element={
          <WorkerRoute>
            <WorkerDailyPart />
          </WorkerRoute>
        }
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          user && userRole === 'admin' ? (
            <Navigate to="/admin/dashboard" />
          ) : (
            <Navigate to="/worker/login" />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <WorkerProvider>
          <AppRoutes />
        </WorkerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
