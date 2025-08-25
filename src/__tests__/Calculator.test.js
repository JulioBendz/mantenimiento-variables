import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
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

test('muestra el resultado de una fórmula válida', () => {
  // Simula el estado y la función de cálculo
  function Wrapper() {
    const [formula, setFormula] = React.useState('');
    const [result, setResult] = React.useState(null);
    const variables = { x: 5, y: 2 };
    const calculateFormula = () => {
      // Simulación simple para el test
      if (formula === 'x + y') setResult(7);
    };
    return (
      <Calculator
        formula={formula}
        setFormula={setFormula}
        formulaName=""
        setFormulaName={() => {}}
        calculateFormula={calculateFormula}
        result={result}
        variables={variables}
      />
    );
  }

  render(<Wrapper />);
  const input = screen.getByPlaceholderText(/Ej: x \+ y \* 2, a\^2 \+ b\^2, \(velocidad \* tiempo\) \/ 2/i);
  fireEvent.change(input, { target: { value: 'x + y' } });
  fireEvent.click(screen.getByText(/Calcular/i));
  expect(screen.getByText(/Resultado/i)).toBeInTheDocument();
  expect(screen.getByText('7')).toBeInTheDocument();
});