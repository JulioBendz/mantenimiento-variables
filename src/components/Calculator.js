import React from 'react';

function Calculator({ 
  formula, 
  setFormula, 
  formulaName,
  setFormulaName,
  calculateFormula, 
  result, 
  variables 
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Calculadora de Fórmulas
      </h2>
      
      {/* Campo para el nombre de la fórmula */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la fórmula (opcional):
        </label>
        <input
          type="text"
          placeholder="Ej: Área del círculo, Velocidad promedio, Teorema de Pitágoras"
          value={formulaName}
          onChange={(e) => setFormulaName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Si no asignas un nombre, se generará uno automáticamente
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fórmula matemática:
        </label>
        <textarea
          placeholder="Ej: x + y * 2, a^2 + b^2, (velocidad * tiempo) / 2"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Usa los nombres de variables definidas arriba. Operadores: +, -, *, /, **, ()
        </p>
      </div>

      <button
        onClick={calculateFormula}
        disabled={!formula || Object.keys(variables).length === 0}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
      >
        Calcular y Guardar
      </button>

      {/* Resultado */}
      {result !== null && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Resultado:
          </h3>
          <div className="text-2xl font-bold text-blue-600">
            {result}
          </div>
        </div>
      )}

      {/* Ayuda */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          💡 Consejos:
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Asigna un nombre descriptivo a tus fórmulas</li>
          <li>• Define variables antes de usarlas en fórmulas</li>
          <li>• Usa ** para exponentes (ej: x**2 para x²)</li>
          <li>• Usa paréntesis para agrupar operaciones</li>
          <li>• Los nombres de variables distinguen mayúsculas</li>
        </ul>
      </div>
    </div>
  );
}

export default Calculator;