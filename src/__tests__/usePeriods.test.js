import { renderHook, act } from '@testing-library/react';
import { usePeriods } from '../hooks/usePeriods';

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