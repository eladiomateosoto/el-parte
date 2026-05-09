import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorker } from '../../contexts/WorkerContext';
import { getActiveWorks, getActiveCategories, createPart } from '../../services/firestore';
import { calculateTotalHours, formatDate } from '../../utils/helpers';

export default function WorkerDailyPart() {
  const navigate = useNavigate();
  const { worker, logout } = useWorker();
  const [works, setWorks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    obraId: '',
    fecha: new Date().toISOString().split('T')[0],
    tareas: [{ categoriaId: '', categoriaNombre: '', horas: '' }],
    observaciones: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const worksData = await getActiveWorks();
      const categoriesData = await getActiveCategories();
      setWorks(worksData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Error cargando datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/worker/login');
  };

  const handleAddTask = () => {
    setFormData({
      ...formData,
      tareas: [...formData.tareas, { categoriaId: '', categoriaNombre: '', horas: '' }],
    });
  };

  const handleRemoveTask = (index) => {
    setFormData({
      ...formData,
      tareas: formData.tareas.filter((_, i) => i !== index),
    });
  };

  const handleTaskChange = (index, field, value) => {
    const newTareas = [...formData.tareas];
    newTareas[index][field] = value;

    // If changing category, update category name
    if (field === 'categoriaId') {
      const category = categories.find((c) => c.id === value);
      if (category) {
        newTareas[index].categoriaNombre = category.nombre;
      }
    }

    setFormData({ ...formData, tareas: newTareas });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.obraId) {
      setError('Selecciona una obra');
      return;
    }

    // Check if at least one task has hours
    if (!formData.tareas.some((t) => t.horas && parseFloat(t.horas) > 0)) {
      setError('Agrega al menos una tarea con horas');
      return;
    }

    // If "Otros" is selected, observations are required
    const hasOtros = formData.tareas.some((t) => t.categoriaNombre === 'Otros');
    if (hasOtros && !formData.observaciones.trim()) {
      setError('Las observaciones son obligatorias si se selecciona "Otros"');
      return;
    }

    try {
      setLoading(true);
      const work = works.find((w) => w.id === formData.obraId);
      const totalHours = calculateTotalHours(
        formData.tareas.map((t) => ({ hours: parseFloat(t.horas) || 0 }))
      );

      // Create part
      const partData = {
        trabajadorId: worker.id,
        trabajadorNombre: worker.nombre,
        obraId: formData.obraId,
        obraNombre: work.nombre,
        fecha: formData.fecha,
        horaEntrada: new Date(), // TODO: Get from checkin
        horaSalida: new Date(), // TODO: Get from checkin
        tareas: formData.tareas.filter((t) => t.horas && parseFloat(t.horas) > 0),
        totalHoras: totalHours,
        observaciones: formData.observaciones,
        coordenadasEntrada: { lat: 0, lng: 0 }, // TODO: Get from checkin
        coordenadasSalida: { lat: 0, lng: 0 }, // TODO: Get from checkin
      };

      await createPart(partData);

      setSuccess('✓ Parte registrado correctamente');
      
      // Reset form
      setTimeout(() => {
        setFormData({
          obraId: '',
          fecha: new Date().toISOString().split('T')[0],
          tareas: [{ categoriaId: '', categoriaNombre: '', horas: '' }],
          observaciones: '',
        });
      }, 2000);
    } catch (err) {
      setError('Error al registrar el parte');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalHours = calculateTotalHours(
    formData.tareas.map((t) => ({ hours: parseFloat(t.horas) || 0 }))
  );

  const showOtrosWarning = formData.tareas.some((t) => t.categoriaNombre === 'Otros');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-20">
      <header className="bg-white border-b-4 border-orange-600 shadow-sm sticky top-0 z-10">
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

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Parte Diario</h2>
          <p className="text-gray-600 text-sm mt-1">
            {formatDate(new Date(formData.fecha))}
          </p>
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

        {loading && (
          <div className="text-center text-gray-500 mb-6">Cargando...</div>
        )}

        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Obra selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Obra *
              </label>
              <select
                value={formData.obraId}
                onChange={(e) => setFormData({ ...formData, obraId: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-base"
                required
              >
                <option value="">Selecciona una obra...</option>
                {works.map((work) => (
                  <option key={work.id} value={work.id}>
                    {work.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Tasks */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Tareas del día *
              </label>

              <div className="space-y-3">
                {formData.tareas.map((task, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 border-2 border-gray-200"
                  >
                    <div className="space-y-3">
                      {/* Category */}
                      <select
                        value={task.categoriaId}
                        onChange={(e) =>
                          handleTaskChange(index, 'categoriaId', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      >
                        <option value="">Categoría...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>

                      {/* Hours */}
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="Horas (ej: 2.5)"
                        value={task.horas}
                        onChange={(e) =>
                          handleTaskChange(index, 'horas', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />

                      {/* Remove button */}
                      {formData.tareas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(index)}
                          className="w-full bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold"
                        >
                          Eliminar tarea
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddTask}
                className="mt-4 w-full bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
              >
                + Agregar otra tarea
              </button>
            </div>

            {/* Total hours display */}
            <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Total de horas</p>
              <p className="text-4xl font-bold text-orange-600">{totalHours.toFixed(1)}</p>
            </div>

            {/* Observations */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Observaciones {showOtrosWarning && '*'}
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                placeholder="Notas, incidencias, etc..."
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-orange-500 text-base resize-none ${
                  showOtrosWarning && !formData.observaciones
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300'
                }`}
                rows="4"
              />
              {showOtrosWarning && !formData.observaciones && (
                <p className="text-red-600 text-sm mt-1">
                  Las observaciones son obligatorias cuando seleccionas "Otros"
                </p>
              )}
            </div>


            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !formData.obraId}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold py-4 rounded-lg text-lg transition"
            >
              {loading ? 'Guardando...' : '✓ Enviar Parte'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
