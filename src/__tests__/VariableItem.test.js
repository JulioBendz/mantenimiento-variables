import { render, screen, fireEvent } from '@testing-library/react';
import VariableItem from '../components/VariableItem';
import { act } from 'react';

test('muestra el nombre y valor de la variable', () => {
  render(<VariableItem name="x" value={10} />);
  expect(screen.getByText(/x = 10/)).toBeInTheDocument();
});

test('muestra "Copiado" al hacer clic en el botón de copiar', () => {
  render(<VariableItem name="x" value={10} onCopy={() => {}} />);
  const copyBtn = screen.getByTitle(/copiar variable/i);
  fireEvent.click(copyBtn);
  expect(screen.getByText(/Copiado/)).toBeInTheDocument();
});

test('permite editar el valor de la variable', () => {
  const onEdit = jest.fn();
  const onSaveEdit = jest.fn();
  render(
    <VariableItem
      name="x"
      value={10}
      editingName="x"
      editingValue="10"
      onEdit={onEdit}
      onSaveEdit={onSaveEdit}
      onCancelEdit={() => {}}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      onToggleSelection={() => {}}
      onCopy={() => {}}
      onDuplicate={() => {}}
      onStartDirectDeletion={() => {}}
      onDropdownToggle={() => {}}
      onDropdownClose={() => {}}
      onDeletePanelClose={() => {}}
      onBulkDelete={() => {}}
      onSelectAll={() => {}}
      onDeselectAll={() => {}}
      selectedVariables={new Set()}
      currentVariables={[]}
      showDropdown={null}
      isSelectionMode={false}
      hoveredItem={null}
      deleteControlsPosition={{ name: null, show: false }}
      startEditing={() => {}}
      duplicateVariable={() => {}}
      startDirectDeletion={() => {}}
      cancelSelectionMode={() => {}}
      toggleVariableSelection={() => {}}
      handleBulkDelete={() => {}}
    />
  );
  const input = screen.getByDisplayValue('10');
  fireEvent.change(input, { target: { value: '20' } });
  expect(onEdit).toHaveBeenCalled();
  fireEvent.click(screen.getByTitle(/Guardar cambios/i));
  expect(onSaveEdit).toHaveBeenCalledWith('x');
});

test('llama a duplicateVariable al hacer clic en Duplicar', () => {
  const duplicateVariable = jest.fn();
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
      onDuplicate={duplicateVariable}
      onStartDirectDeletion={() => {}}
      onDropdownToggle={() => {}}
      onDropdownClose={() => {}}
      onDeletePanelClose={() => {}}
      onBulkDelete={() => {}}
      onSelectAll={() => {}}
      onDeselectAll={() => {}}
      selectedVariables={new Set()}
      currentVariables={[]}
      startEditing={() => {}}
      duplicateVariable={duplicateVariable}
      startDirectDeletion={() => {}}
      cancelSelectionMode={() => {}}
      toggleVariableSelection={() => {}}
      handleBulkDelete={() => {}}
      deleteControlsPosition={{ name: null, show: false }}
    />
  );
  fireEvent.click(screen.getByText(/Duplicar/i));
  expect(duplicateVariable).toHaveBeenCalledWith('x', 10);
});

test('llama a onBulkDelete al hacer clic en Eliminar múltiple', () => {
  const onBulkDelete = jest.fn();
  render(
    <VariableItem
      name="x"
      value={10}
      isSelectionMode={true}
      isSelected={true}
      selectedVariables={new Set(['x', 'y'])}
      currentVariables={[['x', 10], ['y', 20]]}
      deleteControlsPosition={{ name: 'x', show: true }}
      onBulkDelete={onBulkDelete}
      onDeletePanelClose={() => {}}
      onSelectAll={() => {}}
      onDeselectAll={() => {}}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      onEdit={() => {}}
      onSaveEdit={() => {}}
      onCancelEdit={() => {}}
      onToggleSelection={() => {}}
      onCopy={() => {}}
      onDuplicate={() => {}}
      onStartDirectDeletion={() => {}}
      onDropdownToggle={() => {}}
      onDropdownClose={() => {}}
      startEditing={() => {}}
      duplicateVariable={() => {}}
      startDirectDeletion={() => {}}
      cancelSelectionMode={() => {}}
      toggleVariableSelection={() => {}}
      handleBulkDelete={() => {}}
      editingName={null}
      editingValue=""
      hoveredItem={null}
      showDropdown={null}
    />
  );
  fireEvent.click(screen.getByText(/Eliminar \(2\)/i));
  expect(onBulkDelete).toHaveBeenCalled();
});

test('llama a onCopy al hacer clic en el botón de copiar', () => {
  const onCopy = jest.fn();
  render(
    <VariableItem
      name="x"
      value={10}
      onCopy={onCopy}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      onEdit={() => {}}
      onSaveEdit={() => {}}
      onCancelEdit={() => {}}
      onToggleSelection={() => {}}
      onDuplicate={() => {}}
      onStartDirectDeletion={() => {}}
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
      startDirectDeletion={() => {}}
      cancelSelectionMode={() => {}}
      toggleVariableSelection={() => {}}
      handleBulkDelete={() => {}}
      editingName={null}
      editingValue=""
      hoveredItem={null}
      showDropdown={null}
      isSelectionMode={false}
      isSelected={false}
      deleteControlsPosition={{ name: null, show: false }}
    />
  );
  fireEvent.click(screen.getByTitle(/Copiar variable/i));
  expect(onCopy).toHaveBeenCalled();
});

test('permite seleccionar y deseleccionar la variable en modo selección', () => {
  const onToggleSelection = jest.fn();
  render(
    <VariableItem
      name="x"
      value={10}
      isSelectionMode={true}
      isSelected={false}
      onToggleSelection={onToggleSelection}
      selectedVariables={new Set()}
      currentVariables={[]}
      deleteControlsPosition={{ name: null, show: false }}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      onEdit={() => {}}
      onSaveEdit={() => {}}
      onCancelEdit={() => {}}
      onCopy={() => {}}
      onDuplicate={() => {}}
      onStartDirectDeletion={() => {}}
      onDropdownToggle={() => {}}
      onDropdownClose={() => {}}
      onDeletePanelClose={() => {}}
      onBulkDelete={() => {}}
      onSelectAll={() => {}}
      onDeselectAll={() => {}}
      startEditing={() => {}}
      duplicateVariable={() => {}}
      startDirectDeletion={() => {}}
      cancelSelectionMode={() => {}}
      toggleVariableSelection={() => {}}
      handleBulkDelete={() => {}}
      editingName={null}
      editingValue=""
      hoveredItem={null}
      showDropdown={null}
    />
  );
  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);
  expect(onToggleSelection).toHaveBeenCalled();
});

test('llama a onDropdownToggle al hacer clic en el botón de más opciones', () => {
  const onDropdownToggle = jest.fn();
  render(
    <VariableItem
      name="x"
      value={10}
      hoveredItem="x"
      showDropdown={null}
      isSelectionMode={false}
      editingName={null}
      editingValue=""
      onDropdownToggle={onDropdownToggle}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      onEdit={() => {}}
      onSaveEdit={() => {}}
      onCancelEdit={() => {}}
      onToggleSelection={() => {}}
      onCopy={() => {}}
      onDuplicate={() => {}}
      onStartDirectDeletion={() => {}}
      onDropdownClose={() => {}}
      onDeletePanelClose={() => {}}
      onBulkDelete={() => {}}
      onSelectAll={() => {}}
      onDeselectAll={() => {}}
      selectedVariables={new Set()}
      currentVariables={[]}
      startEditing={() => {}}
      duplicateVariable={() => {}}
      startDirectDeletion={() => {}}
      cancelSelectionMode={() => {}}
      toggleVariableSelection={() => {}}
      handleBulkDelete={() => {}}
      deleteControlsPosition={{ name: null, show: false }}
    />
  );
  const moreBtn = screen.getByTitle(/más opciones/i);
  fireEvent.click(moreBtn);
  expect(onDropdownToggle).toHaveBeenCalled();
});

test('llama a onCancelEdit al hacer clic en cancelar edición', () => {
  const onCancelEdit = jest.fn();
  render(
    <VariableItem
      name="x"
      value={10}
      editingName="x"
      editingValue="10"
      onEdit={() => {}}
      onSaveEdit={() => {}}
      onCancelEdit={onCancelEdit}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      onToggleSelection={() => {}}
      onCopy={() => {}}
      onDuplicate={() => {}}
      onStartDirectDeletion={() => {}}
      onDropdownToggle={() => {}}
      onDropdownClose={() => {}}
      onDeletePanelClose={() => {}}
      onBulkDelete={() => {}}
      onSelectAll={() => {}}
      onDeselectAll={() => {}}
      selectedVariables={new Set()}
      currentVariables={[]}
      showDropdown={null}
      isSelectionMode={false}
      hoveredItem={null}
      deleteControlsPosition={{ name: null, show: false }}
      startEditing={() => {}}
      duplicateVariable={() => {}}
      startDirectDeletion={() => {}}
      cancelSelectionMode={() => {}}
      toggleVariableSelection={() => {}}
      handleBulkDelete={() => {}}
    />
  );
  fireEvent.click(screen.getByTitle(/Cancelar edición/i));
  expect(onCancelEdit).toHaveBeenCalled();
});

test('llama a onDeletePanelClose al hacer clic en Cancelar en el panel de eliminación', () => {
  const onDeletePanelClose = jest.fn();
  render(
    <VariableItem
      name="x"
      value={10}
      isSelectionMode={true}
      isSelected={true}
      selectedVariables={new Set(['x'])}
      currentVariables={[['x', 10]]}
      deleteControlsPosition={{ name: 'x', show: true }}
      onDeletePanelClose={onDeletePanelClose}
      onBulkDelete={() => {}}
      onSelectAll={() => {}}
      onDeselectAll={() => {}}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      onEdit={() => {}}
      onSaveEdit={() => {}}
      onCancelEdit={() => {}}
      onToggleSelection={() => {}}
      onCopy={() => {}}
      onDuplicate={() => {}}
      onStartDirectDeletion={() => {}}
      onDropdownToggle={() => {}}
      onDropdownClose={() => {}}
      startEditing={() => {}}
      duplicateVariable={() => {}}
      startDirectDeletion={() => {}}
      cancelSelectionMode={() => {}}
      toggleVariableSelection={() => {}}
      handleBulkDelete={() => {}}
      editingName={null}
      editingValue=""
      hoveredItem={null}
      showDropdown={null}
    />
  );
  fireEvent.click(screen.getByTitle(/Cancelar selección/i));
  expect(onDeletePanelClose).toHaveBeenCalled();
});
jest.useFakeTimers();

test('muestra "Copiado" al hacer clic en el botón de copiar y desaparece después del timeout', () => {
  act(() => {
    render(<VariableItem name="x" value={10} onCopy={() => {}} />);
  });
  const copyBtn = screen.getByTitle(/copiar variable/i);
  act(() => {
    fireEvent.click(copyBtn);
  });
  expect(screen.getByText(/Copiado/)).toBeInTheDocument();

  act(() => {
    jest.runAllTimers();
  });

  expect(screen.queryByText(/Copiado/)).not.toBeInTheDocument();
});