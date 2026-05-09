import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorker } from '../../contexts/WorkerContext';
import { getActiveWorks } from '../../services/firestore';
import { getCurrentLocation, findNearbyWorks } from '../../services/geolocation';
import { formatTime, formatDate } from '../../utils/helpers';

export default function WorkerCheckin() {
  const navigate = useNavigate();
  const { worker, logout } = useWorker();
  const [works, setWorks] = useState([]);
  const [nearbyWorks, setNearbyWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [checkinType, setCheckinType] = useState(null); // 'entrada' or 'salida'
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const worksData = await getActiveWorks();
      setWorks(worksData);
    } catch (err) {
      setError('Error cargando obras');
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/worker/login');
  };

  const handleGetLocation = async (type) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      setCheckinType(type);

      // Get current location
      const location = await getCurrentLocation();
      setLocationData(location);

      // Find nearby works
      const nearby = findNearbyWorks(location.lat, location.lng, works, 50);

      if (nearby.length === 0) {
        setError(
          'No estás cerca de ninguna obra registrada. Acércate a menos de 50 metros de una obra para fichajes.'
        );
        setNearbyWorks([]);
      } else {
        setNearbyWorks(nearby);
        setSuccess(`¡Ubicación encontrada! Detectadas ${nearby.length} obra(s) cercana(s).`);
      }
    } catch (err) {
      setError(err.message);
      setNearbyWorks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckin = async (workId) => {
    if (!locationData || !checkinType) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const work = works.find((w) => w.id === workId);
      const timestamp = new Date().toISOString();
      const timeFormatted = formatTime(new Date());

      // TODO: Save to Firestore
      // For now, just show a success message
      setSuccess(
        `✓ ${checkinType === 'entrada' ? 'Entrada' : 'Salida'} registrada en ${work.nombre} a las ${timeFormatted}`
      );

      // Reset state
      setTimeout(() => {
        setCheckinType(null);
        setLocationData(null);
        setNearbyWorks([]);
      }, 3000);
    } catch (err) {
      setError('Error al registrar fichaje');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <header className="bg-white border-b-4 border-orange-600 shadow-sm sticky top-0">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/worker/home')}
            className="text-orange-600 font-bold text-lg"
          >
            ← Atrás
          </button>
          <h1 className="text-2xl font-bold text-orange-600">ElParte</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-2 rounded text-sm"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Fichaje</h2>
          <p className="text-gray-600">Entrada / Salida con geolocalización</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Location info */}
        {locationData && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 text-sm">
            <p>📍 Coordenadas: {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}</p>
            <p>Precisión: ±{Math.round(locationData.accuracy)}m</p>
          </div>
        )}

        {/* Main buttons - show when no location detected */}
        {!locationData && (
          <div className="space-y-4 mb-8">
            <button
              onClick={() => handleGetLocation('entrada')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-6 rounded-lg text-xl transition transform hover:scale-105 shadow-lg"
            >
              {loading ? '📍 Localizando...' : '🟢 FICHAR ENTRADA'}
            </button>

            <button
              onClick={() => handleGetLocation('salida')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-6 rounded-lg text-xl transition transform hover:scale-105 shadow-lg"
            >
              {loading ? '📍 Localizando...' : '🔴 FICHAR SALIDA'}
            </button>
          </div>
        )}

        {/* Nearby works - show after location detected */}
        {locationData && nearbyWorks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Obras detectadas (&lt; 50m)
            </h3>
            {nearbyWorks.map((work) => (
              <button
                key={work.id}
                onClick={() => handleConfirmCheckin(work.id)}
                disabled={loading}
                className="w-full bg-white border-4 border-orange-400 rounded-lg p-6 text-left hover:bg-orange-50 disabled:bg-gray-100 transition"
              >
                <p className="font-bold text-lg text-orange-600 mb-1">{work.nombre}</p>
                <p className="text-sm text-gray-600">{work.direccion}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">
                    {checkinType === 'entrada'
                      ? `✓ Confirmar entrada a las ${formatTime(new Date())}`
                      : `✓ Confirmar salida a las ${formatTime(new Date())}`}
                  </p>
                </div>
              </button>
            ))}

            <button
              onClick={() => {
                setLocationData(null);
                setNearbyWorks([]);
                setCheckinType(null);
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Info section */}
        <div className="mt-12 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-sm text-blue-800 mb-3">
            <strong>ℹ️ Cómo funciona:</strong>
          </p>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Presiona el botón de entrada o salida</li>
            <li>Permite el acceso a tu ubicación GPS</li>
            <li>Si estás en rango de una obra, aparecerá en pantalla</li>
            <li>Confirma para registrar el fichaje</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
