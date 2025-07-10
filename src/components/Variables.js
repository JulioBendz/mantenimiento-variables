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
  const itemsPerPage = 8; // Número de variables por página

  const startEditing = (name, value) => {
    setEditingName(name);
    setEditingValue(value.toString());
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

  const handleRemoveVariable = (name) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la variable "${name}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (confirmDelete) {
      removeVariable(name);
    }
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

  // Calcular altura dinámica basada en el contenido
  const calculateDynamicHeight = () => {
    const variableCount = Object.keys(variables).length;
    const filteredCount = filteredVariables.length;
    const displayCount = Math.min(filteredCount, itemsPerPage);
    
    // Altura base mínima cuando no hay variables
    const minHeight = 80; // 80px mínimo
    
    // Altura por variable (aproximadamente 60px por variable)
    const heightPerVariable = 60;
    
    // Altura máxima (equivalente a 6-7 variables)
    const maxHeight = 400;
    
    if (variableCount === 0) {
      return minHeight;
    }
    
    // Calcular altura basada en número de variables a mostrar
    const calculatedHeight = minHeight + (displayCount * heightPerVariable);
    
    // No exceder la altura máxima
    return Math.min(calculatedHeight, maxHeight);
  };

  const dynamicHeight = calculateDynamicHeight();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Variables
      </h2>
      
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
              <div
                key={name}
                className="bg-gray-50 p-3 rounded-lg border-l-4 border-green-500 hover:bg-gray-100 transition-colors"
              >
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
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(name, value)}
                        className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm"
                        title="Editar variable"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleRemoveVariable(name)}
                        className="text-red-600 hover:text-red-800 px-2 py-1 rounded text-sm"
                        title="Eliminar variable"
                      >
                        🗑️
                      </button>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Variables;