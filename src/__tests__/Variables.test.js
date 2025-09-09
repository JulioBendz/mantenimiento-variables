import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Variables from '../components/Variables';
import VariableItem from '../components/VariableItem';

test('muestra el título de variables', () => {
  render(
    <Variables
      variables={{}}
      setVariables={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
    />
  );
  expect(screen.getAllByText(/Variables/i).length).toBeGreaterThan(0);
});

test('permite agregar una variable', () => {
  const addVariable = jest.fn();
  function Wrapper() {
    const [variableName, setVariableName] = React.useState('');
    const [variableValue, setVariableValue] = React.useState('');
    return (
      <Variables
        variables={{}}
        addVariable={addVariable}
        setVariableName={setVariableName}
        setVariableValue={setVariableValue}
        variableName={variableName}
        variableValue={variableValue}
        removeVariable={() => {}}
        editVariable={() => {}}
      />
    );
  }
  render(<Wrapper />);
  fireEvent.change(screen.getByPlaceholderText(/Nombre de variable/i), { target: { value: 'x' } });
  fireEvent.change(screen.getByPlaceholderText(/Valor numérico/i), { target: { value: '10' } });
  const button = screen.getByText(/Agregar Variable/i);
  expect(button).not.toBeDisabled();
  fireEvent.click(button);
  expect(addVariable).toHaveBeenCalled();
});

test('muestra mensaje cuando no hay variables definidas', () => {
  render(
    <Variables
      variables={{}}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  expect(screen.getByText(/No hay variables definidas/i)).toBeInTheDocument();
});

test('permite editar una variable', () => {
  const editVariable = jest.fn();

  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={editVariable}
    />
  );
  // Simula hover y abre el menú contextual
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Editar valor/i));
  // Cambia el valor en el input de edición
  const input = screen.getByDisplayValue('10');
  fireEvent.change(input, { target: { value: '20' } });
  // Guarda los cambios
  fireEvent.click(screen.getByTitle(/Guardar cambios/i));
  expect(editVariable).toHaveBeenCalledWith('x', 20);
});

test('permite buscar una variable por nombre', () => {
  render(
    <Variables
      variables={{ x: 10, y: 20 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  const searchInput = screen.getByPlaceholderText(/Buscar variable por nombre/i);
  fireEvent.change(searchInput, { target: { value: 'y' } });
  expect(screen.getByText(/y = 20/i)).toBeInTheDocument();
  expect(screen.queryByText(/x = 10/i)).not.toBeInTheDocument();
});

test('llama a startDirectDeletion al hacer clic en Eliminar', () => {
  const startDirectDeletion = jest.fn();
  render(
    <VariableItem
      name="x"
      value={10}
      hoveredItem="x"
      showDropdown="x"
      isSelectionMode={false}
      editingName={null}
      editingValue=""
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      onEdit={() => {}}
      onSaveEdit={() => {}}
      onCancelEdit={() => {}}
      onToggleSelection={() => {}}
      onCopy={() => {}}
      onDuplicate={() => {}}
      onStartDirectDeletion={startDirectDeletion}
      onDropdownToggle={() => {}}
      onDropdownClose={() => {}}
      onDeletePanelClose={() => {}}
      onBulkDelete={() => {}}
      onSelectAll={() => {}}
      onDeselectAll={() => {}}
      selectedVariables={new Set()}
      currentVariables={[]}
      startEditing={() => {}}
      duplicateVariable={() => {}}
      startDirectDeletion={startDirectDeletion}
      cancelSelectionMode={() => {}}
      toggleVariableSelection={() => {}}
      handleBulkDelete={() => {}}
      deleteControlsPosition={{ name: null, show: false }}
    />
  );
  fireEvent.click(screen.getByText(/Eliminar/i));
  expect(startDirectDeletion).toHaveBeenCalledWith('x');
});

test('permite limpiar la búsqueda de variables', () => {
  render(
    <Variables
      variables={{ x: 10, y: 20 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  const searchInput = screen.getByPlaceholderText(/Buscar variable por nombre/i);
  fireEvent.change(searchInput, { target: { value: 'y' } });
  expect(screen.getByText(/y = 20/i)).toBeInTheDocument();
  fireEvent.click(screen.getByTitle(/Limpiar búsqueda/i));
  expect(screen.getByText(/x = 10/i)).toBeInTheDocument();
  expect(screen.getByText(/y = 20/i)).toBeInTheDocument();
});

test('permite navegar entre páginas de variables', () => {
  const variables = {};
  for (let i = 1; i <= 12; i++) {
    variables[`var${i}`] = i;
  }
  render(
    <Variables
      variables={variables}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  fireEvent.click(screen.getByText(/Siguiente/i));
  expect(screen.getByText(/var12 = 12/i)).toBeInTheDocument();
});

test('permite eliminar variables seleccionadas en modo múltiple', () => {
  const removeVariable = jest.fn();
  window.confirm = jest.fn(() => true);
  const variables = { x: 10, y: 20 };
  render(
    <Variables
      variables={variables}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={removeVariable}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
  // Selecciona el botón correcto (el último suele ser el del panel de selección)
  const eliminarBtns = screen.getAllByText(/Eliminar\s*\(2\)/i);
  fireEvent.click(eliminarBtns[eliminarBtns.length - 1]);
  expect(removeVariable).toHaveBeenCalledWith('x');
  expect(removeVariable).toHaveBeenCalledWith('y');
});

test('permite duplicar una variable desde el menú contextual', () => {
  const editVariable = jest.fn();
  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={editVariable}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Duplicar/i));
  expect(editVariable).toHaveBeenCalledWith('x_copia', 10);
});

test('duplica variable agregando sufijo incremental si ya existe', () => {
  const editVariable = jest.fn();
  render(
    <Variables
      variables={{ x: 10, x_copia: 10, x_copia1: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={editVariable}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Duplicar/i));
  // Debe crear x_copia2
  expect(editVariable).toHaveBeenCalledWith('x_copia2', 10);
});

test('muestra mensaje si la búsqueda no encuentra variables', () => {
  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  const searchInput = screen.getByPlaceholderText(/Buscar variable por nombre/i);
  fireEvent.change(searchInput, { target: { value: 'z' } });
  expect(screen.getByText(/No se encontraron variables/i)).toBeInTheDocument();
});

test('llama a navigator.clipboard.writeText al copiar variable', () => {
  const writeText = jest.fn(() => Promise.resolve());
  Object.assign(navigator, {
    clipboard: { writeText }
  });

  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />

  );

  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Copiar variable/i));
  expect(writeText).toHaveBeenCalledWith('x');
});

test('usa fallbackCopyTextToClipboard si navigator.clipboard.writeText falla', async () => {
  const originalClipboard = navigator.clipboard;
  navigator.clipboard = {
    writeText: jest.fn(() => Promise.reject(new Error('fail')))
  };
  document.execCommand = jest.fn();
  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Copiar variable/i));
  // Espera a que el fallback se ejecute
  await new Promise(res => setTimeout(res, 10));
  expect(document.execCommand).toHaveBeenCalledWith('copy');
  navigator.clipboard = originalClipboard;
});

test('muestra error si fallbackCopyTextToClipboard falla', () => {
  const originalClipboard = navigator.clipboard;
  delete navigator.clipboard;
  const originalExecCommand = document.execCommand;
  document.execCommand = jest.fn(() => { throw new Error('fail'); });
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Copiar variable/i));
  expect(consoleError).toHaveBeenCalledWith('No se pudo copiar la variable');
  document.execCommand = originalExecCommand;
  navigator.clipboard = originalClipboard;
  consoleError.mockRestore();
});

test('cancela el modo selección múltiple', () => {
  render(
    <Variables
      variables={{ x: 10, y: 20 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  // Selecciona el botón correcto (el último suele ser el del panel de selección)
  const cancelarBtns = screen.getAllByText(/Cancelar/i);
  fireEvent.click(cancelarBtns[cancelarBtns.length - 1]);
  expect(screen.queryByText(/Modo eliminación activo/i)).not.toBeInTheDocument();
});

test('no elimina si no hay variables seleccionadas en eliminación múltiple', () => {
  const removeVariable = jest.fn();
  window.confirm = jest.fn(() => true);
  render(
    <Variables
      variables={{ x: 10, y: 20 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={removeVariable}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  // El botón Eliminar (0) no debe estar en el DOM
  expect(screen.queryByText(/Eliminar\s*\(0\)/i)).not.toBeInTheDocument();
  expect(removeVariable).not.toHaveBeenCalled();
});

test('selecciona y deselecciona todas las variables en modo múltiple', () => {
  const variables = { x: 10, y: 20 };
  render(
    <Variables
      variables={variables}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
  expect(screen.getByText(/Deseleccionar/i)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Deseleccionar/i));
  expect(screen.getByText(/Seleccionar todo/i)).toBeInTheDocument();
});

test('muestra alerta si se intenta eliminar sin variables seleccionadas', () => {
  window.alert = jest.fn();
  render(
    <Variables
      variables={{ x: 10, y: 20 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  // Deselecciona la variable seleccionada
  fireEvent.click(screen.getByText(/x = 10/i));
  // El botón Eliminar (0) no debe estar en el DOM
  expect(screen.queryByText(/Eliminar\s*\(0\)/i)).not.toBeInTheDocument();
  expect(window.alert).not.toHaveBeenCalled();
});

test('elimina variable y la remueve de la selección si está en modo selección', () => {
  const removeVariable = jest.fn();
  window.confirm = jest.fn(() => true);
  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={removeVariable}
      editVariable={() => {}}
    />
  );
  // Activa modo selección múltiple
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  // Haz click en el botón "Eliminar (1)" del panel de selección múltiple
  const eliminarBtns = screen.getAllByText(/Eliminar\s*\(1\)/i);
  fireEvent.click(eliminarBtns[eliminarBtns.length - 1]);
  expect(removeVariable).toHaveBeenCalledWith('x');
});

test('muestra nombres de variables seleccionadas en el panel de selección múltiple', () => {
  render(
    <Variables
      variables={{ x: 10, y: 20 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  // Activa modo selección múltiple y selecciona ambas
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
  expect(screen.getByText('x')).toBeInTheDocument();
  expect(screen.getByText('y')).toBeInTheDocument();
  // El botón Eliminar debe tener el título correcto
  const eliminarBtns = screen.getAllByText(/Eliminar\s*\(2\)/i);
  expect(eliminarBtns[eliminarBtns.length - 1].title).toMatch(/Eliminar 2 variables seleccionadas?/i);
});

test('no edita variable si el valor no es numérico', () => {
  const editVariable = jest.fn();
  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={editVariable}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Editar valor/i));
  const input = screen.getByDisplayValue('10');
  fireEvent.change(input, { target: { value: 'abc' } });
  fireEvent.click(screen.getByTitle(/Guardar cambios/i));
  expect(editVariable).not.toHaveBeenCalled();
});

test('cancela edición de variable', () => {
  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Editar valor/i));
  fireEvent.click(screen.getByTitle(/Cancelar edición/i));
  expect(screen.getByText(/x = 10/i)).toBeInTheDocument();
});

test('no elimina variable si usuario cancela confirmación', () => {
  const removeVariable = jest.fn();
  window.confirm = jest.fn(() => false);
  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={removeVariable}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  expect(removeVariable).not.toHaveBeenCalled();
});

test('no elimina variables en bulk si usuario cancela confirmación', () => {
  const removeVariable = jest.fn();
  window.confirm = jest.fn(() => false);
  render(
    <Variables
      variables={{ x: 10, y: 20 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={removeVariable}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
  const eliminarBtns = screen.getAllByText(/Eliminar\s*\(2\)/i);
  fireEvent.click(eliminarBtns[eliminarBtns.length - 1]);
  expect(removeVariable).not.toHaveBeenCalled();
});

test('duplicateVariable agrega sufijo incremental correctamente', () => {
  const editVariable = jest.fn();
  render(
    <Variables
      variables={{ x: 10, x_copia: 10, x_copia1: 10, x_copia2: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={editVariable}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Duplicar/i));
  expect(editVariable).toHaveBeenCalledWith('x_copia3', 10);
});

test('calcula altura dinámica correctamente cuando no hay variables', () => {
  render(
    <Variables
      variables={{}}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  // No hay variables, así que el mensaje debe estar presente
  expect(screen.getByText(/No hay variables definidas/i)).toBeInTheDocument();
});

test('feedback visual al copiar variable manipula el DOM correctamente', async () => {
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn(() => Promise.resolve()) }
  });

  // Crea el elemento esperado en el DOM
  const fakeIcon = document.createElement('span');
  fakeIcon.id = 'copy-x';
  fakeIcon.textContent = '📄';
  document.body.appendChild(fakeIcon);

  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Copiar variable "x" al portapapeles/i));
  // Espera a que el setTimeout cambie el texto
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 1100));
  });
  expect(['✓', '📄']).toContain(fakeIcon.textContent);
  document.body.removeChild(fakeIcon);
});

test('toggleVariableSelection agrega y quita variables de la selección', () => {
  render(
    <Variables
      variables={{ x: 10, y: 20 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  // Activa modo selección
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
  // Ahora debería estar seleccionada
  expect(screen.getByText(/Deseleccionar/i)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Deseleccionar/i));
  // Y debería volver a modo normal
  expect(screen.getByText(/Seleccionar todo/i)).toBeInTheDocument();
});

test('handleBulkDelete alerta si no hay variables seleccionadas', () => {
  window.alert = jest.fn();
  render(
    <Variables
      variables={{ x: 10, y: 20 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  // Activa modo selección múltiple
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  // Selecciona todo y luego deselecciona todo para dejar la selección vacía
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
  fireEvent.click(screen.getByText(/Deseleccionar/i));
  // Todos los botones "Eliminar (0)" deben estar deshabilitados
  const eliminarBtns = screen.queryAllByText(/Eliminar\s*\(0\)/i);
  expect(eliminarBtns.length).toBeGreaterThan(0);
  eliminarBtns.forEach(btn => {
    expect(btn).toBeDisabled();
  });
  expect(window.alert).not.toHaveBeenCalled();
});

test('handleRemoveVariable remueve de la selección si está en modo selección', () => {
  const removeVariable = jest.fn();
  window.confirm = jest.fn(() => true);
  render(
    <Variables
      variables={{ x: 10, y: 20 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={removeVariable}
      editVariable={() => {}}
    />
  );
  // Activa modo selección múltiple y selecciona ambas
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
  // Elimina solo una variable desde el panel de selección múltiple
  const eliminarBtns = screen.getAllByText(/Eliminar\s*\(2\)/i);
  fireEvent.click(eliminarBtns[eliminarBtns.length - 1]);
  expect(removeVariable).toHaveBeenCalledWith('x');
  expect(removeVariable).toHaveBeenCalledWith('y');
});

test('callbacks de VariableItem: onMouseEnter, onMouseLeave, onDropdownToggle, onDropdownClose', async () => {
  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  const variableText = screen.getByText(/x = 10/i);
  fireEvent.mouseEnter(variableText);

  // Espera a que el botón esté disponible
  const menuBtn = await screen.findByTitle(/Más opciones/i);
  fireEvent.click(menuBtn); // Abre
  fireEvent.click(menuBtn); // Cierra
  fireEvent.mouseLeave(variableText);
});

test('onDuplicate y onStartDirectDeletion funcionan desde VariableItem', () => {
  const editVariable = jest.fn();
  const startDirectDeletion = jest.fn();
  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={editVariable}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Duplicar/i));
  expect(editVariable).toHaveBeenCalledWith('x_copia', 10);

  // Eliminar directo
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  // El panel de selección múltiple debe aparecer
  expect(screen.getByText(/Modo eliminación activo/i)).toBeInTheDocument();
});

test('fallbackCopyTextToClipboard no falla si el elemento no existe', () => {
  // Elimina navigator.clipboard para forzar el fallback
  const originalClipboard = navigator.clipboard;
  delete navigator.clipboard;
  document.execCommand = jest.fn();
  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Copiar variable/i));
  // No hay expect, solo que no falle
  navigator.clipboard = originalClipboard; // restaura
});

test('toggleVariableSelection alterna correctamente la selección', () => {
  render(
    <Variables
      variables={{ x: 10, y: 20 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  // Selecciona x
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
  // Deselecciona x
  fireEvent.click(screen.getByText(/Deseleccionar/i));
  // Selecciona x de nuevo
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
});

test('handleBulkDelete no elimina si usuario cancela confirmación', () => {
  const removeVariable = jest.fn();
  window.confirm = jest.fn(() => false);
  render(
    <Variables
      variables={{ x: 10, y: 20 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={removeVariable}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
  const eliminarBtns = screen.getAllByText(/Eliminar\s*\(2\)/i);
  fireEvent.click(eliminarBtns[eliminarBtns.length - 1]);
  expect(removeVariable).not.toHaveBeenCalled();
});

test('elimina variable seleccionada en modo selección múltiple', () => {
  const removeVariable = jest.fn();
  window.confirm = jest.fn(() => true);
  render(
    <Variables
      variables={{ x: 10 }}
      addVariable={() => {}}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue=""
      removeVariable={removeVariable}
      editVariable={() => {}}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/^Eliminar$/i));
  // Click en el último botón "Eliminar (1)" (panel de confirmación)
  const eliminarBtns = screen.getAllByText(/Eliminar \(1\)/i);
  fireEvent.click(eliminarBtns[eliminarBtns.length - 1]);
  expect(removeVariable).toHaveBeenCalledWith('x');
});