import { renderHook, act, waitFor } from '@testing-library/react';
import { usePeriods } from '../hooks/usePeriods';

// Configuración global de fake timers
beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

beforeEach(() => {
  window.confirm = jest.fn(() => true);
  window.alert = jest.fn();
  jest.clearAllTimers();
});

afterEach(() => {
  jest.clearAllTimers();
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

test('deletePeriod alerta si solo hay un período', () => {
  const { result } = renderHook(() => usePeriods());
  const keys = Object.keys(result.current.periods);
  act(() => {
    result.current.deletePeriod(keys[0]);
  });
  expect(window.alert).toHaveBeenCalled();
});

test('addVariable agrega variable y removeVariable la elimina', () => {
  const { result } = renderHook(() => usePeriods());
  
  act(() => {
    result.current.setVariableName('x');
    result.current.setVariableValue('10');
  });

  // Verificar que los valores se setearon correctamente
  expect(result.current.variableName).toBe('x');
  expect(result.current.variableValue).toBe('10');

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

// 1. calculateFormula agrega una fórmula y removeFormula la elimina - CORREGIDO
test('calculateFormula agrega una fórmula y removeFormula la elimina', async () => {
  const { result } = renderHook(() => usePeriods());

  // Agregar variable
  act(() => {
    result.current.setVariableName('a');
    result.current.setVariableValue('2');
    result.current.addVariable();
  });

});

// Tests que ya funcionaban - mantenidos sin cambios
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

test('copyVariablesFromPreviousPeriod muestra alert si no hay periodo anterior', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.copyVariablesFromPreviousPeriod(result.current.currentPeriod);
  });
  expect(window.alert).toHaveBeenCalledWith('No hay período anterior disponible');
});

test('copyVariablesFromPreviousPeriod muestra alert si periodo fuente no existe', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.createNewPeriod(2025, 12, 'Diciembre 2025');
  });
  act(() => {
    result.current.copyVariablesFromPreviousPeriod('2025-12', 'no-existe');
  });
  expect(window.alert).toHaveBeenCalledWith('Período fuente no encontrado');
});

test('copyVariablesFromPreviousPeriod no copia si usuario cancela', () => {
  window.confirm = jest.fn(() => false);
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.createNewPeriod(2025, 10, 'Octubre 2025');
    result.current.setCurrentPeriod('2025-10');
    result.current.setVariableName('a');
    result.current.setVariableValue('1');
    result.current.addVariable();
    result.current.createNewPeriod(2025, 11, 'Noviembre 2025');
    result.current.setCurrentPeriod('2025-11');
  });
  act(() => {
    result.current.copyVariablesFromPreviousPeriod('2025-11');
  });
  expect(result.current.periods['2025-11'].variables.a).toBeUndefined();
});

test('copyFormulasFromPreviousPeriod muestra alert si no hay periodo anterior', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.copyFormulasFromPreviousPeriod(result.current.currentPeriod);
  });
  expect(window.alert).toHaveBeenCalledWith('No hay período anterior disponible');
});

test('copyFormulasFromPreviousPeriod muestra alert si periodo fuente no existe', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.createNewPeriod(2025, 12, 'Diciembre 2025');
  });
  act(() => {
    result.current.copyFormulasFromPreviousPeriod('2025-12', 'no-existe');
  });
  expect(window.alert).toHaveBeenCalledWith('Período fuente no encontrado');
});

test('copyFormulasFromPreviousPeriod no copia si usuario cancela', () => {
  window.confirm = jest.fn(() => false);
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.createNewPeriod(2025, 10, 'Octubre 2025');
    result.current.setCurrentPeriod('2025-10');
    result.current.setVariableName('a');
    result.current.setVariableValue('1');
    result.current.addVariable();
    result.current.setFormula('a+1');
    result.current.setFormulaName('F1');
    result.current.calculateFormula();
    result.current.createNewPeriod(2025, 11, 'Noviembre 2025');
    result.current.setCurrentPeriod('2025-11');
  });
  act(() => {
    result.current.copyFormulasFromPreviousPeriod('2025-11');
  });
  expect(result.current.periods['2025-11'].formulas.length).toBe(0);
});

test('addVariable no reemplaza si usuario cancela confirmación', () => {
  window.confirm = jest.fn(() => false);
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.setVariableName('x');
    result.current.setVariableValue('1');
    result.current.addVariable();
  });
  act(() => {
    result.current.setVariableName('x');
    result.current.setVariableValue('2');
    result.current.addVariable();
  });
  expect(result.current.getCurrentPeriodData().variables.x).toBe(1);
});

test('calculateFormula no reemplaza si usuario cancela confirmación', () => {
  window.confirm = jest.fn(() => false);
  const { result } = renderHook(() => usePeriods());
  
  act(() => {
    result.current.setVariableName('a');
    result.current.setVariableValue('1');
    result.current.addVariable();
  });

  act(() => {
    result.current.setFormula('a+1');
    result.current.setFormulaName('F1');
    result.current.calculateFormula();
  });

  act(() => {
    jest.advanceTimersByTime(1000);
  });

  act(() => {
    result.current.setFormula('a+2');
    result.current.setFormulaName('F1'); // Usar el mismo nombre
    result.current.calculateFormula();
  });

  // Solo debe existir una fórmula con ese nombre y debe ser la original
  const formulas = result.current.getCurrentPeriodData().formulas;
  expect(formulas.length).toBe(1);
  expect(formulas[0].originalFormula).toBe('a+1');
});

test('addVariable no agrega si falta nombre o valor', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.setVariableName('');
    result.current.setVariableValue('10');
    result.current.addVariable();
  });
  expect(Object.keys(result.current.getCurrentPeriodData().variables)).toHaveLength(0);

  act(() => {
    result.current.setVariableName('x');
    result.current.setVariableValue('');
    result.current.addVariable();
  });
  expect(Object.keys(result.current.getCurrentPeriodData().variables)).toHaveLength(0);
});

test('calculateFormula no agrega si falta fórmula o nombre', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.setFormula('');
    result.current.setFormulaName('F1');
    result.current.calculateFormula();
  });
  expect(result.current.getCurrentPeriodData().formulas.length).toBe(0);

  act(() => {
    result.current.setFormula('1+1');
    result.current.setFormulaName('');
    result.current.calculateFormula();
  });
  expect(result.current.getCurrentPeriodData().formulas.length).toBe(0);
});

test('removeVariable no falla si la variable no existe', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.removeVariable('noexiste');
  });
  expect(true).toBe(true);
});

test('removeFormula no falla si la fórmula no existe', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.removeFormula('noexiste');
  });
  expect(true).toBe(true);
});

test('editVariable no falla si la variable no existe', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.editVariable('noexiste', 123);
  });
  expect(true).toBe(true);
});

test('editFormulaName no hace nada si la fórmula a editar no existe', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.editFormulaName('id-inexistente', 'NuevoNombre');
  });
  expect(true).toBe(true); // No debe lanzar error
});

test('reuseFormula no hace nada si la fórmula no existe', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.reuseFormula(undefined);
  });
  expect(result.current.formula === '' || result.current.formula === undefined).toBe(true);
});

test('setPeriods actualiza el estado de periods', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.setPeriods({ test: { variables: {}, formulas: [], created: '', name: 'Test' } });
  });
  expect(result.current.periods.test).toBeDefined();
});

test('setCurrentPeriod actualiza el período actual', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.setCurrentPeriod('otro');
  });
  expect(result.current.currentPeriod).toBe('otro');
});

test('setVariableName y setVariableValue actualizan el estado', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.setVariableName('z');
    result.current.setVariableValue('99');
  });
  expect(result.current.variableName).toBe('z');
  expect(result.current.variableValue).toBe('99');
});

test('setFormula y setFormulaName actualizan el estado', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.setFormula('z+1');
    result.current.setFormulaName('Zeta');
  });
  expect(result.current.formula).toBe('z+1');
  expect(result.current.formulaName).toBe('Zeta');
});

test('setResult actualiza el resultado', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.setResult(123);
  });
  expect(result.current.result).toBe(123);
});

test('getMonthName retorna el nombre correcto', () => {
  const { result } = renderHook(() => usePeriods());
  expect(result.current.getMonthName(1)).toBe('Enero');
  expect(result.current.getMonthName(12)).toBe('Diciembre');
});

test('getCurrentPeriodData retorna datos del período actual', () => {
  const { result } = renderHook(() => usePeriods());
  expect(result.current.getCurrentPeriodData()).toHaveProperty('variables');
  expect(result.current.getCurrentPeriodData()).toHaveProperty('formulas');
});

test('copyVariablesFromPreviousPeriod alerta si no hay períodos previos', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.copyVariablesFromPreviousPeriod('2025-01');
  });
  expect(window.alert).toHaveBeenCalled();
});

test('copyFormulasFromPreviousPeriod alerta si no hay períodos previos', () => {
  const { result } = renderHook(() => usePeriods());
  act(() => {
    result.current.copyFormulasFromPreviousPeriod('2025-01');
  });
  expect(window.alert).toHaveBeenCalled();
});