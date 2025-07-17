import { render, screen, fireEvent } from '@testing-library/react';
import Calculator from '../components/Calculator';

test('renderiza el título y el textarea de fórmula', () => {
  render(
    <Calculator
      formula=""
      setFormula={() => {}}
      formulaName=""
      setFormulaName={() => {}}
      calculateFormula={() => {}}
      result={null}
      variables={{}}
    />
  );
  expect(screen.getByText(/Calculadora de Fórmulas/i)).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText(
      /Ej: x \+ y \* 2, a\^2 \+ b\^2, \(velocidad \* tiempo\) \/ 2/i
    )
  ).toBeInTheDocument();
});

test('muestra el resultado cuando se calcula', () => {
  render(
    <Calculator
      formula="x+2"
      setFormula={() => {}}
      formulaName=""
      setFormulaName={() => {}}
      calculateFormula={() => {}}
      result={5}
      variables={{ x: 3 }}
    />
  );
  expect(screen.getByText(/Resultado:/i)).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument();
});

test('deshabilita el botón si no hay fórmula o variables', () => {
  render(
    <Calculator
      formula=""
      setFormula={() => {}}
      formulaName=""
      setFormulaName={() => {}}
      calculateFormula={() => {}}
      result={null}
      variables={{}}
    />
  );
  expect(screen.getByText(/Calcular y Guardar/i)).toBeDisabled();
});