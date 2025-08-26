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

afterEach(() => {
  jest.restoreAllMocks();
});

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

test('permite crear un nuevo periodo', () => {
  const createNewPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={createNewPeriod}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  const btn = screen.getByRole('button', { name: /\+ nuevo período/i });
  fireEvent.click(btn);
  // Aquí podrías simular el llenado del formulario y el click en "Crear", si quieres cobertura completa
});

test('no crea un período si ya existe', () => {
  window.alert = jest.fn();
  const createNewPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={createNewPeriod}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /\+ nuevo período/i }));
  // No cambies el año/mes, así el período ya existe
  fireEvent.click(screen.getByRole('button', { name: /crear/i }));
  expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/ya existe/i));
  expect(createNewPeriod).not.toHaveBeenCalled();
});

test('permite eliminar el periodo actual', () => {
  const deletePeriod = jest.fn();
  window.confirm = jest.fn(() => true); // Simula confirmación positiva

  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={deletePeriod}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  const btn = screen.getByRole('button', { name: /eliminar/i });
  fireEvent.click(btn);
  expect(window.confirm).toHaveBeenCalled();
  expect(deletePeriod).toHaveBeenCalledWith('2025-07');
});

test('no elimina el periodo si el usuario cancela la confirmación', () => {
  const deletePeriod = jest.fn();
  window.confirm = jest.fn(() => false);

  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={deletePeriod}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  const btn = screen.getByRole('button', { name: /eliminar/i });
  fireEvent.click(btn);
  expect(window.confirm).toHaveBeenCalled();
  expect(deletePeriod).not.toHaveBeenCalled();
});

test('permite copiar variables del periodo anterior', async () => {
  const copyVariablesFromPreviousPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-08"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={copyVariablesFromPreviousPeriod}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  const btn = screen.getByRole('button', { name: /variables/i });
  fireEvent.click(btn);
  const copiarBtn = await screen.findByRole('button', { name: /copiar variables/i });
  fireEvent.click(copiarBtn);
  expect(copyVariablesFromPreviousPeriod).toHaveBeenCalled();
});

test('permite copiar fórmulas del periodo anterior', async () => {
  const copyFormulasFromPreviousPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-08"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={copyFormulasFromPreviousPeriod}
    />
  );
  const btn = screen.getByRole('button', { name: /fórmulas/i });
  fireEvent.click(btn);
  const copiarBtn = await screen.findByRole('button', { name: /copiar fórmulas/i });
  fireEvent.click(copiarBtn);
  expect(copyFormulasFromPreviousPeriod).toHaveBeenCalled();
});

test('no permite eliminar si solo hay un período', () => {
  const deletePeriod = jest.fn();
  render(
    <PeriodSelector
      periods={{ '2025-07': periods['2025-07'] }}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={deletePeriod}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  const btn = screen.getByRole('button', { name: /eliminar/i });
  expect(btn).toBeDisabled();
});

test('no permite copiar variables ni fórmulas si no hay otros períodos', () => {
  render(
    <PeriodSelector
      periods={{ '2025-07': periods['2025-07'] }}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  expect(screen.getByRole('button', { name: /variables/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /fórmulas/i })).toBeDisabled();
});