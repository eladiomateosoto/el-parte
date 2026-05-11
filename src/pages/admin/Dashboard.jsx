import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { initializeDefaultCategories } from '../../services/firestore';
import AdminLayout from '../../components/AdminLayout';

export default function AdminDashboard() {
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
      const worksQuery = query(collection(db, 'obras'), where('activa', '==', true));
      const worksSnap = await getDocs(worksQuery);
      const workersQuery = query(collection(db, 'trabajadores'), where('activo', '==', true));
      const workersSnap = await getDocs(workersQuery);
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

  return (
    <AdminLayout title="Dashboard" description="Gestiona todas las operaciones de tus obras" active="dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl shadow p-6 border border-orange-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Obras Activas</p>
              <p className="text-4xl font-bold text-[#F97316]">{stats.activeWorks}</p>
            </div>
            <div className="text-4xl">📍</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6 border border-orange-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Trabajadores Activos</p>
              <p className="text-4xl font-bold text-[#F97316]">{stats.activeWorkers}</p>
            </div>
            <div className="text-4xl">👷</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6 border border-orange-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Horas Esta Semana</p>
              <p className="text-4xl font-bold text-[#F97316]">{stats.weeklyHours}</p>
            </div>
            <div className="text-4xl">⏱️</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/admin/works')}
          className="bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 text-left transition"
        >
          <div className="text-4xl mb-3">🏢</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">Gestión de Obras</h3>
          <p className="text-sm text-slate-500">Crear, editar y gestionar proyectos</p>
        </button>

        <button
          onClick={() => navigate('/admin/workers')}
          className="bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 text-left transition"
        >
          <div className="text-4xl mb-3">👥</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">Trabajadores</h3>
          <p className="text-sm text-slate-500">Agregar y gestionar equipo</p>
        </button>

        <button
          onClick={() => navigate('/admin/categories')}
          className="bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 text-left transition"
        >
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">Categorías</h3>
          <p className="text-sm text-slate-500">Tipos de trabajo disponibles</p>
        </button>

        <button
          onClick={() => navigate('/admin/reports')}
          className="bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 text-left transition"
        >
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">Informes</h3>
          <p className="text-sm text-slate-500">Análisis de costes y horas</p>
        </button>
      </div>
    </AdminLayout>
  );
}
