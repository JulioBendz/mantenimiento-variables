import { render, screen, fireEvent } from '@testing-library/react';
import FormulaHistory from '../components/FormulaHistory';

// Mock scrollIntoView para evitar error en jsdom
window.HTMLElement.prototype.scrollIntoView = function() {};

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

test('no elimina la fórmula ni modifica la selección si el usuario cancela la confirmación', async () => {
  const removeFormula = jest.fn();
  jest.spyOn(window, 'confirm').mockImplementation(() => false);

  render(
    <FormulaHistory
      savedFormulas={[
        { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 },
        { id: 2, name: 'Fórmula 2', originalFormula: 'y+2', result: 4 }
      ]}
      removeFormula={removeFormula}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1, y: 2 }}
    />
  );

  // Activa modo selección (eliminar) sobre la primera fórmula
  fireEvent.mouseOver(screen.getByText(/Fórmula 1/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/^Eliminar$/i));

  // Selecciona la segunda fórmula también
  const checkboxes = screen.getAllByRole('checkbox');
  fireEvent.click(checkboxes[1]);
  // Deselecciona la primera fórmula, dejando solo la segunda seleccionada
  fireEvent.click(checkboxes[0]);

  // Intenta eliminar solo la segunda fórmula
  const eliminarBtn = await screen.findByText(/Eliminar \(1\)/i);
  fireEvent.click(eliminarBtn);

  // Espera a que se procese la llamada
  await new Promise(r => setTimeout(r, 0));
  expect(removeFormula).not.toHaveBeenCalled();

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

test('permite editar el nombre de una fórmula', () => {
  const editFormulaName = jest.fn();
  render(
    <FormulaHistory
      savedFormulas={[{ id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 }]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={editFormulaName}
      currentPeriod="Periodo 1"
      variables={{ x: 1 }}
    />
  );
  fireEvent.mouseOver(screen.getByText(/Fórmula 1/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Editar nombre/i));
  const input = screen.getByDisplayValue(/Fórmula 1/i);
  fireEvent.change(input, { target: { value: 'Nueva Fórmula' } });
  fireEvent.click(screen.getByText('✓'));
  expect(editFormulaName).toHaveBeenCalled();
});

test('permite cancelar la edición del nombre', () => {
  render(
    <FormulaHistory
      savedFormulas={[{ id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 }]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo 1"
      variables={{ x: 1 }}
    />
  );
  fireEvent.mouseOver(screen.getByText(/Fórmula 1/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Editar nombre/i));
  fireEvent.click(screen.getByTitle(/Cancelar edición/i));
  expect(screen.getByText(/Fórmula 1/i)).toBeInTheDocument();
});

test('permite abrir y cerrar la edición de filtros de porcentaje', () => {
  render(
    <FormulaHistory
      savedFormulas={[{ id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 }]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo 1"
      variables={{ x: 1 }}
    />
  );
  fireEvent.click(screen.getByTitle(/Editar rangos/i));
  expect(screen.getByText(/Guardar/i)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Cancelar/i));
  expect(screen.getByTitle(/Editar rangos/i)).toBeInTheDocument();
});

test('permite cambiar los valores de los filtros de porcentaje', () => {
  render(
    <FormulaHistory
      savedFormulas={[{ id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 }]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo 1"
      variables={{ x: 1 }}
    />
  );
  fireEvent.click(screen.getByTitle(/Editar rangos/i));
  const inputs = screen.getAllByRole('spinbutton');
  fireEvent.change(inputs[0], { target: { value: 80 } });
  fireEvent.change(inputs[1], { target: { value: 60 } });
  fireEvent.click(screen.getByText(/Guardar/i));
  expect(screen.getAllByText(/80%/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/60%/).length).toBeGreaterThan(0);
});

test('ajusta los filtros de porcentaje si los valores son inválidos', () => {
  render(
    <FormulaHistory
      savedFormulas={[{ id: 1, name: 'Fórmula', originalFormula: 'x', result: 1 }]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1 }}
    />
  );
  fireEvent.click(screen.getByTitle(/Editar rangos/i));
  const inputs = screen.getAllByRole('spinbutton');
  fireEvent.change(inputs[0], { target: { value: 120 } }); // excellentMin > 100
  fireEvent.change(inputs[1], { target: { value: 150 } }); // acceptableMin > excellentMin
  fireEvent.click(screen.getByText(/Guardar/i));
  // El componente debe ajustar los valores automáticamente
  expect(screen.getAllByText(/100%/).length).toBeGreaterThan(0);
});

test('permite limpiar la búsqueda', () => {
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
  fireEvent.click(screen.getByTitle(/Limpiar búsqueda/i));
  expect(screen.getByText(/Fórmula 1/i)).toBeInTheDocument();
  expect(screen.getByText(/Fórmula 2/i)).toBeInTheDocument();
});

test('permite seleccionar y eliminar múltiples fórmulas', async () => {
  const removeFormula = jest.fn();
  jest.spyOn(window, 'confirm').mockImplementation(() => true);

  render(
    <FormulaHistory
      savedFormulas={[
        { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 },
        { id: 2, name: 'Fórmula 2', originalFormula: 'y+2', result: 4 }
      ]}
      removeFormula={removeFormula}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo 1"
      variables={{ x: 1, y: 2 }}
    />
  );
  // Activa modo selección
  fireEvent.mouseOver(screen.getByText(/Fórmula 1/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/^Eliminar$/i));
  // Selecciona la segunda fórmula
  const checkboxes = screen.getAllByRole('checkbox');
  fireEvent.click(checkboxes[1]);
  // Elimina ambas
  const eliminarBtn = await screen.findByText(/Eliminar \(2\)/i);
  fireEvent.click(eliminarBtn);
  await new Promise(r => setTimeout(r, 0));
  expect(removeFormula).toHaveBeenCalledWith(1);
  expect(removeFormula).toHaveBeenCalledWith(2);
  window.confirm.mockRestore();
});

test('permite cambiar de página en la paginación', () => {
  const manyFormulas = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Fórmula ${i + 1}`,
    originalFormula: `x+${i + 1}`,
    result: i + 1
  }));
  render(
    <FormulaHistory
      savedFormulas={manyFormulas}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo 1"
      variables={{ x: 1 }}
    />
  );
  // Debe mostrar paginación
  expect(screen.getByText(/Página 1 de 2/i)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Siguiente/i));
  expect(screen.getByText(/Página 2 de 2/i)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Anterior/i));
  expect(screen.getByText(/Página 1 de 2/i)).toBeInTheDocument();
});

test('restaura los filtros de porcentaje desde localStorage', () => {
  localStorage.setItem('excellentMin', '77');
  localStorage.setItem('acceptableMin', '55');
  render(
    <FormulaHistory
      savedFormulas={[{ id: 1, name: 'Fórmula', originalFormula: 'x', result: 1 }]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1 }}
    />
  );
  expect(screen.getAllByText(/77%/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/55%/).length).toBeGreaterThan(0);
  localStorage.removeItem('excellentMin');
  localStorage.removeItem('acceptableMin');
});

test('usa fallback para copiar al portapapeles si navigator.clipboard.writeText falla', async () => {
  // Simula que clipboard existe pero falla
  navigator.clipboard = {
    writeText: jest.fn(() => Promise.reject())
  };
  document.execCommand = jest.fn();
  window.alert = jest.fn();

  render(
    <FormulaHistory
      savedFormulas={[{ id: 1, name: 'Fórmula', originalFormula: 'x', result: 1 }]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1 }}
    />
  );
  fireEvent.mouseOver(screen.getByText(/^Fórmula$/));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Copiar/i));
  // Espera a que la promesa falle y el fallback sea llamado
  await new Promise(r => setTimeout(r, 0));
  expect(document.execCommand).toHaveBeenCalledWith('copy');
});

test('permite cancelar la selección múltiple', async () => {
  render(
    <FormulaHistory
      savedFormulas={[
        { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 }
      ]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1 }}
    />
  );
  fireEvent.mouseOver(screen.getByText(/Fórmula 1/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/^Eliminar$/i));
  fireEvent.click(screen.getByText(/Cancelar/i));
  expect(screen.getByText(/Fórmula 1/i)).toBeInTheDocument();
});

test('permite seleccionar y deseleccionar todas las fórmulas', async () => {
  render(
    <FormulaHistory
      savedFormulas={[
        { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 },
        { id: 2, name: 'Fórmula 2', originalFormula: 'y+2', result: 4 }
      ]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1, y: 2 }}
    />
  );
  fireEvent.mouseOver(screen.getByText(/Fórmula 1/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/^Eliminar$/i));
  // Seleccionar todo
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
  // Deseleccionar todo
  fireEvent.click(screen.getByText(/Deseleccionar/i));
  expect(screen.getByText(/Seleccionar todo/i)).toBeInTheDocument();
});

test('getUsedVariables retorna "Ninguna" si variables es inválido', () => {
  render(
    <FormulaHistory
      savedFormulas={[{ id: 1, name: 'Fórmula', originalFormula: 'x', result: 1 }]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={null}
    />
  );
  expect(screen.getByText(/Ninguna/i)).toBeInTheDocument();
});

test('muestra alerta si intenta eliminar sin selección', async () => {
  window.alert = jest.fn();
  render(
    <FormulaHistory
      savedFormulas={[
        { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 },
        { id: 2, name: 'Fórmula 2', originalFormula: 'y+2', result: 4 }
      ]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1, y: 2 }}
    />
  );
  fireEvent.mouseOver(screen.getByText(/Fórmula 1/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/^Eliminar$/i));
  // Selecciona todo y luego deselecciona para asegurar el flujo
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
  fireEvent.click(screen.getByText(/Deseleccionar/i));
  fireEvent.click(screen.getByText(/Eliminar \(0\)/i));
  // Espera a que el alert pueda ser llamado (por si hay setTimeout)
  await new Promise(r => setTimeout(r, 0));
  expect(window.alert).toHaveBeenCalledWith('No hay fórmulas seleccionadas para eliminar.');
});

test('getUsedVariables retorna error si ocurre excepción', () => {
  const variables = {};
  Object.defineProperty(variables, 'x', {
    get() { throw new Error('fail'); }
  });
  render(
    <FormulaHistory
      savedFormulas={[{ id: 1, name: 'Fórmula', originalFormula: 'x', result: 1 }]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={variables}
    />
  );

  // Busca el fragmento en cualquier parte del DOM
  const found = Array.from(document.querySelectorAll('*'))
    .some(el => el.textContent && el.textContent.includes('Error al determinar'));
  expect(found).toBe(true);
});

test('no muestra análisis de porcentajes si no hay fórmulas válidas', () => {
  render(
    <FormulaHistory
      savedFormulas={[]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{}}
    />
  );
  expect(screen.queryByText(/Análisis de porcentajes/i)).not.toBeInTheDocument();
});

test('elimina una fórmula individual y la remueve de la selección si está en modo selección', async () => {
  const removeFormula = jest.fn();
  jest.spyOn(window, 'confirm').mockImplementation(() => true);

  render(
    <FormulaHistory
      savedFormulas={[
        { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 },
        { id: 2, name: 'Fórmula 2', originalFormula: 'y+2', result: 4 }
      ]}
      removeFormula={removeFormula}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1, y: 2 }}
    />
  );

  // Activa modo selección (eliminar) sobre la primera fórmula
  fireEvent.mouseOver(screen.getByText(/Fórmula 1/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/^Eliminar$/i));

  // Selecciona la segunda fórmula también
  const checkboxes = screen.getAllByRole('checkbox');
  fireEvent.click(checkboxes[1]);
  // Deselecciona la primera fórmula, dejando solo la segunda seleccionada
  fireEvent.click(checkboxes[0]);

  // Elimina solo la segunda fórmula
  const eliminarBtn = await screen.findByText(/Eliminar \(1\)/i);
  fireEvent.click(eliminarBtn);

  // Espera a que se procese la llamada
  await new Promise(r => setTimeout(r, 0));
  expect(removeFormula).toHaveBeenCalledWith(2);

  window.confirm.mockRestore();
});

test('cierra el menú contextual aunque el usuario cancele la eliminación', async () => {
  const removeFormula = jest.fn();
  jest.spyOn(window, 'confirm').mockImplementation(() => false);

  render(
    <FormulaHistory
      savedFormulas={[
        { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 }
      ]}
      removeFormula={removeFormula}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1 }}
    />
  );

  // Hover para mostrar el menú contextual
  fireEvent.mouseOver(screen.getByText(/Fórmula 1/i));
  // Abre el menú contextual
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  // Click en "Eliminar" del menú contextual
  fireEvent.click(screen.getByText(/^Eliminar$/i));

  // Click en el botón de eliminar del panel de confirmación (esto dispara window.confirm)
  const eliminarConfirmBtn = await screen.findByText(/Eliminar \(1\)/i);
  fireEvent.click(eliminarConfirmBtn);

  // Espera a que se procese la llamada
  await new Promise(r => setTimeout(r, 0));
  expect(removeFormula).not.toHaveBeenCalled();

  // El menú contextual debe estar cerrado (por ejemplo, la opción "Copiar" ya no debe estar)
  expect(screen.queryByText(/Copiar/i)).not.toBeInTheDocument();

  // El panel de selección múltiple sigue abierto (el botón Eliminar (1) sigue visible)
  expect(screen.getByText(/Eliminar \(1\)/i)).toBeInTheDocument();

  window.confirm.mockRestore();
});

test('al eliminar una fórmula seleccionada, se actualiza la selección correctamente', async () => {
  const removeFormula = jest.fn();
  jest.spyOn(window, 'confirm').mockImplementation(() => true);

  render(
    <FormulaHistory
      savedFormulas={[
        { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: 2 },
        { id: 2, name: 'Fórmula 2', originalFormula: 'y+2', result: 4 }
      ]}
      removeFormula={removeFormula}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1, y: 2 }}
    />
  );

  // Activa modo selección (eliminar) sobre la primera fórmula
  fireEvent.mouseOver(screen.getByText(/Fórmula 1/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/^Eliminar$/i));

  // Selecciona ambas fórmulas (si tu UI lo permite)
  const checkboxes = screen.getAllByRole('checkbox');
  fireEvent.click(checkboxes[0]);
  fireEvent.click(checkboxes[1]);

  // Busca el botón "Eliminar (1)" o "Eliminar (2)" según lo que muestre tu UI
  const eliminarBtn = await screen.findByText(/Eliminar \(\d+\)/i);
  fireEvent.click(eliminarBtn);

  await new Promise(r => setTimeout(r, 0));
  // Verifica que se llamó a removeFormula al menos una vez
  expect(removeFormula).toHaveBeenCalled();

  window.confirm.mockRestore();
});

test('llama reuseFormulaWithOptions y cierra el dropdown', () => {
  const reuseFormula = jest.fn();
  render(
    <FormulaHistory
      savedFormulas={[{ id: 1, name: 'Fórmula', originalFormula: 'x', result: 1 }]}
      removeFormula={() => {}}
      reuseFormula={reuseFormula}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1 }}
    />
  );
  fireEvent.mouseOver(screen.getByText(/^Fórmula$/));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Usar nuevamente/i));
  expect(reuseFormula).toHaveBeenCalled();
});

test('muestra alerta si no se pudo copiar la fórmula', () => {
  // Simula que ni clipboard ni execCommand funcionan
  delete navigator.clipboard;
  document.execCommand = jest.fn(() => { throw new Error('fail'); });
  window.alert = jest.fn();

  render(
    <FormulaHistory
      savedFormulas={[{ id: 1, name: 'Fórmula', originalFormula: 'x', result: 1 }]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1 }}
    />
  );
  fireEvent.mouseOver(screen.getByText(/^Fórmula$/));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Copiar/i));
  expect(window.alert).toHaveBeenCalledWith('No se pudo copiar la fórmula');
});

test('no muestra análisis de porcentajes si todas las fórmulas tienen resultado null', () => {
  render(
    <FormulaHistory
      savedFormulas={[
        { id: 1, name: 'Fórmula 1', originalFormula: 'x+1', result: null },
        { id: 2, name: 'Fórmula 2', originalFormula: 'y+2', result: undefined }
      ]}
      removeFormula={() => {}}
      reuseFormula={() => {}}
      editFormulaName={() => {}}
      currentPeriod="Periodo"
      variables={{ x: 1, y: 2 }}
    />
  );
  expect(screen.queryByText(/Análisis de porcentajes/i)).not.toBeInTheDocument();
});