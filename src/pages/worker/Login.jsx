import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorker } from '../../contexts/WorkerContext';
import { db } from '../../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function WorkerLogin() {
  const navigate = useNavigate();
  const { worker, workerLogin } = useWorker();
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (worker) {
      navigate('/worker/home');
    }
  }, [worker, navigate]);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const workersQuery = query(collection(db, 'trabajadores'), where('activo', '==', true));
      const workersSnap = await getDocs(workersQuery);
      const workersList = workersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWorkers(workersList);
    } catch (err) {
      setError('Error cargando trabajadores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      setError('Selecciona un trabajador');
      return;
    }
    if (pin.length !== 4) {
      setError('El PIN debe tener 4 dígitos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await workerLogin(selectedWorkerId, pin);
      navigate('/worker/home');
    } catch (err) {
      setError('PIN incorrecto');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F2937] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/95 shadow-2xl overflow-hidden">
        <div className="bg-[#1F2937] px-8 py-10 text-center text-white">
          <h1 className="text-5xl font-black tracking-tight text-[#F97316]">ElParte</h1>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-300">Construcciones Rosquet</p>
        </div>

        <div className="px-8 py-8">
          <div className="mb-8 text-center">
            <p className="text-slate-900 text-lg font-semibold">Accede como trabajador</p>
            <p className="mt-2 text-slate-500 text-sm">Selecciona tu nombre y escribe tu PIN de 4 dígitos.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Trabajador activo</label>
              <select
                value={selectedWorkerId}
                onChange={(e) => {
                  setSelectedWorkerId(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-4 border border-slate-300 rounded-3xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              >
                <option value="">Selecciona un trabajador</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.nombre} — {w.puesto}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(value);
                  setError('');
                }}
                placeholder="••••"
                maxLength="4"
                className="w-full text-center text-5xl tracking-[0.55em] px-4 py-4 border-2 border-slate-200 rounded-3xl focus:outline-none focus:border-[#F97316] font-mono"
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
              disabled={loading || !selectedWorkerId || pin.length !== 4}
              className="w-full bg-[#F97316] hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-4 rounded-3xl transition text-lg"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>

            <p className="text-center text-slate-500 text-sm">La sesión se mantiene en este dispositivo.</p>
          </form>

          {!loading && workers.length === 0 && (
            <p className="text-center text-slate-500 mt-6">No hay trabajadores activos disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
}
