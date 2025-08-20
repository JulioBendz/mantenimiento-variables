import { render, screen } from '@testing-library/react';
import Header from '../components/Header';

test('muestra el título de la app', () => {
  render(<Header />);
  expect(screen.getByText(/Mantenimiento de Variables/i)).toBeInTheDocument();
  expect(screen.getByText(/Gestiona variables numéricas y evalúa fórmulas matemáticas/i)).toBeInTheDocument();
  expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
});