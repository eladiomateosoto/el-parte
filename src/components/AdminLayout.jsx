import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', to: '/admin/dashboard', icon: '🏗️' },
  { key: 'works', label: 'Obras', to: '/admin/works', icon: '📍' },
  { key: 'workers', label: 'Trabajadores', to: '/admin/workers', icon: '👷' },
  { key: 'categories', label: 'Categorías', to: '/admin/categories', icon: '📋' },
  { key: 'reports', label: 'Informes', to: '/admin/reports', icon: '📊' },
];

export default function AdminLayout({ title, description, active, children }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 lg:flex">
      <aside className="lg:w-80 bg-[#1F2937] text-white flex flex-col">
        <div className="px-6 py-8 border-b border-white/10">
          <div className="text-3xl font-black text-[#F97316]">ElParte</div>
          <p className="mt-2 text-sm text-slate-300">Construcciones Rosquet</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.to)}
              className={`w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3 text-sm font-semibold transition ${
                active === item.key
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-6 py-6 border-t border-white/10">
          <div className="mb-4 text-sm text-slate-300">
            {user?.email || 'Administrador'}
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 pb-10">
        <div className="bg-white border-b border-slate-200 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
