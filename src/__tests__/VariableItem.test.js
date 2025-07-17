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