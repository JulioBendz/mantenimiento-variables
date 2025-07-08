import React from 'react';

function Variables({ 
  variables, 
  variableName, 
  setVariableName, 
  variableValue, 
  setVariableValue, 
  addVariable, 
  removeVariable 
}) {
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
            className="flex-1 sm:min-w-[100px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Valor numérico"
            value={variableValue}
            onChange={(e) => setVariableValue(e.target.value)}
            className="flex-1 sm:min-w-[100px] lg:max-w-[155px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={addVariable}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Agregar Variable
        </button>
      </div>

      {/* Lista de variables */}
      <div className="space-y-2">
        {Object.keys(variables).length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay variables definidas
          </p>
        ) : (
          Object.entries(variables).map(([name, value]) => (
            <div
              key={name}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <span className="font-medium text-gray-700">
                {name} = {value}
              </span>
              <button
                onClick={() => removeVariable(name)}
                className="text-red-600 hover:text-red-800 px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Variables;