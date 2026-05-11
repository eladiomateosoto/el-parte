import { useNavigate } from 'react-router-dom';
import { useWorker } from '../../contexts/WorkerContext';

export default function WorkerHome() {
  const navigate = useNavigate();
  const { worker, logout } = useWorker();

  const handleLogout = () => {
    logout();
    navigate('/worker/login');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900">
      <header className="bg-[#1F2937] text-white sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#F97316]">ElParte</h1>
            <p className="text-sm text-slate-300">{worker?.nombre}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-3xl text-sm font-semibold"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 mb-3">Fichajes rápidos</h2>
          <p className="text-slate-600">Selecciona una acción para trabajar seguro y rápido.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/worker/checkin')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-3xl shadow-lg transition text-xl"
          >
            🟢 FICHAR ENTRADA
          </button>

          <button
            onClick={() => navigate('/worker/checkin')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-3xl shadow-lg transition text-xl"
          >
            🔴 FICHAR SALIDA
          </button>

          <button
            onClick={() => navigate('/worker/daily-part')}
            className="w-full bg-[#F97316] hover:bg-orange-700 text-white font-bold py-6 rounded-3xl shadow-lg transition text-xl"
          >
            📋 RELLENAR PARTE
          </button>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-500 text-base leading-7">
            Tu sesión permanece activa en este dispositivo. Si quieres cambiar de trabajador, pulsa Salir.
          </p>
        </div>
      </main>
    </div>
  );
}
