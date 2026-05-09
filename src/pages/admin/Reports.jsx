import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveWorks, getPartsByWork } from '../../services/firestore';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { formatDate, formatTime } from '../../utils/helpers';

export default function AdminReports() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [works, setWorks] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorks();
  }, []);

  useEffect(() => {
    if (selectedWork) {
      fetchParts(selectedWork.id);
    }
  }, [selectedWork]);

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

  const fetchParts = async (workId) => {
    try {
      setLoading(true);
      const partsData = await getPartsByWork(workId);
      setParts(partsData.sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateB - dateA;
      }));
    } catch (err) {
      setError('Error cargando partes');
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

  const calculateStats = () => {
    if (!parts.length) {
      return {
        totalHours: 0,
        totalCost: 0,
        byCategory: {},
        byWorker: {},
      };
    }

    const stats = {
      totalHours: 0,
      totalCost: 0,
      byCategory: {},
      byWorker: {},
    };

    parts.forEach((part) => {
      stats.totalHours += part.totalHoras || 0;
      
      // Group by worker
      if (!stats.byWorker[part.trabajadorNombre]) {
        stats.byWorker[part.trabajadorNombre] = {
          hours: 0,
          cost: 0,
        };
      }
      stats.byWorker[part.trabajadorNombre].hours += part.totalHoras || 0;
      stats.byWorker[part.trabajadorNombre].cost += (part.totalHoras || 0) * (part.costePorHora || 0);

      // Group by category
      (part.tareas || []).forEach((task) => {
        if (!stats.byCategory[task.categoriaNombre]) {
          stats.byCategory[task.categoriaNombre] = 0;
        }
        stats.byCategory[task.categoriaNombre] += task.horas || 0;
      });
    });

    stats.totalCost = Object.values(stats.byWorker).reduce((sum, w) => sum + w.cost, 0);

    return stats;
  };

  const exportToPDF = () => {
    if (!selectedWork || !parts.length) {
      setError('Selecciona una obra y asegúrate de que tiene partes');
      return;
    }

    const stats = calculateStats();
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text('ElParte - Informe de Obra', 20, 20);
    doc.setFontSize(10);
    doc.text(`Obra: ${selectedWork.nombre}`, 20, 30);
    doc.text(`Dirección: ${selectedWork.direccion}`, 20, 37);
    doc.text(`Fecha del informe: ${new Date().toLocaleDateString()}`, 20, 44);

    let yPosition = 55;

    // Summary section
    doc.setFontSize(12);
    doc.text('Resumen', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Total de horas: ${stats.totalHours.toFixed(2)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Coste total: €${stats.totalCost.toFixed(2)}`, 20, yPosition);
    yPosition += 15;

    // By category
    doc.setFontSize(12);
    doc.text('Horas por Categoría', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    Object.entries(stats.byCategory).forEach(([category, hours]) => {
      doc.text(`${category}: ${hours.toFixed(2)} horas`, 25, yPosition);
      yPosition += 7;
    });

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition += 10;
    }

    // By worker
    doc.setFontSize(12);
    doc.text('Horas y Coste por Trabajador', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    Object.entries(stats.byWorker).forEach(([worker, data]) => {
      doc.text(`${worker}: ${data.hours.toFixed(2)}h - €${data.cost.toFixed(2)}`, 25, yPosition);
      yPosition += 7;
    });

    doc.save(`informe-${selectedWork.nombre.replace(/\s/g, '_')}.pdf`);
  };

  const exportToExcel = () => {
    if (!selectedWork || !parts.length) {
      setError('Selecciona una obra y asegúrate de que tiene partes');
      return;
    }

    const stats = calculateStats();

    // Prepare data for Excel
    const data = [];
    
    // Add header
    data.push(['ElParte - Informe de Obra']);
    data.push([]);
    data.push(['Obra:', selectedWork.nombre]);
    data.push(['Dirección:', selectedWork.direccion]);
    data.push(['Fecha del informe:', new Date().toLocaleDateString()]);
    data.push([]);
    
    // Add summary
    data.push(['Resumen']);
    data.push(['Total de horas:', stats.totalHours.toFixed(2)]);
    data.push(['Coste total:', `€${stats.totalCost.toFixed(2)}`]);
    data.push([]);

    // Add by category
    data.push(['Horas por Categoría']);
    Object.entries(stats.byCategory).forEach(([category, hours]) => {
      data.push([category, hours.toFixed(2)]);
    });
    data.push([]);

    // Add by worker
    data.push(['Horas y Coste por Trabajador']);
    data.push(['Trabajador', 'Horas', 'Coste']);
    Object.entries(stats.byWorker).forEach(([worker, workerData]) => {
      data.push([worker, workerData.hours.toFixed(2), `€${workerData.cost.toFixed(2)}`]);
    });
    data.push([]);

    // Add detailed parts
    data.push(['Partes Detallados']);
    data.push(['Fecha', 'Trabajador', 'Obra', 'Entrada', 'Salida', 'Total Horas', 'Observaciones']);
    parts.forEach((part) => {
      data.push([
        formatDate(part.fecha),
        part.trabajadorNombre,
        part.obraNombre,
        formatTime(part.horaEntrada),
        formatTime(part.horaSalida),
        part.totalHoras?.toFixed(2) || 0,
        part.observaciones || '',
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Informe');
    XLSX.writeFile(workbook, `informe-${selectedWork.nombre.replace(/\s/g, '_')}.xlsx`);
  };

  if (!selectedWork) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                <h1 className="text-2xl font-bold text-gray-900">Informes</h1>
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Selecciona una obra para ver los informes
            </label>
            <select
              onChange={(e) => {
                const work = works.find((w) => w.id === e.target.value);
                setSelectedWork(work);
              }}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Elige una obra...</option>
              {works.map((work) => (
                <option key={work.id} value={work.id}>
                  {work.nombre}
                </option>
              ))}
            </select>
          </div>
        </main>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-2xl font-bold text-gray-900">Informes</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Work selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Obra
          </label>
          <select
            value={selectedWork?.id || ''}
            onChange={(e) => {
              const work = works.find((w) => w.id === e.target.value);
              setSelectedWork(work);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {works.map((work) => (
              <option key={work.id} value={work.id}>
                {work.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Export buttons */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={exportToPDF}
            disabled={!parts.length || loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
          >
            📄 Descargar PDF
          </button>
          <button
            onClick={exportToExcel}
            disabled={!parts.length || loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
          >
            📊 Descargar Excel
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500">Cargando...</div>
        ) : !parts.length ? (
          <div className="text-center text-gray-500">No hay partes para esta obra</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 uppercase">Total Horas</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.totalHours.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 uppercase">Coste Total</p>
                <p className="text-3xl font-bold text-orange-600">
                  €{stats.totalCost.toFixed(2)}
                </p>
              </div>
            </div>

            {/* By Category */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Horas por Categoría</h2>
              <div className="space-y-2">
                {Object.entries(stats.byCategory).map(([category, hours]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-gray-700">{category}</span>
                    <span className="font-semibold text-gray-900">
                      {hours.toFixed(2)} horas
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Worker */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Horas y Coste por Trabajador
              </h2>
              <div className="space-y-2">
                {Object.entries(stats.byWorker).map(([worker, workerData]) => (
                  <div key={worker} className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-700 font-medium">{worker}</span>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {workerData.hours.toFixed(2)} h
                      </p>
                      <p className="font-semibold text-orange-600">
                        €{workerData.cost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
