import React, { useState } from 'react';

function FormulaHistory({ savedFormulas, removeFormula, reuseFormula, editFormulaName }) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Número de fórmulas por página

  const startEditing = (formula) => {
    setEditingId(formula.id);
    setEditingName(formula.name);
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
  };

  // Filtrar fórmulas según el término de búsqueda
  const filteredFormulas = savedFormulas.filter(formula =>
    formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formula.originalFormula.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Historial de Fórmulas
      </h2>
      
      {/* Buscador de fórmulas */}
      {savedFormulas.length > 0 && (
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
              Mostrando {filteredFormulas.length} de {savedFormulas.length} fórmulas
            </p>
          )}
        </div>
      )}
      
      {/* Lista de fórmulas con altura fija y scroll */}
      <div className="mb-4">
        <div 
          className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
          style={{ minHeight: '550px' }}
        >
          {savedFormulas.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay fórmulas calculadas
            </p>
          ) : filteredFormulas.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No se encontraron fórmulas con el término "{searchTerm}"
            </p>
          ) : (
            currentFormulas.map((formulaEntry) => (
              <div
                key={formulaEntry.id}
                className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500 hover:bg-gray-100 transition-colors"
              >
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
                        {formulaEntry.name}
                      </h3>
                      <button
                        onClick={() => startEditing(formulaEntry)}
                        className="text-gray-600 hover:text-blue-600 text-sm px-2 py-1 rounded"
                        title="Editar nombre"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </div>

                {/* Contenido de la fórmula */}
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Fórmula: {formulaEntry.originalFormula}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Evaluada: {formulaEntry.evaluatedFormula}
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    Resultado: {formulaEntry.result}
                  </div>
                </div>

                {/* Botones de acción y fecha */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    {formulaEntry.date} - {formulaEntry.timestamp}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => reuseFormula(formulaEntry)}
                      className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded bg-blue-50 hover:bg-blue-100"
                      title="Reutilizar fórmula"
                    >
                      📋 Reutilizar
                    </button>
                    <button
                      onClick={() => handleRemoveFormula(formulaEntry)}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded bg-red-50 hover:bg-red-100"
                      title="Eliminar fórmula"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
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

      {/* Estadísticas */}
      {savedFormulas.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-700">
            📊 Total de fórmulas guardadas: <span className="font-bold">{savedFormulas.length}</span>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default FormulaHistory;