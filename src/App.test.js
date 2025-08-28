import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('muestra el título principal', () => {
  render(<App />);
  // Busca el título principal por el encabezado de nivel 2 (Variables)
  expect(screen.getByRole('heading', { level: 2, name: /Variables/i })).toBeInTheDocument();
  // Busca el título principal por el encabezado de nivel 2 (Historial de Fórmulas)
  expect(screen.getByRole('heading', { level: 2, name: /Historial de Fórmulas/i })).toBeInTheDocument();
});

test('puede agregar una variable', () => {
  render(<App />);
  const nameInput = screen.getByPlaceholderText(/Nombre de variable/i);
  const valueInput = screen.getByPlaceholderText(/Valor numérico/i);
  const addBtn = screen.getByText(/Agregar Variable/i);

  fireEvent.change(nameInput, { target: { value: 'x' } });
  fireEvent.change(valueInput, { target: { value: '10' } });
  fireEvent.click(addBtn);

  expect(screen.getByText(/x\s*=\s*10/i)).toBeInTheDocument();
});

test('puede buscar una variable', () => {
  render(<App />);
  // Primero agrega una variable para que aparezca el input de búsqueda
  const nameInput = screen.getByPlaceholderText(/Nombre de variable/i);
  const valueInput = screen.getByPlaceholderText(/Valor numérico/i);
  const addBtn = screen.getByText(/Agregar Variable/i);

  fireEvent.change(nameInput, { target: { value: 'x' } });
  fireEvent.change(valueInput, { target: { value: '10' } });
  fireEvent.click(addBtn);

  // Ahora sí existe el input de búsqueda
  const searchInput = screen.getByPlaceholderText(/Buscar variable por nombre/i);
  fireEvent.change(searchInput, { target: { value: 'y' } });
  expect(screen.getByText(/No se encontraron variables/i)).toBeInTheDocument();
});

test('existen variables en el documento', () => {
  render(<App />);
  const headings = screen.getAllByRole('heading', { name: /Variables/i });
  expect(headings.length).toBeGreaterThan(0);
});

// Nueva prueba para la barra de búsqueda
test('la barra de búsqueda se muestra solo si hay variables', () => {
  render(<App />);
  // Al principio, no debería haber barra de búsqueda
  expect(screen.queryByPlaceholderText(/Buscar variable por nombre/i)).not.toBeInTheDocument();

  // Agrega una variable usando el flujo real
  const nameInput = screen.getByPlaceholderText(/Nombre de variable/i);
  const valueInput = screen.getByPlaceholderText(/Valor numérico/i);
  const addBtn = screen.getByText(/Agregar Variable/i);

  fireEvent.change(nameInput, { target: { value: 'a' } });
  fireEvent.change(valueInput, { target: { value: '1' } });
  fireEvent.click(addBtn);

  // Ahora debería aparecer la barra de búsqueda
  expect(screen.getByPlaceholderText(/Buscar variable por nombre/i)).toBeInTheDocument();
});
