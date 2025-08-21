import { render, screen, fireEvent } from '@testing-library/react';
import Variables from '../components/Variables';
import React from 'react';
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
  render(
    <Variables
      variables={{}}
      addVariable={addVariable}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName="x"
      variableValue="10"
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  const button = screen.getByText(/Agregar Variable/i);
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
  // Limpia la búsqueda
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
  // Debe mostrar la variable de la segunda página después de hacer clic en "Siguiente"
  fireEvent.click(screen.getByText(/Siguiente/i));
  expect(screen.getByText(/var12 = 12/i)).toBeInTheDocument();
});

test('permite eliminar variables seleccionadas en modo múltiple', () => {
  const removeVariable = jest.fn();
  window.confirm = jest.fn(() => true); // Simula confirmación

  // Crea varias variables
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

  // Simula activar modo selección y seleccionar ambas variables
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i)); // Activa modo selección
  fireEvent.click(screen.getByText(/Seleccionar todo/i));
  fireEvent.click(screen.getByText(/Eliminar \(2\)/i)); // Elimina seleccionadas

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

  // Espera que se haya llamado editVariable con el nombre duplicado y el valor original
  expect(editVariable).toHaveBeenCalledWith('x_copia', 10);
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