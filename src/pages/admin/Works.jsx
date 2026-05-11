import { useState, useEffect } from 'react';
import { getActiveWorks, createWork, updateWork } from '../../services/firestore';
import { formatDate } from '../../utils/helpers';
import { getCurrentLocation } from '../../services/geolocation';
import AdminLayout from '../../components/AdminLayout';

export default function AdminWorks() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    fechaInicio: '',
    coordenadas: { lat: null, lng: null },
    etapas: [{ nombre: '', fechaFin: '' }],
  });
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

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

  const handleOpenForm = (work = null) => {
    if (work) {
      setEditingWork(work);
      setFormData({
        nombre: work.nombre,
        direccion: work.direccion,
        fechaInicio: work.fechaInicio,
        coordenadas: work.coordenadas || { lat: null, lng: null },
        etapas: work.etapas || [{ nombre: '', fechaFin: '' }],
      });
    } else {
      setEditingWork(null);
      setFormData({
        nombre: '',
        direccion: '',
        fechaInicio: '',
        coordenadas: { lat: null, lng: null },
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
        coordenadas: {
          lat: formData.coordenadas?.lat ?? 0,
          lng: formData.coordenadas?.lng ?? 0,
        },
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

  const handleUseLocation = async () => {
    try {
      setError('');
      setLocationLoading(true);
      const location = await getCurrentLocation();
      setFormData({
        ...formData,
        coordenadas: {
          lat: location.lat,
          lng: location.lng,
        },
      });
    } catch (err) {
      setError(err.message || 'No se pudo obtener la ubicación');
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <AdminLayout title="Gestión de Obras" description="Crea obras con coordenadas GPS para fichajes y control" active="works">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => handleOpenForm()}
          className="bg-[#F97316] hover:bg-orange-700 text-white px-6 py-3 rounded-3xl font-semibold transition"
        >
          + Nueva obra
        </button>
        <p className="text-sm text-slate-500">Las coordenadas se usan para validar fichajes en un radio de 50 metros.</p>
      </div>

      <div className="bg-slate-900 rounded-3xl shadow-lg border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando obras...</div>
        ) : works.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No hay obras disponibles. Crea la primera obra.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Fecha inicio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Coordenadas</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {works.map((work) => (
                <tr key={work.id} className="hover:bg-slate-800">
                  <td className="px-6 py-4 text-sm font-medium text-white">{work.nombre}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{work.direccion}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{formatDate(work.fechaInicio)}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {work.coordenadas?.lat && work.coordenadas?.lng
                      ? `${work.coordenadas.lat.toFixed(5)}, ${work.coordenadas.lng.toFixed(5)}`
                      : 'Sin coordenadas'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${work.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {work.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-3">
                    <button onClick={() => handleOpenForm(work)} className="text-sky-400 hover:text-sky-200 font-semibold">Editar</button>
                    <button onClick={() => handleToggleWorkStatus(work.id, work.activa)} className={`font-semibold ${work.activa ? 'text-red-400 hover:text-red-200' : 'text-green-400 hover:text-green-200'}`}>
                      {work.activa ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-[#1F2937] px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{editingWork ? 'Editar obra' : 'Nueva obra'}</h2>
                <p className="text-sm text-slate-300">Captura todos los datos y la ubicación de la obra.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-200 hover:text-white rounded-full p-2">✕</button>
            </div>
            <form onSubmit={handleSaveWork} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-6rem)]">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Nombre de la obra *
                  <input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Dirección *
                  <input
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Fecha inicio *
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                </label>
                <div className="space-y-2 text-sm font-semibold text-slate-700">
                  <span>Coordenadas</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={formData.coordenadas?.lat ?? ''}
                      readOnly
                      placeholder="Latitud"
                      className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-slate-50"
                    />
                    <input
                      type="text"
                      value={formData.coordenadas?.lng ?? ''}
                      readOnly
                      placeholder="Longitud"
                      className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Etapas</h3>
                  <button
                    type="button"
                    onClick={handleAddStage}
                    className="text-sm text-blue-600 hover:text-blue-900 font-semibold"
                  >
                    + Agregar etapa
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.etapas.map((etapa, index) => (
                    <div key={index} className="grid gap-3 lg:grid-cols-[1fr_auto] items-end">
                      <div className="grid gap-3">
                        <input
                          type="text"
                          placeholder="Nombre de la etapa"
                          value={etapa.nombre}
                          onChange={(e) => handleStageChange(index, 'nombre', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                        />
                        <input
                          type="date"
                          value={etapa.fechaFin}
                          onChange={(e) => handleStageChange(index, 'fechaFin', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(index)}
                        className="self-start bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-2xl text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={locationLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-3xl transition disabled:opacity-60"
                >
                  {locationLoading ? 'Obteniendo ubicación...' : '📍 Usar mi ubicación actual'}
                </button>
                <span className="text-sm text-slate-500">Pulsa para llenar las coordenadas de la obra</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900 mb-2">Confirmación</p>
                <p>Cuando captures tu ubicación, estas coordenadas se guardarán con la obra para validar fichajes en un radio de 50m.</p>
              </div>

              <div className="space-y-3 sm:flex sm:space-y-0 sm:gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1F2937] hover:bg-slate-900 text-white font-semibold px-6 py-3 rounded-3xl transition"
                >
                  {loading ? 'Guardando obra...' : 'Guardar obra'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold px-6 py-3 rounded-3xl transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
