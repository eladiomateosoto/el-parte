import { useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNavigate = (to) => {
    setMobileMenuOpen(false);
    navigate(to);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100">
      <div className="lg:flex">
        <aside className="hidden lg:flex lg:w-80 bg-[#1F2937] text-white flex-col">
          <div className="px-6 py-8 border-b border-white/10">
            <img src="/logo.png" alt="ElParte" className="h-[40px] mb-2" />
            <p className="mt-2 text-sm uppercase tracking-[0.25em] text-white">Construcciones Rosquet</p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.to)}
                className={`w-full text-left rounded-3xl px-4 py-4 flex items-center gap-3 text-sm font-semibold transition ${
                  active === item.key
                    ? 'bg-[#F97316] text-slate-950 shadow-lg'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-6 py-6 border-t border-white/10">
            <div className="mb-4 text-sm text-white truncate">{user?.email || 'Administrador'}</div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-3xl"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="lg:hidden bg-[#1F2937] px-4 py-4 flex items-center justify-between border-b border-white/10">
            <div>
              <img src="/logo.png" alt="ElParte" className="h-[40px] mb-1" />
              <p className="text-xs uppercase tracking-[0.25em] text-white">Construcciones Rosquet</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-white"
              aria-label="Abrir menú"
            >
              ☰
            </button>
          </header>

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden">
              <div className="h-full w-72 bg-[#1F2937] p-6 shadow-2xl">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <img src="/logo.png" alt="ElParte" className="h-[40px] mb-1" />
                    <p className="text-xs uppercase tracking-[0.25em] text-white">Construcciones Rosquet</p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-white"
                    aria-label="Cerrar menú"
                  >
                    ✕
                  </button>
                </div>

                <nav className="space-y-3">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleNavigate(item.to)}
                      className={`w-full text-left rounded-3xl px-4 py-4 flex items-center gap-3 text-sm font-semibold transition ${
                        active === item.key
                          ? 'bg-[#F97316] text-slate-950 shadow-lg'
                          : 'text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="mb-4 text-sm text-white truncate">{user?.email || 'Administrador'}</div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-3xl"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 pb-10">
            <div className="bg-[#1F2937] border-b border-slate-800 px-6 py-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
                    {description && (
                      <p className="mt-3 max-w-3xl text-sm text-white">{description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
