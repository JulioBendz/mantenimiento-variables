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

test('muestra mensaje si no hay fórmulas calculadas', () => {
  render(
    <FormulaHistory
      savedFormulas={[]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo 1"
      variables={{}}
    />
  );
  expect(screen.getByText(/No hay fórmulas calculadas/i)).toBeInTheDocument();
});

test('muestra mensaje si la búsqueda no encuentra fórmulas', () => {
  render(
    <FormulaHistory
      savedFormulas={[
        { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 }
      ]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo 1"
      variables={{ x: 1 }}
    />
  );
  fireEvent.change(screen.getByPlaceholderText(/Buscar fórmula/i), { target: { value: 'noexiste' } });
  expect(screen.getByText(/No se encontraron fórmulas/i)).toBeInTheDocument();
});

test('permite eliminar una fórmula del historial', async () => {
  const removeFormula = jest.fn();
  jest.spyOn(window, 'confirm').mockImplementation(() => true);

  render(
    <FormulaHistory
      savedFormulas={[
        { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 }
      ]}
      removeFormula={removeFormula}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo 1"
      variables={{ x: 1 }}
    />
  );

  // Hover para mostrar el menú contextual
  fireEvent.mouseOver(screen.getByText(/Fórmula 1/i));
  // Abre el menú contextual
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  // Click en "Eliminar" del menú contextual
  fireEvent.click(screen.getByText(/^Eliminar$/i));

  // Ahora aparece el panel de confirmación con el botón "Eliminar (1)"
  // Espera a que el botón esté en el DOM
  const eliminarConfirmBtn = await screen.findByText(/Eliminar \(1\)/i);
  fireEvent.click(eliminarConfirmBtn);

  // Espera a que se procese la llamada
  await new Promise(r => setTimeout(r, 0));
  expect(removeFormula).toHaveBeenCalledWith(1);

  window.confirm.mockRestore();
});

test('permite copiar una fórmula al portapapeles', () => {
  const writeText = jest.fn(() => Promise.resolve());
  Object.assign(navigator, { clipboard: { writeText } });
  window.alert = jest.fn();

  render(
    <FormulaHistory
      savedFormulas={[
        { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 }
      ]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo 1"
      variables={{ x: 1 }}
    />
  );
  fireEvent.mouseOver(screen.getByText(/Fórmula 1/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Copiar/i));
  expect(writeText).toHaveBeenCalled();
});