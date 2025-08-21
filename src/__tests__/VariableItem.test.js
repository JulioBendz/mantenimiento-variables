import { render, screen, fireEvent } from '@testing-library/react';
import VariableItem from '../components/VariableItem';

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