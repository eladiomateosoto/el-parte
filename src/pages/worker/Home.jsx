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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white border-b-4 border-orange-600 shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-orange-600">ElParte</h1>
            <p className="text-xs text-gray-600">{worker?.nombre}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">¿Qué necesitas?</h2>
          <p className="text-gray-600">Elige una acción para continuar</p>
        </div>

        {/* Three main action buttons - Large and touch-friendly */}
        <div className="space-y-4">
          {/* Check In */}
          <button
            onClick={() => navigate('/worker/checkin')}
            className="w-full bg-white rounded-lg shadow-lg hover:shadow-xl p-8 text-left transition transform hover:scale-105 border-4 border-orange-200"
          >
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Fichar Entrada</h3>
            <p className="text-gray-600">Registra tu entrada en la obra</p>
          </button>

          {/* Check Out */}
          <button
            onClick={() => navigate('/worker/checkin')}
            className="w-full bg-white rounded-lg shadow-lg hover:shadow-xl p-8 text-left transition transform hover:scale-105 border-4 border-orange-200"
          >
            <div className="text-5xl mb-4">🚪</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Fichar Salida</h3>
            <p className="text-gray-600">Registra tu salida de la obra</p>
          </button>

          {/* Daily Part */}
          <button
            onClick={() => navigate('/worker/daily-part')}
            className="w-full bg-white rounded-lg shadow-lg hover:shadow-xl p-8 text-left transition transform hover:scale-105 border-4 border-orange-200"
          >
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Rellenar Parte</h3>
            <p className="text-gray-600">Registra las tareas del día</p>
          </button>
        </div>

        {/* Info section */}
        <div className="mt-12 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-sm text-blue-800">
            💡 <strong>Consejo:</strong> Tu sesión se mantendrá activa en este dispositivo. No tendrás que volver a introducir tu PIN.
          </p>
        </div>
      </main>
    </div>
  );
}
