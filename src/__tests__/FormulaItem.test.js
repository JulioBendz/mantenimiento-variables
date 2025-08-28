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

test('guarda edición al presionar Enter en el input', () => {
  const saveEdit = jest.fn();
  render(
    <FormulaItem
      formulaEntry={{ ...formulaEntry, id: 2 }}
      editingId={2}
      editingName="Nuevo nombre"
      startEditing={jest.fn()}
      saveEdit={saveEdit}
      cancelEdit={jest.fn()}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
    />
  );
  const input = screen.getByDisplayValue('Nuevo nombre');
  fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
  expect(saveEdit).toHaveBeenCalledWith(2);
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

test('muestra "Fórmula sin nombre" si no hay nombre', () => {
  render(
    <FormulaItem
      formulaEntry={{ ...formulaEntry, name: '' }}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
    />
  );
  expect(screen.getByText(/Fórmula sin nombre/i)).toBeInTheDocument();
});

test('muestra "No definida" si no hay originalFormula', () => {
  render(
    <FormulaItem
      formulaEntry={{ ...formulaEntry, originalFormula: '' }}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
    />
  );
  expect(screen.getByText(/No definida/i)).toBeInTheDocument();
});

test('muestra "Pendiente de cálculo" si no hay evaluatedFormula', () => {
  render(
    <FormulaItem
      formulaEntry={{ ...formulaEntry, evaluatedFormula: '' }}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
    />
  );
  expect(screen.getByText(/Pendiente de cálculo/i)).toBeInTheDocument();
});

test('muestra "Pendiente" si el resultado es null', () => {
  render(
    <FormulaItem
      formulaEntry={{ ...formulaEntry, result: null }}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
    />
  );
  // Busca el contenedor de resultado
  const resultadoLabel = screen.getByText(/Resultado:/i);
  // Busca el texto "Pendiente" dentro del mismo contenedor
  expect(resultadoLabel.parentElement).toHaveTextContent(/Pendiente/i);
});

test('muestra fecha y hora por defecto si no existen', () => {
  render(
    <FormulaItem
      formulaEntry={{ ...formulaEntry, date: undefined, timestamp: undefined }}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
    />
  );
  expect(screen.getByText(/Sin fecha/i)).toBeInTheDocument();
  expect(screen.getByText(/Sin hora/i)).toBeInTheDocument();
});

test('muestra última actualización si existe', () => {
  render(
    <FormulaItem
      formulaEntry={{ ...formulaEntry, lastRecalculated: '2025-08-28' }}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
    />
  );
  expect(screen.getByText(/Última actualización/i)).toBeInTheDocument();
});

test('checkbox aparece solo en modo selección', () => {
  render(
    <FormulaItem
      formulaEntry={formulaEntry}
      isSelectionMode={true}
      selectedFormulas={new Set()}
      toggleFormulaSelection={jest.fn()}
      getUsedVariables={() => 'x'}
      deleteControlsPosition={{ id: -1, show: false }}
      deleteControlsRef={{ current: null }}
    />
  );
  expect(screen.getByRole('checkbox')).toBeInTheDocument();
});

test('panel de controles de eliminación aparece en modo selección', () => {
  render(
    <FormulaItem
      formulaEntry={formulaEntry}
      isSelectionMode={true}
      deleteControlsPosition={{ id: 1, show: true }}
      deleteControlsRef={{ current: null }}
      selectedFormulas={new Set([1])}
      getUsedVariables={() => 'x'}
      currentFormulas={[formulaEntry]}
      selectAllFormulas={jest.fn()}
      deselectAllFormulas={jest.fn()}
      handleBulkDelete={jest.fn()}
      cancelSelectionMode={jest.fn()}
    />
  );
  expect(screen.getByText(/Modo eliminación activo/i)).toBeInTheDocument();
  expect(screen.getByText(/Eliminar \(1\)/i)).toBeInTheDocument();
});

test('llama a setHoveredItem(null) al hacer mouse leave', () => {
  const setHoveredItem = jest.fn();
  render(
    <FormulaItem
      formulaEntry={formulaEntry}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
      setHoveredItem={setHoveredItem}
    />
  );
  fireEvent.mouseEnter(screen.getByText(/Fórmula 1/i));
  fireEvent.mouseLeave(screen.getByText(/Fórmula 1/i));
  expect(setHoveredItem).toHaveBeenCalledWith(null);
});

test('llama a reuseFormulaWithOptions al hacer click en "Usar nuevamente"', () => {
  const reuseFormulaWithOptions = jest.fn();
  const setShowDropdown = jest.fn();
  render(
    <FormulaItem
      formulaEntry={{ ...formulaEntry, id: 3 }}
      hoveredItem={3}
      showDropdown={3}
      setShowDropdown={setShowDropdown}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
      reuseFormulaWithOptions={reuseFormulaWithOptions}
    />
  );
  fireEvent.click(screen.getByText(/Usar nuevamente/i));
  expect(reuseFormulaWithOptions).toHaveBeenCalledWith(expect.objectContaining({ id: 3 }));
});

test('al hacer click en el menú contextual alterna el valor de showDropdown', () => {
  const setShowDropdown = jest.fn();
  const utils = render(
    <FormulaItem
      formulaEntry={{ id: 5, name: 'Fórmula 5', originalFormula: 'x+1', result: 2 }}
      hoveredItem={5}
      showDropdown={null}
      setShowDropdown={setShowDropdown}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
    />
  );
  // Primer click: abre el menú
  const menuButtons = screen.getAllByTitle(/Más opciones/i);
  fireEvent.click(menuButtons[0]);
  expect(setShowDropdown).toHaveBeenCalledWith(5);

  // Simula el cambio de estado: showDropdown ahora es 5
  setShowDropdown.mockClear();
  utils.rerender(
    <FormulaItem
      formulaEntry={{ id: 5, name: 'Fórmula 5', originalFormula: 'x+1', result: 2 }}
      hoveredItem={5}
      showDropdown={5}
      setShowDropdown={setShowDropdown}
      selectedFormulas={new Set()}
      getUsedVariables={() => 'x'}
    />
  );
  const menuButtons2 = screen.getAllByTitle(/Más opciones/i);
  fireEvent.click(menuButtons2[0]);
  expect(setShowDropdown).toHaveBeenCalledWith(null);
});