import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { WorkerProvider, useWorker } from './contexts/WorkerContext.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminWorks from './pages/admin/Works.jsx';
import AdminWorkers from './pages/admin/Workers.jsx';
import AdminCategories from './pages/admin/Categories.jsx';
import AdminReports from './pages/admin/Reports.jsx';
import AdminLogin from './pages/admin/Login.jsx';
import WorkerHome from './pages/worker/Home.jsx';
import WorkerCheckin from './pages/worker/Checkin.jsx';
import WorkerDailyPart from './pages/worker/DailyPart.jsx';
import WorkerLogin from './pages/worker/Login.jsx';
import './index.css';

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
