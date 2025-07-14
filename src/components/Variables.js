import React, { useState } from 'react';

function Variables({ 
  variables, 
  variableName, 
  setVariableName, 
  variableValue, 
  setVariableValue, 
  addVariable, 
  removeVariable,
  editVariable
}) {
  const [editingName, setEditingName] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVariables, setSelectedVariables] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [deleteControlsPosition, setDeleteControlsPosition] = useState({ name: null, show: false });
  const itemsPerPage = 8;

  const startEditing = (name, value) => {
    setEditingName(name);
    setEditingValue(value.toString());
    setShowDropdown(null);
  };

  const saveEdit = (originalName) => {
    const newValue = parseFloat(editingValue);
    if (!isNaN(newValue)) {
      editVariable(originalName, newValue);
    }
    setEditingName(null);
    setEditingValue('');
  };

  const cancelEdit = () => {
    setEditingName(null);
    setEditingValue('');
  };

  // Función para copiar variable al portapapeles
  const copyVariableToClipboard = (name) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(name).then(() => {
        // Mostrar confirmación visual temporal
        const element = document.getElementById(`copy-${name}`);
        if (element) {
          element.textContent = '✓';
          element.classList.add('text-green-600');
          setTimeout(() => {
            element.textContent = '📄';
            element.classList.remove('text-green-600');
          }, 1000);
        }
      }).catch(() => {
        fallbackCopyTextToClipboard(name);
      });
    } else {
      fallbackCopyTextToClipboard(name);
    }
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
      const element = document.getElementById(`copy-${text}`);
      if (element) {
        element.textContent = '✓';
        element.classList.add('text-green-600');
        setTimeout(() => {
          element.textContent = '📄';
          element.classList.remove('text-green-600');
        }, 1000);
      }
    } catch (err) {
      console.error('No se pudo copiar la variable');
    }
    
    document.body.removeChild(textArea);
  };

  const handleRemoveVariable = (name) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la variable "${name}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (confirmDelete) {
      removeVariable(name);
      // Si estamos en modo selección, también remover de la selección
      if (isSelectionMode) {
        setSelectedVariables(prev => {
          const newSelection = new Set(prev);
          newSelection.delete(name);
          return newSelection;
        });
      }
    }
    setShowDropdown(null);
  };

  // Función para iniciar eliminación directa - marca la variable y activa modo selección
  const startDirectDeletion = (name) => {
    setIsSelectionMode(true);
    setSelectedVariables(new Set([name])); // Marcar automáticamente la variable
    setShowDropdown(null);
    setDeleteControlsPosition({ name, show: true });
  };

  // Funciones para selección múltiple
  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedVariables(new Set());
    setDeleteControlsPosition({ name: null, show: false });
  };

  const toggleVariableSelection = (name) => {
    const newSelection = new Set(selectedVariables);
    if (newSelection.has(name)) {
      newSelection.delete(name);
    } else {
      newSelection.add(name);
    }
    setSelectedVariables(newSelection);
  };

  const selectAllVariables = () => {
    const allVariableNames = currentVariables.map(([name]) => name);
    setSelectedVariables(new Set(allVariableNames));
  };

  const deselectAllVariables = () => {
    setSelectedVariables(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedVariables.size === 0) {
      alert('No hay variables seleccionadas para eliminar.');
      return;
    }

    const variableNames = Array.from(selectedVariables);
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar ${selectedVariables.size} variable${selectedVariables.size > 1 ? 's' : ''}?\n\n` +
      `Variables a eliminar:\n${variableNames.join(', ')}\n\n` +
      `Esta acción no se puede deshacer.`
    );

    if (confirmDelete) {
      variableNames.forEach(name => removeVariable(name));
      setSelectedVariables(new Set());
      setIsSelectionMode(false);
      setDeleteControlsPosition({ name: null, show: false });
    }
  };

  // Función para duplicar variable
  const duplicateVariable = (name, value) => {
    let newName = `${name}_copia`;
    let counter = 1;
    
    while (variables[newName]) {
      newName = `${name}_copia${counter}`;
      counter++;
    }
    
    editVariable(newName, value);
    setShowDropdown(null);
  };

  // Filtrar variables según el término de búsqueda
  const filteredVariables = Object.entries(variables).filter(([name, value]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredVariables.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVariables = filteredVariables.slice(startIndex, endIndex);

  // Resetear página cuando cambie la búsqueda
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Resetear selección cuando cambie la página o búsqueda
  React.useEffect(() => {
    setSelectedVariables(new Set());
    setDeleteControlsPosition({ name: null, show: false });
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
    const variableCount = Object.keys(variables).length;
    const filteredCount = filteredVariables.length;
    const displayCount = Math.min(filteredCount, itemsPerPage);
    
    const minHeight = 80;
    const heightPerVariable = 60;
    const maxHeight = 400;
    
    if (variableCount === 0) {
      return minHeight;
    }
    
    const calculatedHeight = minHeight + (displayCount * heightPerVariable);
    return Math.min(calculatedHeight, maxHeight);
  };

  const dynamicHeight = calculateDynamicHeight();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Variables
        </h2>
      </div>
      
      {/* Formulario para agregar variables */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            type="text"
            placeholder="Nombre de variable (ej: x, a, velocidad)"
            value={variableName}
            onChange={(e) => setVariableName(e.target.value)}
            className="flex-1 sm:min-w-[140px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Valor numérico"
            value={variableValue}
            onChange={(e) => setVariableValue(e.target.value)}
            className="flex-1 sm:min-w-[80px] lg:max-w-[155px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={addVariable}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Agregar Variable
        </button>
      </div>

      {/* Buscador de variables */}
      {Object.keys(variables).length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar variable por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50"
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
              Mostrando {filteredVariables.length} de {Object.keys(variables).length} variables
            </p>
          )}
        </div>
      )}

      {/* Lista de variables con altura dinámica */}
      <div className="mb-4">
        <div 
          className="space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 transition-all duration-300"
          style={{ 
            height: `${dynamicHeight}px`,
            maxHeight: '400px'
          }}
        >
          {Object.keys(variables).length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                No hay variables definidas
              </p>
            </div>
          ) : filteredVariables.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                No se encontraron variables con el término "{searchTerm}"
              </p>
            </div>
          ) : (
            currentVariables.map(([name, value]) => (
              <div key={name} className="relative">
                <div
                  className={`bg-gray-50 p-3 rounded-lg border-l-4 transition-all duration-200 ${
                    selectedVariables.has(name) 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-green-500 hover:bg-gray-100 hover:shadow-md'
                  }`}
                  onMouseEnter={() => setHoveredItem(name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex items-center gap-2">
                    {/* Checkbox solo en modo selección */}
                    {isSelectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedVariables.has(name)}
                        onChange={() => toggleVariableSelection(name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                    
                    {/* Icono de copia - siempre visible */}
                    <button
                      onClick={() => copyVariableToClipboard(name)}
                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition duration-200"
                      title={`Copiar variable "${name}" al portapapeles`}
                    >
                      <span id={`copy-${name}`} className="text-sm">📄</span>
                    </button>
                    
                    <div className="flex-1">
                      {editingName === name ? (
                        // Modo edición
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700 text-sm">
                            {name} =
                          </span>
                          <input
                            type="number"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && saveEdit(name)}
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(name)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            title="Guardar cambios"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                            title="Cancelar edición"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        // Modo visualización
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">
                            {name} = {value}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Menú contextual - Solo aparece en hover y fuera del modo selección */}
                  {!isSelectionMode && hoveredItem === name && editingName !== name && (
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(showDropdown === name ? null : name);
                        }}
                        className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                        title="Más opciones"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown menu */}
                      {showDropdown === name && (
                        <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => startEditing(name, value)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                            >
                              <span>✏️</span>
                              Editar valor
                            </button>
                            
                            <button
                              onClick={() => duplicateVariable(name, value)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center gap-2"
                            >
                              <span>📋</span>
                              Duplicar
                            </button>
                            
                            <div className="border-t border-gray-100 my-1"></div>
                            
                            <button
                              onClick={() => startDirectDeletion(name)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              title="Activar modo eliminación"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Panel de controles de eliminación - Aparece debajo de la variable seleccionada */}
                {isSelectionMode && deleteControlsPosition.name === name && deleteControlsPosition.show && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm animate-fadeIn">
                    <div className="flex flex-col gap-3">
                      {/* Información de selección */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-sm font-medium text-red-700">
                            Modo eliminación activo
                          </span>
                        </div>
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                          {selectedVariables.size} seleccionada{selectedVariables.size > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Controles de acción */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={selectedVariables.size === currentVariables.length ? deselectAllVariables : selectAllVariables}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition duration-200 flex items-center gap-1"
                          title={selectedVariables.size === currentVariables.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {selectedVariables.size === currentVariables.length ? 'Deseleccionar' : 'Seleccionar todo'}
                        </button>
                        
                        <button
                          onClick={handleBulkDelete}
                          disabled={selectedVariables.size === 0}
                          className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition duration-200 flex items-center gap-1"
                          title={`Eliminar ${selectedVariables.size} variable${selectedVariables.size > 1 ? 's' : ''} seleccionada${selectedVariables.size > 1 ? 's' : ''}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar ({selectedVariables.size})
                        </button>
                        
                        <button
                          onClick={cancelSelectionMode}
                          className="px-3 py-1 text-xs bg-gray-500 text-white hover:bg-gray-600 rounded transition duration-200 flex items-center gap-1"
                          title="Cancelar selección"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Paginación */}
      {filteredVariables.length > itemsPerPage && (
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
              ({startIndex + 1}-{Math.min(endIndex, filteredVariables.length)} de {filteredVariables.length})
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

      {/* Estadísticas */}
      {Object.keys(variables).length > 0 && (
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-green-700">
            📊 Total de variables: <span className="font-bold">{Object.keys(variables).length}</span>
            {searchTerm && (
              <span className="ml-2">
                | Filtradas: <span className="font-bold">{filteredVariables.length}</span>
              </span>
            )}
            {filteredVariables.length > itemsPerPage && (
              <span className="ml-2">
                | Mostrando: <span className="font-bold">{currentVariables.length}</span>
              </span>
            )}
            {isSelectionMode && selectedVariables.size > 0 && (
              <span className="ml-2 text-blue-700">
                | Seleccionadas: <span className="font-bold">{selectedVariables.size}</span>
              </span>
            )}
          </div>
          
          <div className="text-xs text-green-600 mt-1">
            💡 Tip: Haz clic en 📄 para copiar el nombre de la variable y usarla en fórmulas
          </div>
        </div>
      )}
    </div>
  );
}

export default Variables;