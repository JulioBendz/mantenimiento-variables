import React, { useState } from 'react';

function PeriodSelector({ 
  periods, 
  currentPeriod, 
  setCurrentPeriod, 
  createNewPeriod,
  deletePeriod,
  copyVariablesFromPreviousPeriod,
  copyFormulasFromPreviousPeriod
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newMonth, setNewMonth] = useState(new Date().getMonth() + 1);
  
  // Estados para la copia de datos
  const [copyVariables, setCopyVariables] = useState(true);
  const [copyFormulas, setCopyFormulas] = useState(true);
  const [sourcePeriod, setSourcePeriod] = useState('');

  // Estados para los modales de copia individual
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [showFormulasModal, setShowFormulasModal] = useState(false);
  const [selectedSourceForVariables, setSelectedSourceForVariables] = useState('');
  const [selectedSourceForFormulas, setSelectedSourceForFormulas] = useState('');

  const handleCreatePeriod = () => {
    // El nombre se asigna automáticamente basado en mes y año
    const periodName = `${getMonthName(newMonth)} ${newYear}`;
    const periodKey = `${newYear}-${newMonth.toString().padStart(2, '0')}`;
    
    // Verificar si ya existe
    if (periods[periodKey]) {
      alert(`Ya existe un período para ${periodName}`);
      return;
    }

    // Crear el nuevo período
    createNewPeriod(newYear, newMonth, periodName);
    
    // Copiar datos si están seleccionados
    if (sourcePeriod && (copyVariables || copyFormulas)) {
      setTimeout(() => {
        if (copyVariables) {
          copyVariablesFromSpecificPeriod(periodKey, sourcePeriod);
        }
        if (copyFormulas) {
          copyFormulasFromSpecificPeriod(periodKey, sourcePeriod);
        }
      }, 100);
    }
    
    // Resetear formulario
    setShowCreateForm(false);
    setCopyVariables(true);
    setCopyFormulas(true);
    setSourcePeriod('');
  };

  const handleDeletePeriod = (periodKey) => {
    if (window.confirm('¿Seguro que deseas eliminar este período?')) {
      deletePeriod(periodKey);
    }
  };

  const copyVariablesFromSpecificPeriod = (targetPeriod, sourcePeriodKey) => {
    if (!periods[sourcePeriodKey]) return;
    
    const sourceVariables = periods[sourcePeriodKey].variables;
    
    if (Object.keys(sourceVariables).length > 0) {
      copyVariablesFromPreviousPeriod(targetPeriod, sourcePeriodKey);
    }
  };

  const copyFormulasFromSpecificPeriod = (targetPeriod, sourcePeriodKey) => {
    if (!periods[sourcePeriodKey]) return;
    
    const sourceFormulas = periods[sourcePeriodKey].formulas;
    
    if (sourceFormulas.length > 0) {
      copyFormulasFromPreviousPeriod(targetPeriod, sourcePeriodKey);
    }
  };

  // Función para copiar variables con modal de selección
  const handleCopyVariablesWithModal = () => {
    if (!selectedSourceForVariables) {
      alert('Selecciona un período fuente para copiar variables');
      return;
    }
    
    copyVariablesFromSpecificPeriod(currentPeriod, selectedSourceForVariables);
    setShowVariablesModal(false);
    setSelectedSourceForVariables('');
  };

  // Función para copiar fórmulas con modal de selección
  const handleCopyFormulasWithModal = () => {
    if (!selectedSourceForFormulas) {
      alert('Selecciona un período fuente para copiar fórmulas');
      return;
    }
    
    copyFormulasFromSpecificPeriod(currentPeriod, selectedSourceForFormulas);
    setShowFormulasModal(false);
    setSelectedSourceForFormulas('');
  };

  const getMonthName = (month) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month - 1];
  };

  const sortedPeriods = Object.entries(periods).sort((a, b) => b[0].localeCompare(a[0]));
  
  // Obtener períodos disponibles para copiar (excluyendo el actual)
  const availablePeriodsForCopy = sortedPeriods.filter(([key]) => key !== currentPeriod);
  
  // Obtener período anterior automáticamente
  const getDefaultSourcePeriod = () => {
    const periodKeys = Object.keys(periods).sort((a, b) => b.localeCompare(a));
    return periodKeys[0] || '';
  };

  // Efecto para establecer el período fuente por defecto
  React.useEffect(() => {
    if (showCreateForm && !sourcePeriod) {
      setSourcePeriod(getDefaultSourcePeriod());
    }
  }, [showCreateForm]);

  // Efecto para establecer períodos por defecto en modales
  React.useEffect(() => {
    if (showVariablesModal && !selectedSourceForVariables && availablePeriodsForCopy.length > 0) {
      setSelectedSourceForVariables(availablePeriodsForCopy[0][0]);
    }
  }, [showVariablesModal]);

  React.useEffect(() => {
    if (showFormulasModal && !selectedSourceForFormulas && availablePeriodsForCopy.length > 0) {
      setSelectedSourceForFormulas(availablePeriodsForCopy[0][0]);
    }
  }, [showFormulasModal]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          📅 Período Actual: {periods[currentPeriod]?.name || 'Sin seleccionar'}
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
        >
          + Nuevo Período
        </button>
      </div>

      {/* Formulario para crear nuevo período */}
      {showCreateForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Crear Nuevo Período</h3>
          
          {/* Información del nuevo período - SIMPLIFICADO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="2020"
                max="2030"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
              <select
                value={newMonth}
                onChange={(e) => setNewMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vista previa del nombre del período */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700">
              <strong>Período a crear:</strong> {getMonthName(newMonth)} {newYear}
            </div>
          </div>

          {/* Sección de copia de datos */}
          {sortedPeriods.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">
                📋 Copiar Datos de Período Existente
              </h4>
              
              {/* Selector de período fuente */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Copiar desde:
                </label>
                <select
                  value={sourcePeriod}
                  onChange={(e) => setSourcePeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No copiar datos</option>
                  {sortedPeriods.map(([key, period]) => (
                    <option key={key} value={key}>
                      {period.name} ({Object.keys(period.variables).length} variables, {period.formulas.length} fórmulas)
                    </option>
                  ))}
                </select>
              </div>

              {/* Checkboxes para seleccionar qué copiar */}
              {sourcePeriod && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <input
                      type="checkbox"
                      id="copyVariables"
                      checked={copyVariables}
                      onChange={(e) => setCopyVariables(e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="copyVariables" className="ml-3 flex-1">
                      <div className="text-sm font-medium text-green-800">
                        ✓ Copiar Variables
                      </div>
                      <div className="text-xs text-green-600">
                        {periods[sourcePeriod] ? Object.keys(periods[sourcePeriod].variables).length : 0} variables disponibles
                      </div>
                      {periods[sourcePeriod] && Object.keys(periods[sourcePeriod].variables).length > 0 && (
                        <div className="text-xs text-green-500 mt-1">
                          {Object.keys(periods[sourcePeriod].variables).slice(0, 3).join(', ')}
                          {Object.keys(periods[sourcePeriod].variables).length > 3 && '...'}
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="copyFormulas"
                      checked={copyFormulas}
                      onChange={(e) => setCopyFormulas(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="copyFormulas" className="ml-3 flex-1">
                      <div className="text-sm font-medium text-blue-800">
                        ✓ Copiar Fórmulas
                      </div>
                      <div className="text-xs text-blue-600">
                        {periods[sourcePeriod] ? periods[sourcePeriod].formulas.length : 0} fórmulas disponibles
                      </div>
                      {periods[sourcePeriod] && periods[sourcePeriod].formulas.length > 0 && (
                        <div className="text-xs text-blue-500 mt-1">
                          {periods[sourcePeriod].formulas.slice(0, 2).map(f => f.name).join(', ')}
                          {periods[sourcePeriod].formulas.length > 2 && '...'}
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Información adicional */}
              {sourcePeriod && (copyVariables || copyFormulas) && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
                  <div className="text-sm text-yellow-800">
                    ℹ️ <strong>Información:</strong>
                    {copyVariables && (
                      <span className="block mt-1">
                        • Las variables se copiarán con sus valores. Podrás modificarlos después.
                      </span>
                    )}
                    {copyFormulas && (
                      <span className="block mt-1">
                        • Las fórmulas se copiarán y se recalcularán automáticamente con las variables del nuevo período.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreatePeriod}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
            >
              Crear {getMonthName(newMonth)} {newYear}
              {sourcePeriod && (copyVariables || copyFormulas) && (
                <span className="ml-1 text-xs">
                  (con datos)
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setCopyVariables(true);
                setCopyFormulas(true);
                setSourcePeriod('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Selector de período y acciones */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar Período:
          </label>
          <select
            value={currentPeriod}
            onChange={(e) => setCurrentPeriod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortedPeriods.map(([key, period]) => (
              <option key={key} value={key}>
                {period.name} ({Object.keys(period.variables).length} variables, {period.formulas.length} fórmulas)
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowVariablesModal(true)}
            className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition duration-200"
            title="Copiar variables de otro período"
            disabled={availablePeriodsForCopy.length === 0}
          >
            📋 Variables
          </button>
          <button
            onClick={() => setShowFormulasModal(true)}
            className="bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700 transition duration-200"
            title="Copiar fórmulas de otro período"
            disabled={availablePeriodsForCopy.length === 0}
          >
            📋 Fórmulas
          </button>
          <button
            onClick={() => handleDeletePeriod(currentPeriod)}
            className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition duration-200"
            title="Eliminar período actual"
            disabled={Object.keys(periods).length === 1}
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {/* Modal para copiar variables */}
      {showVariablesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📋 Copiar Variables
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona el período desde el cual copiar variables al período actual:
              <strong className="block mt-1">{periods[currentPeriod]?.name}</strong>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copiar variables desde:
              </label>
              <select
                value={selectedSourceForVariables}
                onChange={(e) => setSelectedSourceForVariables(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar período...</option>
                {availablePeriodsForCopy.map(([key, period]) => (
                  <option key={key} value={key}>
                    {period.name} ({Object.keys(period.variables).length} variables)
                  </option>
                ))}
              </select>
            </div>

            {selectedSourceForVariables && periods[selectedSourceForVariables] && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-800">
                  <strong>Variables a copiar:</strong>
                  <div className="mt-1 text-xs">
                    {Object.keys(periods[selectedSourceForVariables].variables).length > 0 ? (
                      <>
                        {Object.keys(periods[selectedSourceForVariables].variables).slice(0, 5).join(', ')}
                        {Object.keys(periods[selectedSourceForVariables].variables).length > 5 && 
                          ` y ${Object.keys(periods[selectedSourceForVariables].variables).length - 5} más...`
                        }
                      </>
                    ) : (
                      'No hay variables en este período'
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCopyVariablesWithModal}
                disabled={!selectedSourceForVariables || Object.keys(periods[selectedSourceForVariables]?.variables || {}).length === 0}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
              >
                Copiar Variables
              </button>
              <button
                onClick={() => {
                  setShowVariablesModal(false);
                  setSelectedSourceForVariables('');
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para copiar fórmulas */}
      {showFormulasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📋 Copiar Fórmulas
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona el período desde el cual copiar fórmulas al período actual:
              <strong className="block mt-1">{periods[currentPeriod]?.name}</strong>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copiar fórmulas desde:
              </label>
              <select
                value={selectedSourceForFormulas}
                onChange={(e) => setSelectedSourceForFormulas(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar período...</option>
                {availablePeriodsForCopy.map(([key, period]) => (
                  <option key={key} value={key}>
                    {period.name} ({period.formulas.length} fórmulas)
                  </option>
                ))}
              </select>
            </div>

            {selectedSourceForFormulas && periods[selectedSourceForFormulas] && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800">
                  <strong>Fórmulas a copiar:</strong>
                  <div className="mt-1 text-xs">
                    {periods[selectedSourceForFormulas].formulas.length > 0 ? (
                      <>
                        {periods[selectedSourceForFormulas].formulas.slice(0, 3).map(f => f.name).join(', ')}
                        {periods[selectedSourceForFormulas].formulas.length > 3 && 
                          ` y ${periods[selectedSourceForFormulas].formulas.length - 3} más...`
                        }
                      </>
                    ) : (
                      'No hay fórmulas en este período'
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCopyFormulasWithModal}
                disabled={!selectedSourceForFormulas || periods[selectedSourceForFormulas]?.formulas.length === 0}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
              >
                Copiar Fórmulas
              </button>
              <button
                onClick={() => {
                  setShowFormulasModal(false);
                  setSelectedSourceForFormulas('');
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas del período currentPeriod */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-700">
          📊 Período actual: <span className="font-bold">{periods[currentPeriod]?.name}</span>
          <span className="ml-4">
            Variables: <span className="font-bold">{Object.keys(periods[currentPeriod]?.variables || {}).length}</span>
          </span>
          <span className="ml-4">
            Fórmulas: <span className="font-bold">{periods[currentPeriod]?.formulas?.length || 0}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default PeriodSelector;