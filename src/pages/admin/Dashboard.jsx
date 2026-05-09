import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { initializeDefaultCategories } from '../../services/firestore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    activeWorks: 0,
    activeWorkers: 0,
    weeklyHours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initializeDefaultCategories();
      await fetchStats();
    };

    init();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch active works
      const worksQuery = query(collection(db, 'obras'), where('activa', '==', true));
      const worksSnap = await getDocs(worksQuery);

      // Fetch active workers
      const workersQuery = query(collection(db, 'trabajadores'), where('activo', '==', true));
      const workersSnap = await getDocs(workersQuery);

      // TODO: Calculate weekly hours from parts
      // For now, we'll use 0
      const weeklyHours = 0;

      setStats({
        activeWorks: worksSnap.size,
        activeWorkers: workersSnap.size,
        weeklyHours,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-orange-600">ElParte</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido, Administrador</h2>
          <p className="text-gray-600">Gestiona todas las operaciones de tus obras</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600 uppercase tracking-wide">Obras Activas</p>
                <p className="text-3xl font-bold text-orange-600">{stats.activeWorks}</p>
              </div>
              <div className="text-4xl text-orange-200">📍</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600 uppercase tracking-wide">Trabajadores Activos</p>
                <p className="text-3xl font-bold text-orange-600">{stats.activeWorkers}</p>
              </div>
              <div className="text-4xl text-orange-200">👷</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600 uppercase tracking-wide">Horas Esta Semana</p>
                <p className="text-3xl font-bold text-orange-600">{stats.weeklyHours}</p>
              </div>
              <div className="text-4xl text-orange-200">⏱️</div>
            </div>
          </div>
        </div>

        {/* Quick access grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Obras */}
          <button
            onClick={() => navigate('/admin/works')}
            className="bg-white rounded-lg shadow hover:shadow-md p-6 text-left transition"
          >
            <div className="text-3xl mb-3">🏢</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Gestión de Obras</h3>
            <p className="text-sm text-gray-600">Crear, editar y gestionar proyectos</p>
          </button>

          {/* Trabajadores */}
          <button
            onClick={() => navigate('/admin/workers')}
            className="bg-white rounded-lg shadow hover:shadow-md p-6 text-left transition"
          >
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Trabajadores</h3>
            <p className="text-sm text-gray-600">Agregar y gestionar equipo</p>
          </button>

          {/* Categorías */}
          <button
            onClick={() => navigate('/admin/categories')}
            className="bg-white rounded-lg shadow hover:shadow-md p-6 text-left transition"
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Categorías</h3>
            <p className="text-sm text-gray-600">Tipos de trabajo disponibles</p>
          </button>

          {/* Informes */}
          <button
            onClick={() => navigate('/admin/reports')}
            className="bg-white rounded-lg shadow hover:shadow-md p-6 text-left transition"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Informes</h3>
            <p className="text-sm text-gray-600">Análisis de costes y horas</p>
          </button>
        </div>
      </main>
    </div>
  );
}
