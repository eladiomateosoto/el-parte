import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveWorks, createWork, updateWork } from '../../services/firestore';
import { formatDate } from '../../utils/helpers';

export default function AdminWorks() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    fechaInicio: '',
    etapas: [{ nombre: '', fechaFin: '' }],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const worksData = await getActiveWorks();
      setWorks(worksData);
    } catch (err) {
      setError('Error cargando obras');
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

  const handleOpenForm = (work = null) => {
    if (work) {
      setEditingWork(work);
      setFormData({
        nombre: work.nombre,
        direccion: work.direccion,
        fechaInicio: work.fechaInicio,
        etapas: work.etapas || [],
      });
    } else {
      setEditingWork(null);
      setFormData({
        nombre: '',
        direccion: '',
        fechaInicio: '',
        etapas: [{ nombre: '', fechaFin: '' }],
      });
    }
    setShowForm(true);
    setError('');
  };

  const handleSaveWork = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.direccion || !formData.fechaInicio) {
      setError('Completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      const workData = {
        ...formData,
        coordenadas: { lat: 0, lng: 0 }, // TODO: Get from GPS
      };

      if (editingWork) {
        await updateWork(editingWork.id, workData);
      } else {
        await createWork(workData);
      }

      setShowForm(false);
      setEditingWork(null);
      await fetchWorks();
    } catch (err) {
      setError('Error al guardar la obra');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkStatus = async (workId, isActive) => {
    try {
      setLoading(true);
      await updateWork(workId, { activa: !isActive });
      await fetchWorks();
    } catch (error) {
      setError('Error al actualizar obra');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStage = () => {
    setFormData({
      ...formData,
      etapas: [...formData.etapas, { nombre: '', fechaFin: '' }],
    });
  };

  const handleRemoveStage = (index) => {
    setFormData({
      ...formData,
      etapas: formData.etapas.filter((_, i) => i !== index),
    });
  };

  const handleStageChange = (index, field, value) => {
    const newEtapas = [...formData.etapas];
    newEtapas[index][field] = value;
    setFormData({ ...formData, etapas: newEtapas });
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
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Obras</h1>
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
            + Nueva obra
          </button>
        </div>

        {/* Works table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando obras...</div>
          ) : works.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay obras disponibles. Crea la primera obra.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha inicio
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
                {works.map((work) => (
                  <tr key={work.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {work.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {work.direccion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(work.fechaInicio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          work.activa
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {work.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleOpenForm(work)}
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleWorkStatus(work.id, work.activa)}
                        className={`font-semibold ${
                          work.activa
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {work.activa ? 'Desactivar' : 'Activar'}
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
                {editingWork ? 'Editar obra' : 'Nueva obra'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-white hover:bg-orange-700 px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWork} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre de la obra *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Fecha inicio */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Fecha de inicio *
                </label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Etapas */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Etapas
                </label>
                <div className="space-y-3">
                  {formData.etapas.map((etapa, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nombre de la etapa"
                        value={etapa.nombre}
                        onChange={(e) => handleStageChange(index, 'nombre', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                      <input
                        type="date"
                        value={etapa.fechaFin}
                        onChange={(e) => handleStageChange(index, 'fechaFin', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(index)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddStage}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-900 font-semibold"
                >
                  + Agregar etapa
                </button>
              </div>

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
