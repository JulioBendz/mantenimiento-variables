import { render, screen, fireEvent } from '@testing-library/react';
import FormulaHistory from '../components/FormulaHistory';

const formulas = [
  { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 },
  { id: 2, name: 'Fórmula 2', originalFormula: 'y*2', result: 4 }
];

test('muestra el historial de fórmulas', () => {
  render(
    <FormulaHistory
      savedFormulas={formulas}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo 1"
      variables={{ x: 1, y: 2 }}
    />
  );
  expect(screen.getByText(/Historial de Fórmulas/i)).toBeInTheDocument();
  expect(screen.getByText(/Fórmula 1/i)).toBeInTheDocument();
  expect(screen.getByText(/Fórmula 2/i)).toBeInTheDocument();
});

test('permite buscar una fórmula', () => {
  render(
    <FormulaHistory
      savedFormulas={formulas}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo 1"
      variables={{ x: 1, y: 2 }}
    />
  );
  fireEvent.change(screen.getByPlaceholderText(/Buscar fórmula/i), { target: { value: 'Fórmula 2' } });
  expect(screen.getByText(/Fórmula 2/i)).toBeInTheDocument();
  expect(screen.queryByText(/Fórmula 1/i)).not.toBeInTheDocument();
});