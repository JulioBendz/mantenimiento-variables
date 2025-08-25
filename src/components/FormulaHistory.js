import React, { useEffect, useState, useRef } from 'react';
import { analyzePercentageResult, renderPercentageAnalysis } from '../utils/formulaHistoryUtils';
import FormulaItem from './FormulaItem';

function FormulaHistory({ 
  savedFormulas, 
  removeFormula, 
  reuseFormula, 
  editFormulaName, 
  currentPeriod,
  variables = {}
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFormulas, setSelectedFormulas] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [deleteControlsPosition, setDeleteControlsPosition] = useState({ id: null, show: false });
  const deleteControlsRef = useRef(null);
  const itemsPerPage = 6;
  const [excellentMin, setExcellentMin] = useState(90);
  const [acceptableMin, setAcceptableMin] = useState(70);
  const [editingFilters, setEditingFilters] = useState(false);

  const startEditing = (formula) => {
    setEditingId(formula.id);
    setEditingName(formula.name);
    setShowDropdown(null);
  };

  const saveEdit = (id) => {
    editFormulaName(id, editingName);
    setEditingId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleRemoveFormula = (formulaEntry) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la fórmula "${formulaEntry.name}"?\n\nFórmula: ${formulaEntry.originalFormula}\nResultado: ${formulaEntry.result}\n\nEsta acción no se puede deshacer.`
    );
    
    if (confirmDelete) {
      removeFormula(formulaEntry.id);
      // Si estamos en modo selección, también remover de la selección
      if (isSelectionMode) {
        setSelectedFormulas(prev => {
          const newSelection = new Set(prev);
          newSelection.delete(formulaEntry.id);
          return newSelection;
        });
      }
    }
    setShowDropdown(null);
  };

  // Función para iniciar eliminación directa - marca la fórmula y activa modo selección
  const startDirectDeletion = (formulaId) => {
    setIsSelectionMode(true);
    setSelectedFormulas(new Set([formulaId])); // Marcar automáticamente la fórmula
    setShowDropdown(null);
    setDeleteControlsPosition({ id: formulaId, show: true });
    
    // Auto-scroll hacia los controles de eliminación después de un breve delay
    setTimeout(() => {
      if (deleteControlsRef.current) {
        deleteControlsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'start'
        });
      }
    }, 100);
  };

  // Funciones para selección múltiple
  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedFormulas(new Set());
    setDeleteControlsPosition({ id: null, show: false });
  };

  const toggleFormulaSelection = (formulaId) => {
    const newSelection = new Set(selectedFormulas);
    if (newSelection.has(formulaId)) {
      newSelection.delete(formulaId);
    } else {
      newSelection.add(formulaId);
    }
    setSelectedFormulas(newSelection);
  };

  const selectAllFormulas = () => {
    const allFormulaIds = currentFormulas.map(formula => formula.id);
    setSelectedFormulas(new Set(allFormulaIds));
  };

  const deselectAllFormulas = () => {
    setSelectedFormulas(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedFormulas.size === 0) {
      alert('No hay fórmulas seleccionadas para eliminar.');
      return;
    }

    const formulasToDelete = currentFormulas.filter(formula => selectedFormulas.has(formula.id));
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar ${selectedFormulas.size} fórmula${selectedFormulas.size > 1 ? 's' : ''}?\n\n` +
      `Fórmulas a eliminar:\n${formulasToDelete.map(f => `• ${f.name}`).join('\n')}\n\n` +
      `Esta acción no se puede deshacer.`
    );

    if (confirmDelete) {
      Array.from(selectedFormulas).forEach(id => removeFormula(id));
      setSelectedFormulas(new Set());
      setIsSelectionMode(false);
      setDeleteControlsPosition({ id: null, show: false });
    }
  };

  // Función unificada para reutilizar fórmula (eliminamos la opción de crear copia)
  const reuseFormulaWithOptions = (formulaEntry) => {
    // Siempre reutilizar la fórmula original, sin crear copia
    reuseFormula(formulaEntry);
    setShowDropdown(null);
  };

  // Función para copiar fórmula al portapapeles
  const copyFormulaToClipboard = (formulaEntry) => {
    const formulaText = `${formulaEntry.name}\nFórmula: ${formulaEntry.originalFormula}\nResultado: ${formulaEntry.result}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(formulaText).then(() => {
        alert('Fórmula copiada al portapapeles');
      }).catch(() => {
        // Fallback para navegadores antiguos
        fallbackCopyTextToClipboard(formulaText);
      });
    } else {
      // Fallback para navegadores antiguos
      fallbackCopyTextToClipboard(formulaText);
    }
    setShowDropdown(null);
  };

  // Función fallback para copiar texto
  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      alert('Fórmula copiada al portapapeles');
    } catch (err) {
      alert('No se pudo copiar la fórmula');
    }
    
    document.body.removeChild(textArea);
  };

  // Función helper para obtener variables usadas en una fórmula
  const getUsedVariables = (formulaEntry) => {
    if (!variables || typeof variables !== 'object') {
      return 'Ninguna';
    }

    try {
      const usedVars = Object.getOwnPropertyNames(variables).filter(varName => {
        // Forzar acceso al valor para disparar el getter (y el error)
        // eslint-disable-next-line no-unused-vars
        const _ = variables[varName];
        const regex = new RegExp(`\\b${varName}\\b`);
        return regex.test(formulaEntry.originalFormula || '');
      });

      return usedVars.length > 0 ? usedVars.join(', ') : 'Ninguna';
    } catch (error) {
      console.error('Error al determinar variables usadas:', error);
      return 'Error al determinar';
    }
  };

  React.useEffect(() => {
    if (acceptableMin > excellentMin) setAcceptableMin(excellentMin);
    if (excellentMin > 100) setExcellentMin(100);
    if (acceptableMin < 0) setAcceptableMin(0);
    if (excellentMin < 0) setExcellentMin(0);
  }, [excellentMin, acceptableMin]);

  React.useEffect(() => {
    const savedExcellent = localStorage.getItem('excellentMin');
    const savedAcceptable = localStorage.getItem('acceptableMin');
    if (savedExcellent) setExcellentMin(Number(savedExcellent));
    if (savedAcceptable) setAcceptableMin(Number(savedAcceptable));
  }, []);

  React.useEffect(() => {
    localStorage.setItem('excellentMin', excellentMin);
    localStorage.setItem('acceptableMin', acceptableMin);
  }, [excellentMin, acceptableMin]);

  // Filtrar fórmulas según el término de búsqueda
  const filteredFormulas = (savedFormulas || []).filter(formula =>
    (formula.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (formula.originalFormula || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredFormulas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFormulas = filteredFormulas.slice(startIndex, endIndex);

  // Resetear página cuando cambie la búsqueda
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Resetear selección cuando cambie la página o búsqueda
  React.useEffect(() => {
    setSelectedFormulas(new Set());
    setDeleteControlsPosition({ id: null, show: false });
  }, [currentPage, searchTerm]);

  // Cerrar dropdown cuando se hace clic fuera
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Calcular altura dinámica basada en el contenido
  const calculateDynamicHeight = () => {
    const formulaCount = (savedFormulas || []).length;
    const filteredCount = filteredFormulas.length;
    const displayCount = Math.min(filteredCount, itemsPerPage);
    
    // Altura base mínima cuando no hay fórmulas
    const minHeight = 100; // 100px mínimo
    
    // Altura por fórmula (aproximadamente 140px por fórmula con análisis)
    const heightPerFormula = 140;
    
    // Altura máxima (equivalente a 4 fórmulas aproximadamente)
    const maxHeight = 550;
    
    if (formulaCount === 0) {
      return minHeight;
    }
    
    // Calcular altura basada en número de fórmulas a mostrar
    const calculatedHeight = minHeight + (displayCount * heightPerFormula);
    
    // No exceder la altura máxima
    return Math.min(calculatedHeight, maxHeight);
  };

  const dynamicHeight = calculateDynamicHeight();

  useEffect(() => {
  setDeleteControlsPosition({ id: null, show: false });
  setIsSelectionMode(false);
  setSelectedFormulas(new Set());
  }, [currentPage]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Historial de Fórmulas
        </h2>
      </div>
      
      {/* Buscador de fórmulas */}
      {(savedFormulas || []).length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar fórmula por nombre o contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              🔍
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              Mostrando {filteredFormulas.length} de {(savedFormulas || []).length} fórmulas
            </p>
          )}
        </div>
      )}
      
      {/* Filtros de porcentaje */}
      {(savedFormulas || []).length > 0 && (
        <div className="mb-4 flex gap-4 items-center">
          {editingFilters ? (
            <>
              <label className="text-sm text-gray-700">
                Excelente ≥
                <input
                  type="number"
                  value={excellentMin}
                  min={0}
                  max={100}
                  onChange={e => setExcellentMin(Number(e.target.value))}
                  className="mx-1 w-16 px-2 py-1 border rounded"
                />
                %
              </label>
              <label className="text-sm text-gray-700">
                Intermedio ≥
                <input
                  type="number"
                  value={acceptableMin}
                  min={0}
                  max={excellentMin}
                  onChange={e => setAcceptableMin(Number(e.target.value))}
                  className="mx-1 w-16 px-2 py-1 border rounded"
                />
                %
              </label>
              <span className="text-sm text-gray-700">Crítico {'<'} {acceptableMin}%</span>
              <div className="flex flex-col gap-2 ml-2">
                <button
                  type="button"
                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => setEditingFilters(false)}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  onClick={() => setEditingFilters(false)}
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-700">
                Excelente ≥ <b>{excellentMin}%</b>
              </span>
              <span className="text-sm text-gray-700">
                Intermedio ≥ <b>{acceptableMin}%</b>
              </span>
              <span className="text-sm text-gray-700">
                Crítico {'<'} <b>{acceptableMin}%</b>
              </span>
              <button
                type="button"
                className="ml-2 text-blue-600 hover:text-blue-800"
                onClick={() => setEditingFilters(true)}
                title="Editar rangos"
              >
                ✏️
              </button>
              <div className="relative group ml-2">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 focus:outline-none"
                  aria-label="Ayuda sobre los rangos"
                >
                  ℹ️
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-gray-300 rounded shadow-lg p-2 text-xs text-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10">
                  Puedes ajustar los rangos para categorizar los resultados:<br />
                  <b>Excelente</b>: resultado igual o mayor a {excellentMin}%<br />
                  <b>Intermedio</b>: resultado igual o mayor a {acceptableMin}% y menor que {excellentMin}%<br />
                  <b>Crítico</b>: resultado menor a {acceptableMin}%
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Lista de fórmulas con altura dinámica */}
      <div className="mb-4">
        <div 
          className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 transition-all duration-300"
          style={{ 
            height: `${dynamicHeight}px`,
            maxHeight: '550px'
          }}
        >
          {(!savedFormulas || savedFormulas.length === 0) ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                No hay fórmulas calculadas
              </p>
            </div>
          ) : filteredFormulas.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                No se encontraron fórmulas con el término "{searchTerm}"
              </p>
            </div>
          ) : (
            currentFormulas.map((formulaEntry) => (
              <FormulaItem
                key={formulaEntry.id}
                formulaEntry={formulaEntry}
                editingId={editingId}
                editingName={editingName}
                startEditing={startEditing}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                isSelectionMode={isSelectionMode}
                selectedFormulas={selectedFormulas}
                toggleFormulaSelection={toggleFormulaSelection}
                reuseFormulaWithOptions={reuseFormulaWithOptions}
                copyFormulaToClipboard={copyFormulaToClipboard}
                startDirectDeletion={startDirectDeletion}
                hoveredItem={hoveredItem}
                setHoveredItem={setHoveredItem}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
                deleteControlsPosition={deleteControlsPosition}
                deleteControlsRef={deleteControlsRef}
                getUsedVariables={getUsedVariables}
                excellentMin={excellentMin}
                acceptableMin={acceptableMin}
                currentFormulas={currentFormulas}
                selectAllFormulas={selectAllFormulas}
                deselectAllFormulas={deselectAllFormulas}
                handleBulkDelete={handleBulkDelete}
                cancelSelectionMode={cancelSelectionMode}
              />
            ))
          )}
        </div>
      </div>

      {/* Paginación */}
      {filteredFormulas.length > itemsPerPage && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            ← Anterior
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <span className="text-xs text-gray-500">
              ({startIndex + 1}-{Math.min(endIndex, filteredFormulas.length)} de {filteredFormulas.length})
            </span>
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Estadísticas mejoradas */}
      {(savedFormulas || []).length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-700">
            📊 Total de fórmulas guardadas: <span className="font-bold">{(savedFormulas || []).length}</span>
            {searchTerm && (
              <span className="ml-2">
                | Filtradas: <span className="font-bold">{filteredFormulas.length}</span>
              </span>
            )}
            {filteredFormulas.length > itemsPerPage && (
              <span className="ml-2">
                | Mostrando: <span className="font-bold">{currentFormulas.length}</span>
              </span>
            )}
            {isSelectionMode && selectedFormulas.size > 0 && (
              <span className="ml-2 text-purple-700">
                | Seleccionadas: <span className="font-bold">{selectedFormulas.size}</span>
              </span>
            )}
          </div>
          
          {/* Estadísticas de porcentajes */}
          {(() => {
            const percentageStats = (savedFormulas || []).reduce((stats, formula) => {
              const analysis = analyzePercentageResult(formula);
              if (analysis) {
                stats.total++;
                stats[analysis.category]++;
              }
              return stats;
            }, { total: 0, excellent: 0, acceptable: 0, critical: 0 });

            if (percentageStats.total > 0) {
              return (
                <div className="text-xs text-blue-600 mt-2 flex items-center gap-4">
                  <span>📈 Análisis de porcentajes:</span>
                  <span className="text-green-600">✅ Excelentes: {percentageStats.excellent}</span>
                  <span className="text-yellow-600">⚠️ Intermedio: {percentageStats.acceptable}</span>
                  <span className="text-red-600">❌ Críticos: {percentageStats.critical}</span>
                </div>
              );
            }
            return null;
          })()}
          
          <div className="text-xs text-blue-600 mt-1">
            ⚡ Las fórmulas se recalculan automáticamente al cambiar variables
          </div>
        </div>
      )}
    </div>
  );
}

export default FormulaHistory;