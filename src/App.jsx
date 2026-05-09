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
import Debug from './pages/Debug.jsx';
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

function LandingPage() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (user && userRole === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }

  if (user && userRole === 'worker') {
    return <Navigate to="/worker/home" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-3xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-orange-600 mb-4">ElParte</h1>
          <p className="text-gray-600 text-lg">El sistema de control de obra para administradores y trabajadores.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-8 rounded-3xl border border-orange-100 bg-orange-50">
            <h2 className="text-2xl font-semibold text-orange-700 mb-4">Soy administrador</h2>
            <p className="text-gray-600 mb-6">Accede al panel para gestionar obras, trabajadores y categorías.</p>
            <a
              href="/admin/login"
              className="inline-flex items-center justify-center w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Iniciar sesión admin
            </a>
          </div>

          <div className="p-8 rounded-3xl border border-orange-100 bg-white">
            <h2 className="text-2xl font-semibold text-orange-700 mb-4">Soy trabajador</h2>
            <p className="text-gray-600 mb-6">Fichaje y partes diarios con acceso rápido por PIN.</p>
            <a
              href="/worker/login"
              className="inline-flex items-center justify-center w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Acceder como trabajador
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, userRole } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/debug" element={<Debug />} />

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

      <Route path="*" element={<Navigate to="/" />} />
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
