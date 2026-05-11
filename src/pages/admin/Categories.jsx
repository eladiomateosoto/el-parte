import { useState, useEffect } from 'react';
import { 
  getActiveCategories, 
  createCategory, 
  initializeDefaultCategories 
} from '../../services/firestore';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import AdminLayout from '../../components/AdminLayout';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // First, initialize default categories if they don't exist
      await initializeDefaultCategories();
      
      // Then fetch all categories
      const q = collection(db, 'categorias');
      const querySnapshot = await getDocs(q);
      const categoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesData.sort((a, b) => a.nombre.localeCompare(b.nombre)));
    } catch (err) {
      setError('Error cargando categorías');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setError('El nombre de la categoría no puede estar vacío');
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.nombre.toLowerCase() === newCategoryName.toLowerCase())) {
      setError('Esta categoría ya existe');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createCategory({ nombre: newCategoryName.trim() });
      setNewCategoryName('');
      setShowForm(false);
      await fetchCategories();
    } catch (err) {
      setError('Error al crear la categoría');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Categorías" description="Crea y revisa categorías precargadas de trabajos" active="categories">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#F97316] hover:bg-orange-700 text-white px-6 py-3 rounded-3xl font-semibold transition"
        >
          + Nueva categoría
        </button>
        <p className="text-sm text-slate-500">Estructuras, Paredes, Solería, Carpintería, Instalaciones, Pintura y Otros.</p>
      </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-8 text-center text-gray-500">
              Cargando categorías...
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500">
              No hay categorías disponibles.
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow p-6 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {category.activa ? 'Activa' : 'Inactiva'}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    category.activa
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {category.activa ? '✓' : '✕'}
                </span>
              </div>
            ))
          )}
        </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-orange-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Nueva categoría</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-white hover:bg-orange-700 px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre de la categoría *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: Demolición"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  autoFocus
                />
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
                  {loading ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
