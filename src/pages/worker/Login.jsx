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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">ElParte</h1>
          <p className="text-gray-600">Parte Diario</p>
        </div>

        {/* Step 1: Select Worker */}
        {step === 'select' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Selecciona tu nombre</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {workers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleWorkerSelect(w)}
                  className="w-full text-left px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition"
                >
                  <p className="font-semibold text-gray-900">{w.nombre}</p>
                  <p className="text-sm text-gray-600">{w.puesto}</p>
                </button>
              ))}
            </div>

            {workers.length === 0 && !loading && (
              <p className="text-center text-gray-500">No hay trabajadores disponibles</p>
            )}
          </>
        )}

        {/* Step 2: Enter PIN */}
        {step === 'pin' && (
          <>
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-900">
                Hola, <span className="text-orange-600">{selectedWorker?.nombre}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">Ingresa tu PIN de 4 dígitos</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-6">
              {/* PIN Input */}
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
                  className="w-full text-center text-4xl tracking-widest px-4 py-4 border-2 border-orange-200 rounded-lg focus:outline-none focus:border-orange-500 font-mono"
                  autoFocus
                  required
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || pin.length !== 4}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold py-3 rounded-lg transition duration-200 text-lg"
              >
                {loading ? 'Verificando...' : 'Entrar'}
              </button>

              {/* Back button */}
              <button
                type="button"
                onClick={() => {
                  setStep('select');
                  setSelectedWorker(null);
                  setPin('');
                  setError('');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition duration-200"
              >
                Cambiar trabajador
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
