import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorker } from '../../contexts/WorkerContext';
import { db } from '../../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function WorkerLogin() {
  const navigate = useNavigate();
  const { worker, workerLogin, loadWorker } = useWorker();
  const [step, setStep] = useState('select'); // 'select' or 'pin'
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If worker is already logged in, redirect to home
  useEffect(() => {
    if (worker) {
      navigate('/worker/home');
    }
  }, [worker, navigate]);

  // Load workers list on mount
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

  const handleWorkerSelect = (selectedWorkerData) => {
    setSelectedWorker(selectedWorkerData);
    setPin('');
    setError('');
    setStep('pin');
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('El PIN debe tener 4 dígitos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Try to log in with PIN
      await workerLogin(selectedWorker.id, pin);
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
          <p className="mt-3 text-sm uppercase tracking-[0.3em] text-slate-300">Construcciones Rosquet</p>
        </div>

        <div className="px-8 py-8">
          <div className="mb-8 text-center">
            <p className="text-slate-700 text-lg font-semibold">Accede como trabajador</p>
            <p className="mt-2 text-slate-500 text-sm">Elige tu nombre y usa tu PIN de 4 dígitos.</p>
          </div>

          {step === 'select' && (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {workers.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleWorkerSelect(w)}
                    className="w-full text-left rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm hover:border-[#F97316] hover:bg-[#FCE7D7] transition"
                  >
                    <p className="text-lg font-bold text-slate-900">{w.nombre}</p>
                    <p className="text-sm text-slate-500">{w.puesto}</p>
                  </button>
                ))}
              </div>

              {workers.length === 0 && !loading && (
                <p className="text-center text-slate-500 mt-4">No hay trabajadores disponibles</p>
              )}
            </>
          )}

          {step === 'pin' && (
            <>
              <div className="mb-6 text-center">
                <p className="text-xl font-semibold text-slate-900">
                  Hola, <span className="text-[#F97316]">{selectedWorker?.nombre}</span>
                </p>
                <p className="text-slate-500 mt-2">Ingresa tu PIN de 4 dígitos</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-6">
                <div>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPin(value);
                    }}
                    placeholder="••••"
                    maxLength="4"
                    className="w-full text-center text-5xl tracking-[0.55em] px-4 py-5 border-2 border-slate-200 rounded-3xl focus:outline-none focus:border-[#F97316] font-mono"
                    autoFocus
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || pin.length !== 4}
                  className="w-full bg-[#F97316] hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-4 rounded-3xl transition text-lg"
                >
                  {loading ? 'Verificando...' : 'Entrar'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('select');
                    setSelectedWorker(null);
                    setPin('');
                    setError('');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-4 rounded-3xl transition"
                >
                  Cambiar trabajador
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );

}
