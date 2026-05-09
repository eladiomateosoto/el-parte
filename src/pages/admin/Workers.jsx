import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveWorkers, createWorker, updateWorker } from '../../services/firestore';

export default function AdminWorkers() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    puesto: '',
    costePorHora: '',
    pin: '',
    pinConfirm: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const workersData = await getActiveWorkers();
      setWorkers(workersData);
    } catch (err) {
      setError('Error cargando trabajadores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleOpenForm = (worker = null) => {
    if (worker) {
      setEditingWorker(worker);
      setFormData({
        nombre: worker.nombre,
        puesto: worker.puesto,
        costePorHora: worker.costePorHora,
        pin: '',
        pinConfirm: '',
      });
    } else {
      setEditingWorker(null);
      setFormData({
        nombre: '',
        puesto: '',
        costePorHora: '',
        pin: '',
        pinConfirm: '',
      });
    }
    setShowForm(true);
    setError('');
  };

  const handleSaveWorker = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.puesto || !formData.costePorHora) {
      setError('Completa todos los campos obligatorios');
      return;
    }

    if (!editingWorker && (!formData.pin || !formData.pinConfirm)) {
      setError('El PIN es requerido para nuevos trabajadores');
      return;
    }

    if (formData.pin && formData.pin !== formData.pinConfirm) {
      setError('Los PINs no coinciden');
      return;
    }

    if (formData.pin && formData.pin.length !== 4) {
      setError('El PIN debe tener exactamente 4 dígitos');
      return;
    }

    try {
      setLoading(true);
      const workerData = {
        nombre: formData.nombre,
        puesto: formData.puesto,
        costePorHora: parseFloat(formData.costePorHora),
      };

      if (editingWorker) {
        await updateWorker(editingWorker.id, workerData);
      } else {
        await createWorker(workerData, formData.pin);
      }

      setShowForm(false);
      setEditingWorker(null);
      await fetchWorkers();
    } catch (err) {
      setError('Error al guardar el trabajador');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkerStatus = async (workerId, isActive) => {
    try {
      setLoading(true);
      await updateWorker(workerId, { activo: !isActive });
      await fetchWorkers();
    } catch (error) {
      setError('Error al actualizar trabajador');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                ← Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Trabajadores</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action button */}
        <div className="mb-6">
          <button
            onClick={() => handleOpenForm()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            + Nuevo trabajador
          </button>
        </div>

        {/* Workers table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando trabajadores...</div>
          ) : workers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay trabajadores disponibles. Crea el primer trabajador.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Puesto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    €/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {worker.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {worker.puesto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {worker.costePorHora.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          worker.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {worker.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleOpenForm(worker)}
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleWorkerStatus(worker.id, worker.activo)}
                        className={`font-semibold ${
                          worker.activo
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {worker.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="bg-orange-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingWorker ? 'Editar trabajador' : 'Nuevo trabajador'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-white hover:bg-orange-700 px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Puesto */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Puesto *
                </label>
                <select
                  value={formData.puesto}
                  onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Selecciona un puesto</option>
                  <option value="Oficial 1ª">Oficial 1ª</option>
                  <option value="Oficial 2ª">Oficial 2ª</option>
                  <option value="Peón">Peón</option>
                  <option value="Encargado">Encargado</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Coste por hora */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Coste por hora (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costePorHora}
                  onChange={(e) => setFormData({ ...formData, costePorHora: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* PIN (solo para nuevos trabajadores) */}
              {!editingWorker && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      PIN (4 dígitos) *
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength="4"
                      value={formData.pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setFormData({ ...formData, pin: value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-center text-2xl"
                      placeholder="••••"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Confirmar PIN *
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength="4"
                      value={formData.pinConfirm}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setFormData({ ...formData, pinConfirm: value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-center text-2xl"
                      placeholder="••••"
                      required
                    />
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
