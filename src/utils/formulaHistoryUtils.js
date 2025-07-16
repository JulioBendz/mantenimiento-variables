export function analyzePercentageResult(formulaEntry, excellentMin = 90, acceptableMin = 70) {
  const { result, name, originalFormula } = formulaEntry;
  if (result === 'Error en la fórmula' || result === null || result === undefined) return null;
  const numResult = typeof result === 'number' ? result : parseFloat(result);
  if (isNaN(numResult)) return null;

  const isPercentage =
    /\b(porcentaje|percent|%|eficiencia|efectividad|cumplimiento|rendimiento|desempeño|avance|progreso|satisfacción|calificación|nota|puntuación|score)\b/i.test(name) ||
    /\*\s*100|\*100|\/\s*100|\/100|\%/i.test(originalFormula) ||
    (numResult >= 0 && numResult <= 100) ||
    (numResult >= 0 && numResult <= 1 && originalFormula.includes('/'));

  if (!isPercentage) return null;

  let normalizedResult = numResult;
  if (numResult >= 0 && numResult <= 1) normalizedResult = numResult * 100;

  if (normalizedResult >= excellentMin && normalizedResult <= 100) {
    return { category: 'excellent', label: 'Excelente', icon: '✅', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', description: 'Resultado sobresaliente', percentage: normalizedResult };
  } else if (normalizedResult >= acceptableMin && normalizedResult < excellentMin) {
    return { category: 'intermediate', label: 'Intermedio', icon: '⚠️', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', description: 'Resultado aceptable, hay margen de mejora', percentage: normalizedResult };
  } else if (normalizedResult < acceptableMin) {
    return { category: 'critical', label: 'Crítico', icon: '❌', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', description: 'Resultado por debajo del estándar, requiere atención', percentage: normalizedResult };
  }
  return null;
}

export function renderPercentageAnalysis(formulaEntry, excellentMin = 90, acceptableMin = 70) {
  const analysis = analyzePercentageResult(formulaEntry, excellentMin, acceptableMin);
  if (!analysis) return null;
  return (
    <div className={`mt-2 p-2 rounded-lg border ${analysis.bgColor} ${analysis.borderColor}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{analysis.icon}</span>
        <div className="flex-1">
          <div className={`text-sm font-semibold ${analysis.color}`}>
            {analysis.label} ({analysis.percentage.toFixed(1)}%)
          </div>
          <div className="text-xs text-gray-600">
            {analysis.description}
          </div>
        </div>
        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              analysis.category === 'excellent' ? 'bg-green-500' :
              analysis.category === 'acceptable' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(analysis.percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}