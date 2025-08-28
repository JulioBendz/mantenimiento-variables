import React, { useState, useEffect } from 'react';
import VariableItem from './VariableItem';

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

  // Cuando cambie la página, resetea el modo eliminación y selección
  useEffect(() => {
    setDeleteControlsPosition({ name: null, show: false });
    setIsSelectionMode(false);
    setSelectedVariables(new Set());
  }, [currentPage]);

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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          disabled={!variableName || !variableValue}
          onClick={() => addVariable(variableName, variableValue)}
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
              <VariableItem
                key={name}
                name={name}
                value={value}
                isSelected={selectedVariables.has(name)}
                isSelectionMode={isSelectionMode}
                editingName={editingName}
                editingValue={editingValue}
                hoveredItem={hoveredItem}
                showDropdown={showDropdown}
                deleteControlsPosition={deleteControlsPosition}
                onMouseEnter={() => setHoveredItem(name)}
                onMouseLeave={() => setHoveredItem(null)}
                onEdit={(e) => setEditingValue(e.target.value)}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                onToggleSelection={() => toggleVariableSelection(name)}
                onCopy={() => copyVariableToClipboard(name)}
                onDuplicate={() => duplicateVariable(name, value)}
                onStartDirectDeletion={() => startDirectDeletion(name)}
                onDropdownToggle={(e) => {
                  e.stopPropagation();
                  setShowDropdown(showDropdown === name ? null : name);
                }}
                onDropdownClose={() => setShowDropdown(null)}
                onDeletePanelClose={cancelSelectionMode}
                onBulkDelete={handleBulkDelete}
                onSelectAll={selectAllVariables}
                onDeselectAll={deselectAllVariables}
                selectedVariables={selectedVariables}
                currentVariables={currentVariables}
                // FALTANTES:
                startEditing={startEditing}
                duplicateVariable={duplicateVariable}
                startDirectDeletion={startDirectDeletion}
                cancelSelectionMode={cancelSelectionMode}
                toggleVariableSelection={toggleVariableSelection}
                handleBulkDelete={handleBulkDelete}
              />
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

      {/* Modo Selección - Confirmación de Eliminación */}
      {isSelectionMode && (
        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm animate-fadeIn">
          <p className="text-sm text-red-700">
            Estás en modo selección. Puedes eliminar múltiples variables a la vez.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.from(selectedVariables).map(name => (
              <span key={name} className="text-xs bg-red-100 text-red-700 rounded-full px-3 py-1">
                {name}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition duration-200 flex items-center gap-1"
              title={`Eliminar ${selectedVariables.size} variable${selectedVariables.size > 1 ? 's' : ''} seleccionada${selectedVariables.size > 1 ? 's' : ''}`}
              disabled={selectedVariables.size === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6 4H9m6-8H9m9 4a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Eliminar ({selectedVariables.size})
            </button>
            <button
              onClick={cancelSelectionMode}
              className="px-3 py-1 text-xs bg-gray-300 text-gray-700 hover:bg-gray-400 rounded transition duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Variables;