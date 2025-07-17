import { render, screen } from '@testing-library/react';
import FormulaItem from '../components/FormulaItem';

const formulaEntry = {
  id: 1,
  name: 'Fórmula 1',
  originalFormula: 'x+1',
  result: 2
};

test('muestra el nombre y resultado de la fórmula', () => {
  render(
    <FormulaItem
      formulaEntry={formulaEntry}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
    />
  );
  expect(screen.getByText(/Fórmula 1/i)).toBeInTheDocument();
  expect(screen.getByText(/x\+1/i)).toBeInTheDocument();
  expect(screen.getAllByText(/2/).length).toBeGreaterThan(0);
  expect(screen.getByText(/Variables utilizadas: x/i)).toBeInTheDocument();
});