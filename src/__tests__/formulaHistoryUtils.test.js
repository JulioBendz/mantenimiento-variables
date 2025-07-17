import { analyzePercentageResult } from '../utils/formulaHistoryUtils';

test('categoriza correctamente el resultado excelente', () => {
  const formulaEntry = { result: 95 };
  const analysis = analyzePercentageResult(formulaEntry, 90, 70);
  expect(analysis.category).toBe('excellent');
});