import { analyzePercentageResult } from '../utils/formulaHistoryUtils';

test('categoriza correctamente el resultado excelente', () => {
  const formulaEntry = { result: 95 };
  const analysis = analyzePercentageResult(formulaEntry, 90, 70);
  expect(analysis.category).toBe('excellent');
});

test('retorna null si no es porcentaje', () => {
  const formulaEntry = { result: 150, name: 'Producción', originalFormula: 'a+b' };
  const analysis = analyzePercentageResult(formulaEntry, 90, 70);
  expect(analysis).toBeNull();
});

test('retorna null si el resultado es mayor a 100', () => {
  const formulaEntry = { result: 150, name: 'porcentaje', originalFormula: 'a*100' };
  const analysis = analyzePercentageResult(formulaEntry, 90, 70);
  expect(analysis).toBeNull();
});