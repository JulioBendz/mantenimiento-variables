import React, { useState } from 'react';

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
  const itemsPerPage = 6;

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
    }
    setShowDropdown(null);
  };

  // Función para iniciar modo eliminación desde el menú contextual
  const startDeletionMode = () => {
    setIsSelectionMode(true);
    setSelectedFormulas(new Set());
    setShowDropdown(null);
  };

  // Funciones para selección múltiple
  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedFormulas(new Set());
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
    }
  };

  // Función para duplicar fórmula
  const duplicateFormula = (formulaEntry) => {
    const newFormula = {
      ...formulaEntry,
      id: Date.now() + Math.random(),
      name: `${formulaEntry.name} (copia)`,
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      lastRecalculated: null
    };
    
    reuseFormula(newFormula);
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
      const usedVars = Object.keys(variables).filter(varName => {
        const regex = new RegExp(`\\b${varName}\\b`);
        return regex.test(formulaEntry.originalFormula || '');
      });
      
      return usedVars.length > 0 ? usedVars.join(', ') : 'Ninguna';
    } catch (error) {
      console.error('Error al determinar variables usadas:', error);
      return 'Error al determinar';
    }
  };

  // Función para detectar si es un porcentaje y categorizar el resultado
  const analyzePercentageResult = (formulaEntry) => {
    const { result, name, originalFormula } = formulaEntry;
    
    if (result === 'Error en la fórmula' || result === null || result === undefined) {
      return null;
    }

    const numResult = typeof result === 'number' ? result : parseFloat(result);
    if (isNaN(numResult)) return null;

    const isPercentage = 
      /\b(porcentaje|percent|%|eficiencia|efectividad|cumplimiento|rendimiento|desempeño|avance|progreso|satisfacción|calificación|nota|puntuación|score)\b/i.test(name) ||
      /\*\s*100|\*100|\/\s*100|\/100|\%/i.test(originalFormula) ||
      (numResult >= 0 && numResult <= 100) ||
      (numResult >= 0 && numResult <= 1 && originalFormula.includes('/'));

    if (!isPercentage) return null;

    let normalizedResult = numResult;
    if (numResult >= 0 && numResult <= 1) {
      normalizedResult = numResult * 100;
    }

    if (normalizedResult >= 90 && normalizedResult <= 100) {
      return {
        category: 'excellent',
        label: 'Excelente',
        icon: '✅',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: 'Resultado sobresaliente',
        percentage: normalizedResult
      };
    } else if (normalizedResult >= 70 && normalizedResult < 90) {
      return {
        category: 'acceptable',
        label: 'Satisfactorio',
        icon: '⚠️',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        description: 'Resultado aceptable, hay margen de mejora',
        percentage: normalizedResult
      };
    } else if (normalizedResult < 70) {
      return {
        category: 'critical',
        label: 'Crítico',
        icon: '❌',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        description: 'Resultado por debajo del estándar, requiere atención',
        percentage: normalizedResult
      };
    }

    return null;
  };

  const renderPercentageAnalysis = (formulaEntry) => {
    const analysis = analyzePercentageResult(formulaEntry);
    
    if (!analysis) return null;

    return (
      <div className={`mt-2 p-2 rounded-lg border ${analysis.bgColor} ${analysis.borderColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{analysis.icon}</span>
          <div className="flex-1">
            <div className={`text-sm font-semibold ${analysis.color}`}>
              {analysis.label} ({analysis.percentage.toFixed(1)}%)
            </div>
            <div className="text-xs text-gray-600">
              {analysis.description}
            </div>
          </div>
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                analysis.category === 'excellent' ? 'bg-green-500' :
                analysis.category === 'acceptable' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(analysis.percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

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
    
    const minHeight = 100;
    const heightPerFormula = 140;
    const maxHeight = 550;
    
    if (formulaCount === 0) {
      return minHeight;
    }
    
    const calculatedHeight = minHeight + (displayCount * heightPerFormula);
    return Math.min(calculatedHeight, maxHeight);
  };

  const dynamicHeight = calculateDynamicHeight();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Historial de Fórmulas
        </h2>
        
        {/* Controles de selección múltiple - Solo en modo selección */}
        {isSelectionMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={cancelSelectionMode}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition duration-200"
            >
              ❌ Cancelar
            </button>
            
            <button
              onClick={selectedFormulas.size === currentFormulas.length ? deselectAllFormulas : selectAllFormulas}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded transition duration-200"
            >
              {selectedFormulas.size === currentFormulas.length ? '❌ Deseleccionar' : '✅ Seleccionar todo'}
            </button>
            
            <button
              onClick={handleBulkDelete}
              disabled={selectedFormulas.size === 0}
              className="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition duration-200"
            >
              🗑️ Eliminar ({selectedFormulas.size})
            </button>
          </div>
        )}
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
              <div
                key={formulaEntry.id}
                className={`p-4 rounded-lg border-l-4 transition-all duration-200 relative ${
                  selectedFormulas.has(formulaEntry.id)
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-gray-50 border-blue-500 hover:bg-gray-100 hover:shadow-md'
                }`}
                onMouseEnter={() => setHoveredItem(formulaEntry.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox solo en modo selección */}
                  {isSelectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedFormulas.has(formulaEntry.id)}
                      onChange={() => toggleFormulaSelection(formulaEntry.id)}
                      className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  )}
                  
                  <div className="flex-1">
                    {/* Nombre de la fórmula - editable */}
                    <div className="mb-2">
                      {editingId === formulaEntry.id ? (
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && saveEdit(formulaEntry.id)}
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(formulaEntry.id)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-800">
                            {formulaEntry.name || 'Fórmula sin nombre'}
                          </h3>
                        </div>
                      )}
                    </div>

                    {/* Contenido de la fórmula */}
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Fórmula: {formulaEntry.originalFormula || 'No definida'}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        Evaluada: {formulaEntry.evaluatedFormula || 'Pendiente de cálculo'}
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        Resultado: {formulaEntry.result !== null && formulaEntry.result !== undefined ? formulaEntry.result : 'Pendiente'}
                      </div>
                      
                      {/* Análisis de porcentaje */}
                      {renderPercentageAnalysis(formulaEntry)}
                      
                      {formulaEntry.lastRecalculated && (
                        <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Última actualización: {formulaEntry.lastRecalculated}
                        </div>
                      )}
                      
                      {/* Indicador de variables usadas */}
                      <div className="text-xs text-gray-400 mt-1">
                        Variables utilizadas: {getUsedVariables(formulaEntry)}
                      </div>
                    </div>

                    {/* Fecha */}
                    <div className="text-xs text-gray-400">
                      {formulaEntry.date || 'Sin fecha'} - {formulaEntry.timestamp || 'Sin hora'}
                    </div>
                  </div>
                </div>

                {/* Menú contextual - Solo aparece en hover y fuera del modo selección */}
                {!isSelectionMode && hoveredItem === formulaEntry.id && editingId !== formulaEntry.id && (
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(showDropdown === formulaEntry.id ? null : formulaEntry.id);
                      }}
                      className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                      title="Más opciones"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {showDropdown === formulaEntry.id && (
                      <div className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => reuseFormula(formulaEntry)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                          >
                            <span>📋</span>
                            Reutilizar fórmula
                          </button>
                          
                          <button
                            onClick={() => startEditing(formulaEntry)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center gap-2"
                          >
                            <span>✏️</span>
                            Editar nombre
                          </button>
                          
                          <button
                            onClick={() => duplicateFormula(formulaEntry)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2"
                          >
                            <span>🔄</span>
                            Duplicar fórmula
                          </button>
                          
                          <button
                            onClick={() => copyFormulaToClipboard(formulaEntry)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                          >
                            <span>📄</span>
                            Copiar al portapapeles
                          </button>
                          
                          <div className="border-t border-gray-100 my-1"></div>
                          
                          <button
                            onClick={() => handleRemoveFormula(formulaEntry)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <span>🗑️</span>
                            Eliminar fórmula
                          </button>
                          
                          <button
                            onClick={startDeletionMode}
                            className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                          >
                            <span>☑️</span>
                            Eliminar múltiples
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                  <span className="text-yellow-600">⚠️ Satisfactorios: {percentageStats.acceptable}</span>
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