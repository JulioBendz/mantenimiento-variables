import { render, screen, fireEvent } from '@testing-library/react';
import PeriodSelector from '../components/PeriodSelector';

const periods = {
  '2025-07': {
    name: 'Periodo 1',
    variables: { x: 1 },
    formulas: [{ name: 'Fórmula 1' }]
  },
  '2025-08': {
    name: 'Periodo 2',
    variables: { y: 2 },
    formulas: [{ name: 'Fórmula 2' }]
  }
};

test('muestra el periodo actual', () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  expect(screen.getAllByText(/Periodo 1/i).length).toBeGreaterThan(0);
});

test('permite cambiar de periodo', () => {
  const setCurrentPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={setCurrentPeriod}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  const select = screen.getByRole('combobox');
  fireEvent.change(select, { target: { value: '2025-08' } });
  expect(setCurrentPeriod).toHaveBeenCalledWith('2025-08');
});