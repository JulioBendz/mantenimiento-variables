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