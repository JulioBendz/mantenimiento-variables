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
  acceptableMin
}) {
  return (
    <div className="relative">
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
          {isSelectionMode && (
            <input
              type="checkbox"
              checked={selectedFormulas.has(formulaEntry.id)}
              onChange={() => toggleFormulaSelection(formulaEntry.id)}
              className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          )}
          <div className="flex-1">
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
              {renderPercentageAnalysis(formulaEntry, excellentMin, acceptableMin)}
              {formulaEntry.lastRecalculated && (
                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Última actualización: {formulaEntry.lastRecalculated}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                Variables utilizadas: {getUsedVariables(formulaEntry)}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {formulaEntry.date || 'Sin fecha'} - {formulaEntry.timestamp || 'Sin hora'}
            </div>
          </div>
        </div>
        {/* Menú contextual y controles de eliminación igual que antes */}
        {/* ...puedes copiar el bloque correspondiente del FormulaHistory.js... */}
      </div>
      {/* Panel de controles de eliminación igual que antes */}
    </div>
  );
}

export default FormulaItem;