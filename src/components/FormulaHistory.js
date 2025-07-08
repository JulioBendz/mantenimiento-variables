import React from 'react';

function FormulaHistory({ savedFormulas, removeFormula, reuseFormula }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Historial de Fórmulas
      </h2>
      
      <div className="space-y-3">
        {savedFormulas.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay fórmulas calculadas
          </p>
        ) : (
          savedFormulas.map((formulaEntry) => (
            <div
              key={formulaEntry.id}
              className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {formulaEntry.originalFormula}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {formulaEntry.evaluatedFormula}
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    = {formulaEntry.result}
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <button
                    onClick={() => reuseFormula(formulaEntry.originalFormula)}
                    className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                    title="Reutilizar fórmula"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => removeFormula(formulaEntry.id)}
                    className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {formulaEntry.timestamp}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FormulaHistory;