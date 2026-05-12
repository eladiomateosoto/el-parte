import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-[#1F2937] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-[36px] border border-white/10 bg-[#111827]/90 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="p-10 text-center border-b border-white/10">
          <img src="/logo.png" alt="ElParte" className="w-[200px] mx-auto mb-4" />
          <p className="mt-4 text-xl text-white">Construcciones Rosquet</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 p-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white">Soy</p>
                <h2 className="mt-3 text-3xl font-bold text-white">Trabajador</h2>
              </div>
              <div className="text-5xl">👷</div>
            </div>
            <p className="text-white mb-8">Accede con tu nombre y PIN. Sesión persistente en el dispositivo.</p>
            <Link
              to="/worker/login"
              className="inline-flex items-center justify-center w-full bg-[#F97316] hover:bg-orange-500 text-white font-bold py-4 rounded-3xl transition"
            >
              SOY TRABAJADOR
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white">Acceso</p>
                <h2 className="mt-3 text-3xl font-bold text-white">Administración</h2>
              </div>
              <div className="text-5xl">⚙️</div>
            </div>
            <p className="text-white mb-8">Accede al panel para gestionar obras, trabajadores y categorías.</p>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center w-full bg-[#F97316] hover:bg-orange-500 text-white font-bold py-4 rounded-3xl transition"
            >
              ADMINISTRACIÓN
            </Link>
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
