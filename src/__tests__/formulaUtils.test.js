import { evaluateFormula } from '../utils/formulaUtils';

test('evaluateFormula retorna el resultado esperado', () => {
  expect(evaluateFormula('2+2', {})).toBe(4);
  expect(evaluateFormula('a+b', { a: 1, b: 2 })).toBe(3);
  expect(evaluateFormula('x*y', { x: 2, y: 5 })).toBe(10);
  expect(evaluateFormula('2,5+2', {})).toBe(4.5); // prueba coma decimal
  expect(evaluateFormula('a/b', { a: 4, b: 2 })).toBe(2);
  expect(evaluateFormula('a+b', {})).toBe('Error en la fórmula'); // variables faltantes
});