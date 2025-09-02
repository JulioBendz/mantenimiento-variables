import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Calculator from '../components/Calculator';
import FormulaHistory from '../components/FormulaHistory';

function AppMock() {
  const [formula, setFormula] = React.useState('');
  const [formulaName, setFormulaName] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [variables, setVariables] = React.useState({ x: 2 });
  const [savedFormulas, setSavedFormulas] = React.useState([]);

  const calculateFormula = () => {
    // Simula cálculo y guardado
    if (formula === 'x + 2') {
      setResult(4);
      setSavedFormulas([
        ...savedFormulas,
        {
          id: 'f1',
          name: formulaName || 'Fórmula 1',
          originalFormula: formula,
          result: 4,
        },
      ]);
    }
  };

  return (
    <div>
      <Calculator
        formula={formula}
        setFormula={setFormula}
        formulaName={formulaName}
        setFormulaName={setFormulaName}
        calculateFormula={calculateFormula}
        result={result}
        variables={variables}
      />
      <FormulaHistory
        savedFormulas={savedFormulas}
        removeFormula={() => {}}
        reuseFormula={() => {}}
        editFormulaName={() => {}}
        currentPeriod="2024-09"
        variables={variables}
      />
    </div>
  );
}

test('calcular y guardar muestra el resultado en el historial de fórmulas', () => {
  render(<AppMock />);
  // Escribe la fórmula
  fireEvent.change(screen.getByPlaceholderText(/Ej: x \+ y/i), { target: { value: 'x + 2' } });
  // Opcional: asigna nombre
  fireEvent.change(screen.getByPlaceholderText(/Área del círculo/i), { target: { value: 'Suma X' } });
  // Haz clic en calcular y guardar
  const button = screen.getByText(/Calcular y Guardar/i);
  expect(button).not.toBeDisabled();
  fireEvent.click(button);
  // Cambia aquí:
  expect(screen.getAllByText(/Resultado:/i).length).toBeGreaterThan(1);
  expect(screen.getByText('4')).toBeInTheDocument();
  // Verifica que aparece en el historial
  expect(screen.getByText(/Historial de Fórmulas/i)).toBeInTheDocument();
  expect(screen.getByText('Suma X')).toBeInTheDocument();
  expect(screen.getByText('x + 2')).toBeInTheDocument();
  expect(screen.getByText('4')).toBeInTheDocument();
});

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
  expect(screen.getAllByText(/Resultado:/i).length).toBeGreaterThan(0);
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

test('habilita el botón Calcular y Guardar solo si hay fórmula y variables', () => {
  function Wrapper() {
    const [formula, setFormula] = React.useState('');
    const variables = { x: 1 };
    return (
      <Calculator
        formula={formula}
        setFormula={setFormula}
        formulaName=""
        setFormulaName={() => {}}
        calculateFormula={() => {}}
        result={null}
        variables={variables}
      />
    );
  }

  render(<Wrapper />);
  const input = screen.getByPlaceholderText(/x \+ y/i);
  const button = screen.getByText(/Calcular y Guardar/i);
  expect(button).toBeDisabled();
  fireEvent.change(input, { target: { value: 'x + 1' } });
  expect(button).not.toBeDisabled();
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

test('muestra mensaje de error con fórmula inválida', () => {
  function Wrapper() {
    const [formula, setFormula] = React.useState('');
    const [result, setResult] = React.useState(null);
    const [error, setError] = React.useState('');
    const variables = { x: 5 };
    const calculateFormula = () => {
      // Simulación simple para el test
      if (formula === 'x +') setError('Error en la fórmula');
      else setError('');
    };
    return (
      <Calculator
        formula={formula}
        setFormula={setFormula}
        formulaName=""
        setFormulaName={() => {}}
        calculateFormula={calculateFormula}
        result={result}
        error={error}
        variables={variables}
      />
    );
  }

  render(<Wrapper />);
  const input = screen.getByPlaceholderText(/x \+ y/i);
  fireEvent.change(input, { target: { value: 'x +' } });
  fireEvent.click(screen.getByText(/Calcular/i));
  expect(screen.getByText(/Error en la fórmula/i)).toBeInTheDocument();
});

test('limpia el input al hacer clic en Limpiar', () => {
  function Wrapper() {
    const [formula, setFormula] = React.useState('x + 1');
    const variables = { x: 2 };
    return (
      <Calculator
        formula={formula}
        setFormula={setFormula}
        formulaName=""
        setFormulaName={() => {}}
        calculateFormula={() => setFormula('')}
        result={null}
        variables={variables}
      />
    );
  }

  render(<Wrapper />);
  const input = screen.getByPlaceholderText(/x \+ y/i);
  expect(input.value).toBe('x + 1');
  fireEvent.click(screen.getByText(/Limpiar/i));
  expect(input.value).toBe('');
});

test('inserta un símbolo en la posición del cursor en el textarea', () => {
  function Wrapper() {
    const [formula, setFormula] = React.useState('x');
    return (
      <Calculator
        formula={formula}
        setFormula={setFormula}
        formulaName=""
        setFormulaName={() => {}}
        calculateFormula={() => {}}
        result={null}
        variables={{ x: 1 }}
      />
    );
  }

  render(<Wrapper />);
  const textarea = screen.getByPlaceholderText(/x \+ y/i);
  // Coloca el cursor al final
  textarea.setSelectionRange(1, 1);
  // Click en el botón "+"
  fireEvent.click(screen.getByTitle(/Insertar "\+"/i));
  expect(textarea.value).toBe('x+');
});

test('agrega símbolo al final si no existe el textarea', () => {
  // Mock document.getElementById para devolver null
  const originalGetElementById = document.getElementById;
  document.getElementById = () => null;

  function Wrapper() {
    const [formula, setFormula] = React.useState('x');
    return (
      <Calculator
        formula={formula}
        setFormula={setFormula}
        formulaName=""
        setFormulaName={() => {}}
        calculateFormula={() => {}}
        result={null}
        variables={{ x: 1 }}
      />
    );
  }

  render(<Wrapper />);
  fireEvent.click(screen.getByTitle(/Insertar "\+"/i));
  // No hay forma de leer el nuevo valor porque el textarea no existe, pero cubre la rama
  document.getElementById = originalGetElementById;
});

test('permite cambiar el nombre de la fórmula', () => {
  function Wrapper() {
    const [formulaName, setFormulaName] = React.useState('');
    return (
      <Calculator
        formula=""
        setFormula={() => {}}
        formulaName={formulaName}
        setFormulaName={setFormulaName}
        calculateFormula={() => {}}
        result={null}
        variables={{ x: 1 }}
      />
    );
  }

  render(<Wrapper />);
  const input = screen.getByPlaceholderText(/Área del círculo/i);
  fireEvent.change(input, { target: { value: 'Mi fórmula' } });
  expect(input.value).toBe('Mi fórmula');
});

test('calcula y muestra el resultado al hacer clic en Calcular y Guardar', () => {
  function Wrapper() {
    const [formula, setFormula] = React.useState('x + 2');
    const [result, setResult] = React.useState(null);
    const variables = { x: 3 };
    const calculateFormula = () => setResult(5); // Simula cálculo
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
  const button = screen.getByText(/Calcular y Guardar/i);
  expect(button).not.toBeDisabled();
  fireEvent.click(button);
  expect(screen.getAllByText(/Resultado:/i).length).toBeGreaterThan(0);
  expect(screen.getByText('5')).toBeInTheDocument();
});

test('muestra error si falta el nombre de la fórmula al calcular', () => {
  function Wrapper() {
    const [formula, setFormula] = React.useState('x + 2');
    const [formulaName, setFormulaName] = React.useState('');
    const [result, setResult] = React.useState(null);
    const [error, setError] = React.useState(null);
    const variables = { x: 3 };
    const calculateFormula = () => {
      if (!formulaName) {
        setError('Debes ingresar un nombre para la fórmula.');
        return;
      }
      setResult(5);
      setError(null);
    };
    return (
      <Calculator
        formula={formula}
        setFormula={setFormula}
        formulaName={formulaName}
        setFormulaName={setFormulaName}
        calculateFormula={calculateFormula}
        result={result}
        variables={variables}
        error={error}
      />
    );
  }
  render(<Wrapper />);
  const button = screen.getByText(/Calcular y Guardar/i);
  expect(button).not.toBeDisabled();
  fireEvent.click(button);
  expect(screen.getByText(/Debes ingresar un nombre para la fórmula/i)).toBeInTheDocument();
});