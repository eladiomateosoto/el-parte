import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await adminLogin(email, password);
      console.log('Login successful:', user);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errorMap = {
        'auth/user-not-found': 'El usuario no existe',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-email': 'Email inválido',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
        'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
      };
      const message = errorMap[err.code] || err.message || 'Error al iniciar sesión';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F2937] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-white/95">
        <div className="bg-[#1F2937] px-8 py-10 text-center text-white">
          <h1 className="text-5xl font-black text-[#F97316]">ElParte</h1>
          <p className="mt-3 text-sm uppercase tracking-[0.3em] text-slate-400">Administración</p>
        </div>

        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-3xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F97316] hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-4 rounded-3xl transition duration-200"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8">
            ¿Problemas? Contacta con soporte interno.
          </p>
        </div>
      </div>
    </div>
  );
}
