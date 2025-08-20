import { render, screen, fireEvent } from '@testing-library/react';
import Variables from '../components/Variables';
import React from 'react';

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
      variableValue="5"
      removeVariable={() => {}}
      editVariable={() => {}}
    />
  );
  fireEvent.click(screen.getByText(/Agregar Variable/i));
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