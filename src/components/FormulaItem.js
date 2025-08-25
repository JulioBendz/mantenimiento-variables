import React from 'react';
import { renderPercentageAnalysis } from '../utils/formulaHistoryUtils';

function FormulaItem({
  formulaEntry,
  editingId,
  editingName,
  startEditing,
  saveEdit,
  cancelEdit,
  isSelectionMode,
  selectedFormulas,
  toggleFormulaSelection,
  reuseFormulaWithOptions,
  copyFormulaToClipboard,
  startDirectDeletion,
  hoveredItem,
  setHoveredItem,
  showDropdown,
  setShowDropdown,
  deleteControlsPosition,
  deleteControlsRef,
  getUsedVariables,
  excellentMin,
  acceptableMin,
  currentFormulas,
  selectAllFormulas,
  deselectAllFormulas,
  handleBulkDelete,
  cancelSelectionMode
}) {
  const formulasLength = Array.isArray(currentFormulas) ? currentFormulas.length : 0;

  return (
    <div key={formulaEntry.id} className="relative">
      <div
        className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${
          selectedFormulas.has(formulaEntry.id)
            ? 'bg-blue-50 border-blue-500 shadow-sm'
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
                    onChange={(e) => startEditing({ ...formulaEntry, name: e.target.value })}
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
                    title="Cancelar edición"
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
              {renderPercentageAnalysis(formulaEntry, excellentMin, acceptableMin)}
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
            {/* Dropdown menu simplificado */}
            {showDropdown === formulaEntry.id && (
              <div className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => reuseFormulaWithOptions(formulaEntry)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                    title="Cargar esta fórmula en el calculador para usarla nuevamente"
                  >
                    <span>🔄</span>
                    Usar nuevamente
                  </button>
                  <button
                    onClick={() => startEditing(formulaEntry)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center gap-2"
                    title="Cambiar el nombre de esta fórmula"
                  >
                    <span>✏️</span>
                    Editar nombre
                  </button>
                  <button
                    onClick={() => copyFormulaToClipboard(formulaEntry)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                    title="Copiar información de la fórmula al portapapeles"
                  >
                    <span>📄</span>
                    Copiar información
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => startDirectDeletion(formulaEntry.id)}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    title="Eliminar esta fórmula del historial"
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
      {/* Panel de controles de eliminación - Aparece debajo de la fórmula seleccionada */}
      {isSelectionMode && deleteControlsPosition.id === formulaEntry.id && deleteControlsPosition.show && (
        <div 
          ref={deleteControlsRef}
          className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm animate-fadeIn"
        >
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
                {selectedFormulas.size} seleccionada{selectedFormulas.size > 1 ? 's' : ''}
              </span>
            </div>
            {/* Controles de acción */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={selectedFormulas.size === formulasLength ? deselectAllFormulas : selectAllFormulas}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition duration-200 flex items-center gap-1"
                title={selectedFormulas.size === formulasLength ? 'Deseleccionar todas' : 'Seleccionar todas'}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedFormulas.size === formulasLength ? 'Deseleccionar' : 'Seleccionar todo'}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedFormulas.size === 0}
                className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition duration-200 flex items-center gap-1"
                title={`Eliminar ${selectedFormulas.size} fórmula${selectedFormulas.size > 1 ? 's' : ''} seleccionada${selectedFormulas.size > 1 ? 's' : ''}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar ({selectedFormulas.size})
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
  );
}

export default FormulaItem;