import { render, screen, fireEvent } from '@testing-library/react';
import FormulaItem from '../components/FormulaItem';
import Variables from '../components/Variables';

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

test('no permite agregar variable si el nombre está vacío', () => {
  const addVariable = jest.fn();
  render(
    <Variables
      variables={{}}
      addVariable={addVariable}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName=""
      variableValue="10"
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  const btn = screen.getByText(/Agregar Variable/i);
  expect(btn).toBeDisabled();
});

test('no permite agregar variable si el valor está vacío', () => {
  const addVariable = jest.fn();
  render(
    <Variables
      variables={{}}
      addVariable={addVariable}
      setVariableName={() => {}}
      setVariableValue={() => {}}
      variableName="x"
      variableValue=""
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  const btn = screen.getByText(/Agregar Variable/i);
  expect(btn).toBeDisabled();
});

test('permite cancelar la edición de una variable', () => {
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
  fireEvent.click(screen.getByTitle(/Cancelar edición/i));
  // Espera que el input de edición ya no esté en el documento
  expect(screen.queryByDisplayValue('10')).not.toBeInTheDocument();
});

test('no elimina variable si el usuario cancela la confirmación', () => {
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
  // El panel de selección múltiple aparece, simula eliminar
  fireEvent.click(screen.getByText(/Eliminar \(1\)/i));
  expect(removeVariable).not.toHaveBeenCalled();
});

test('no elimina variables si ninguna está seleccionada en modo múltiple', () => {
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
  // Activa modo selección múltiple
  fireEvent.mouseEnter(screen.getByText(/x = 10/i));
  fireEvent.click(screen.getByTitle(/Más opciones/i));
  fireEvent.click(screen.getByText(/Eliminar/i));
  // Busca el botón de eliminar y verifica que está deshabilitado o no existe
  const eliminarBtns = screen.queryAllByRole('button', { name: /eliminar/i });
  // Busca el que tenga el texto "Eliminar (0)" o similar
  const eliminarCero = eliminarBtns.find(btn => btn.textContent.match(/Eliminar\s*\(0\)/i));
  expect(eliminarCero).toBeUndefined();
  expect(removeVariable).not.toHaveBeenCalled();
});

test('permite editar el nombre de la fórmula', () => {
  const startEditing = jest.fn();
  const saveEdit = jest.fn();
  const cancelEdit = jest.fn();
  render(
    <FormulaItem
      formulaEntry={{ ...formulaEntry, id: 2 }}
      editingId={2}
      editingName="Nuevo nombre"
      startEditing={startEditing}
      saveEdit={saveEdit}
      cancelEdit={cancelEdit}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
    />
  );
  // Cambia el nombre
  const input = screen.getByDisplayValue('Nuevo nombre');
  fireEvent.change(input, { target: { value: 'Editado' } });
  // Guarda
  fireEvent.click(screen.getByText('✓'));
  expect(saveEdit).toHaveBeenCalledWith(2);
  // Cancela
  fireEvent.click(screen.getByTitle(/Cancelar edición/i));
  expect(cancelEdit).toHaveBeenCalled();
});

test('muestra menú contextual y permite eliminar fórmula', () => {
  const startDirectDeletion = jest.fn();
  const setShowDropdown = jest.fn();
  render(
    <FormulaItem
      formulaEntry={{ ...formulaEntry, id: 3 }}
      hoveredItem={3}
      showDropdown={3}
      setShowDropdown={setShowDropdown}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
      startDirectDeletion={startDirectDeletion}
    />
  );
  // El botón eliminar debe estar visible
  fireEvent.click(screen.getByText(/Eliminar/i));
  expect(startDirectDeletion).toHaveBeenCalledWith(3);
});