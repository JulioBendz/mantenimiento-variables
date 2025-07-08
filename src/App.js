import React, { useState } from 'react';
import './App.css';

function App() {
  const [variables, setVariables] = useState({});
  const [variableName, setVariableName] = useState('');
  const [variableValue, setVariableValue] = useState('');
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState(null);

  const addVariable = () => {
    if (variableName && variableValue) {
      setVariables(prev => ({
        ...prev,
        [variableName]: parseFloat(variableValue)
      }));
      setVariableName('');
      setVariableValue('');
    }
  };

  const removeVariable = (name) => {
    setVariables(prev => {
      const newVars = { ...prev };
      delete newVars[name];
      return newVars;
    });
  };

  const calculateFormula = () => {
    try {
      // Reemplazar variables en la fórmula
      let evaluableFormula = formula;
      Object.keys(variables).forEach(varName => {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        evaluableFormula = evaluableFormula.replace(regex, variables[varName]);
      });
      
      // Evaluar la fórmula (en un entorno real, usar una librería más segura)
      const calculatedResult = Function(`"use strict"; return (${evaluableFormula})`)();
      setResult(calculatedResult);
    } catch (error) {
      setResult('Error en la fórmula');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl sm:max-w-screen-xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Mantenimiento de Variables
          </h1>
          <p className="text-gray-600">
            Gestiona variables numéricas y evalúa fórmulas matemáticas
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sección de Variables */}
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Valor numérico"
                  value={variableValue}
                  onChange={(e) => setVariableValue(e.target.value)}
                  className="flex-1 sm:min-w-[140px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Sección de Fórmulas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Calculadora de Fórmulas
            </h2>
            
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
              Calcular Resultado
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
                <li>• Define variables antes de usarlas en fórmulas</li>
                <li>• Usa ** para exponentes (ej: x**2 para x²)</li>
                <li>• Usa paréntesis para agrupar operaciones</li>
                <li>• Los nombres de variables distinguen mayúsculas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
