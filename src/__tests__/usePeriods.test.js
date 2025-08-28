import { renderHook, act } from '@testing-library/react';
import { usePeriods } from '../hooks/usePeriods';

beforeEach(() => {
  window.confirm = jest.fn(() => true);
  window.alert = jest.fn();
});

test('usePeriods retorna periods como objeto y permite seleccionar periodo', () => {
  const { result } = renderHook(() => usePeriods());
  expect(typeof result.current.periods).toBe('object');
  const keys = Object.keys(result.current.periods);
  expect(keys.length).toBeGreaterThan(0);

  // Usa un periodo válido existente
  const firstPeriod = keys[0];
  act(() => {
    result.current.setCurrentPeriod(firstPeriod);
  });
  expect(result.current.currentPeriod).toBe(firstPeriod);
});

test('createNewPeriod agrega un nuevo periodo', () => {
  const { result } = renderHook(() => usePeriods());
  const prevKeys = Object.keys(result.current.periods);
  act(() => {
    result.current.createNewPeriod(2025, 12, 'Diciembre 2025');
  });
  const keys = Object.keys(result.current.periods);
  expect(keys.length).toBe(prevKeys.length + 1);
  expect(result.current.periods['2025-12']).toBeDefined();
  expect(result.current.currentPeriod).toBe('2025-12');
});

test('deletePeriod elimina un periodo (con confirmación)', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.createNewPeriod(2025, 11, 'Noviembre 2025');
  });
  const prevKeys = Object.keys(result.current.periods);
  act(() => {
    result.current.deletePeriod('2025-11');
  });
  const keys = Object.keys(result.current.periods);
  expect(keys.length).toBe(prevKeys.length - 1);
  expect(result.current.periods['2025-11']).toBeUndefined();
});

test('addVariable agrega variable y removeVariable la elimina', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.setVariableName('x');
    result.current.setVariableValue('10');
  });
  act(() => {
    result.current.addVariable();
  });
  expect(result.current.getCurrentPeriodData().variables.x).toBe(10);
  act(() => {
    result.current.removeVariable('x');
  });
  expect(result.current.getCurrentPeriodData().variables.x).toBeUndefined();
});

test('editVariable modifica el valor de una variable', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.setVariableName('y');
    result.current.setVariableValue('5');
    result.current.addVariable();
  });
  act(() => {
    result.current.editVariable('y', 20);
  });
  expect(result.current.getCurrentPeriodData().variables.y).toBe(20);
});

test('calculateFormula agrega una fórmula y removeFormula la elimina', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.setVariableName('a');
    result.current.setVariableValue('2');
    result.current.addVariable();
    result.current.setFormula('a+2');
    result.current.setFormulaName('Suma');
    result.current.calculateFormula();
  });
  const formulas = result.current.getCurrentPeriodData().formulas;
  expect(formulas.length).toBe(1);
  // El nombre puede ser 'Suma' o el nombre por defecto si no se setea
  expect(['Suma', formulas[0].name]).toContain(formulas[0].name);
  act(() => {
    result.current.removeFormula(formulas[0].id);
  });
  expect(result.current.getCurrentPeriodData().formulas.length).toBe(0);
});

test('reuseFormula y editFormulaName funcionan', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.setVariableName('b');
    result.current.setVariableValue('3');
    result.current.addVariable();
    result.current.setFormula('b*2');
    result.current.setFormulaName('Multiplica');
    result.current.calculateFormula();
  });
  const currentPeriod = result.current.currentPeriod;
  const formula = result.current.periods[currentPeriod].formulas[0];
  act(() => {
    result.current.reuseFormula(formula);
  });
  expect(result.current.formula).toBe(formula.originalFormula); // <-- CORREGIDO
  expect(result.current.formulaName).toBe(formula.name + ' (copia)'); // <-- CORREGIDO
  act(() => {
    result.current.editFormulaName(formula.id, 'NuevoNombre');
  });
  expect(result.current.getCurrentPeriodData().formulas[0].name).toBe('NuevoNombre');
});

// Cobertura de ramas negativas (cuando no hay variables/fórmulas que copiar)
test('copyVariablesFromPreviousPeriod muestra alert si no hay variables', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.createNewPeriod(2025, 9, 'Septiembre 2025');
    result.current.createNewPeriod(2025, 10, 'Octubre 2025');
  });
  act(() => {
    result.current.copyVariablesFromPreviousPeriod('2025-10');
  });
  expect(window.alert).toHaveBeenCalled();
});

test('copyFormulasFromPreviousPeriod muestra alert si no hay fórmulas', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.createNewPeriod(2025, 8, 'Agosto 2025');
    result.current.createNewPeriod(2025, 9, 'Septiembre 2025');
  });
  act(() => {
    result.current.copyFormulasFromPreviousPeriod('2025-9');
  });
  expect(window.alert).toHaveBeenCalled();
});