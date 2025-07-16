import React, { useState } from 'react';

function VariableItem({
  name,
  value,
  isSelected,
  isSelectionMode,
  editingName,
  editingValue,
  hoveredItem,
  showDropdown,
  deleteControlsPosition,
  onMouseEnter,
  onMouseLeave,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleSelection,
  onCopy,
  onDuplicate,
  onStartDirectDeletion,
  onDropdownToggle,
  onDropdownClose,
  onDeletePanelClose,
  onBulkDelete,
  onSelectAll,
  onDeselectAll,
  selectedVariables,
  currentVariables,
  startEditing,
  duplicateVariable,
  startDirectDeletion,
  cancelSelectionMode,
  toggleVariableSelection,
  handleBulkDelete
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="relative">
      <div
        className={`bg-gray-50 p-3 rounded-lg border-l-4 transition-all duration-200 ${
          isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-green-500 hover:bg-gray-100 hover:shadow-md'
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="flex items-center gap-2">
          {/* Checkbox solo en modo selección */}
          {isSelectionMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelection}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          )}
          {/* Icono de copia */}
          <button
            onClick={handleCopy}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition duration-200"
            title={`Copiar variable "${name}" al portapapeles`}
          >
            {copied ? (
              <span className="flex items-center text-green-600 gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs">Copiado</span>
              </span>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                <rect x="3" y="3" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            )}
          </button>
          <div className="flex-1">
            {editingName === name ? (
              // Modo edición
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 text-sm">{name} =</span>
                <input
                  type="number"
                  value={editingValue}
                  onChange={onEdit}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && onSaveEdit(name)}
                  autoFocus
                />
                <button
                  onClick={() => onSaveEdit(name)}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  title="Guardar cambios"
                >✓</button>
                <button
                  onClick={onCancelEdit}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  title="Cancelar edición"
                >✕</button>
              </div>
            ) : (
              // Modo visualización
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{name} = {value}</span>
              </div>
            )}
          </div>
          {/* Menú contextual - Solo aparece en hover y fuera del modo selección */}
          {!isSelectionMode && hoveredItem === name && editingName !== name && (
            <div className="absolute top-2 right-2">
              <button
                onClick={onDropdownToggle}
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
                onClick={selectedVariables.size === currentVariables.length ? onDeselectAll : onSelectAll}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition duration-200 flex items-center gap-1"
                title={selectedVariables.size === currentVariables.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedVariables.size === currentVariables.length ? 'Deseleccionar' : 'Seleccionar todo'}
              </button>
              <button
                onClick={onBulkDelete}
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
                onClick={onDeletePanelClose}
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

export default VariableItem;