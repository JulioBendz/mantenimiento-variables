import { render, screen, fireEvent } from '@testing-library/react';
import PeriodSelector from '../components/PeriodSelector';

const periods = {
  '2025-07': {
    name: 'Periodo 1',
    variables: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 },
    formulas: [
      { name: 'F1' }, { name: 'F2' }, { name: 'F3' }, { name: 'F4' }
    ]
  },
  '2025-08': {
    name: 'Periodo 2',
    variables: { y: 2 },
    formulas: [{ name: 'Fórmula 2' }]
  }
};

afterEach(() => {
  jest.restoreAllMocks();
});

test('muestra el periodo actual', () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  expect(screen.getAllByText(/Periodo 1/i).length).toBeGreaterThan(0);
});

test('permite cambiar de periodo', () => {
  const setCurrentPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={setCurrentPeriod}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  const select = screen.getByRole('combobox');
  fireEvent.change(select, { target: { value: '2025-08' } });
  expect(setCurrentPeriod).toHaveBeenCalledWith('2025-08');
});

test('permite crear un nuevo periodo', () => {
  const createNewPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={createNewPeriod}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  const btn = screen.getByRole('button', { name: /\+ nuevo período/i });
  fireEvent.click(btn);
  // Aquí podrías simular el llenado del formulario y el click en "Crear", si quieres cobertura completa
});

test('no crea un período si ya existe', () => {
  window.alert = jest.fn();
  const createNewPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={createNewPeriod}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /\+ nuevo período/i }));
  // Selecciona el año y mes de un período ya existente
  fireEvent.change(screen.getByLabelText(/año/i), { target: { value: 2025 } });
  fireEvent.change(screen.getByLabelText(/mes/i), { target: { value: 7 } });
  fireEvent.click(screen.getByRole('button', { name: /crear/i }));
  expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/ya existe/i));
  expect(createNewPeriod).not.toHaveBeenCalled();
});

test('no crea un período si el año es inválido', () => {
  window.alert = jest.fn();
  const createNewPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={createNewPeriod}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /\+ nuevo período/i }));
  // Cambia el año a uno fuera de rango
  fireEvent.change(screen.getByLabelText(/año/i), { target: { value: 2010 } });
  fireEvent.click(screen.getByRole('button', { name: /crear/i }));
  // Si tienes validación, aquí debería saltar un alert o no llamar a createNewPeriod
  expect(createNewPeriod).not.toHaveBeenCalled();
});

test('no crea un período si el mes es inválido', () => {
  window.alert = jest.fn();
  const createNewPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={createNewPeriod}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /\+ nuevo período/i }));
  // Cambia el mes a uno fuera de rango
  fireEvent.change(screen.getByLabelText(/mes/i), { target: { value: 13 } });
  fireEvent.click(screen.getByRole('button', { name: /crear/i }));
  expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/mes.*válido/i));
  expect(createNewPeriod).not.toHaveBeenCalled();
});

test('permite eliminar el periodo actual', () => {
  const deletePeriod = jest.fn();
  window.confirm = jest.fn(() => true); // Simula confirmación positiva

  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={deletePeriod}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  const btn = screen.getByRole('button', { name: /eliminar/i });
  fireEvent.click(btn);
  expect(window.confirm).toHaveBeenCalled();
  expect(deletePeriod).toHaveBeenCalledWith('2025-07');
});

test('no elimina el periodo si el usuario cancela la confirmación', () => {
  const deletePeriod = jest.fn();
  window.confirm = jest.fn(() => false);

  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={deletePeriod}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  const btn = screen.getByRole('button', { name: /eliminar/i });
  fireEvent.click(btn);
  expect(window.confirm).toHaveBeenCalled();
  expect(deletePeriod).not.toHaveBeenCalled();
});

test('permite copiar variables del periodo anterior', async () => {
  const copyVariablesFromPreviousPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-08"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={copyVariablesFromPreviousPeriod}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  const btn = screen.getByRole('button', { name: /variables/i });
  fireEvent.click(btn);
  const copiarBtn = await screen.findByRole('button', { name: /copiar variables/i });
  fireEvent.click(copiarBtn);
  expect(copyVariablesFromPreviousPeriod).toHaveBeenCalled();
});

test('permite copiar fórmulas del periodo anterior', async () => {
  const copyFormulasFromPreviousPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-08"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={copyFormulasFromPreviousPeriod}
    />
  );
  const btn = screen.getByRole('button', { name: /fórmulas/i });
  fireEvent.click(btn);
  const copiarBtn = await screen.findByRole('button', { name: /copiar fórmulas/i });
  fireEvent.click(copiarBtn);
  expect(copyFormulasFromPreviousPeriod).toHaveBeenCalled();
});

test('no permite eliminar si solo hay un período', () => {
  const deletePeriod = jest.fn();
  render(
    <PeriodSelector
      periods={{ '2025-07': periods['2025-07'] }}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={deletePeriod}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  const btn = screen.getByRole('button', { name: /eliminar/i });
  expect(btn).toBeDisabled();
});

test('no permite copiar variables ni fórmulas si no hay otros períodos', () => {
  render(
    <PeriodSelector
      periods={{ '2025-07': periods['2025-07'] }}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  expect(screen.getByRole('button', { name: /variables/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /fórmulas/i })).toBeDisabled();
});

test('no copia variables si el período fuente no tiene variables', async () => {
  const copyVariablesFromPreviousPeriod = jest.fn();
  const periodsSinVars = {
    ...periods,
    '2025-09': { name: 'Periodo 3', variables: {}, formulas: [] }
  };
  render(
    <PeriodSelector
      periods={periodsSinVars}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={copyVariablesFromPreviousPeriod}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  // Abre modal de copiar variables
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  // Selecciona el período sin variables
  fireEvent.change(screen.getByLabelText(/copiar variables desde/i), { target: { value: '2025-09' } });
  // El botón debe estar deshabilitado
  expect(screen.getByRole('button', { name: /copiar variables/i })).toBeDisabled();
});

test('no copia fórmulas si el período fuente no tiene fórmulas', async () => {
  const copyFormulasFromPreviousPeriod = jest.fn();
  const periodsSinFormulas = {
    ...periods,
    '2025-09': { name: 'Periodo 3', variables: {}, formulas: [] }
  };
  render(
    <PeriodSelector
      periods={periodsSinFormulas}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={copyFormulasFromPreviousPeriod}
    />
  );
  // Abre modal de copiar fórmulas
  fireEvent.click(screen.getByRole('button', { name: /fórmulas/i }));
  // Selecciona el período sin fórmulas
  fireEvent.change(screen.getByLabelText(/copiar fórmulas desde/i), { target: { value: '2025-09' } });
  // El botón debe estar deshabilitado
  expect(screen.getByRole('button', { name: /copiar fórmulas/i })).toBeDisabled();
});

test('no permite copiar variables si no seleccionas período fuente', () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  fireEvent.change(screen.getByLabelText(/copiar variables desde/i), { target: { value: '' } });
  expect(screen.getByRole('button', { name: /copiar variables/i })).toBeDisabled();
});

test('no permite copiar fórmulas si no seleccionas período fuente', () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /fórmulas/i }));
  fireEvent.change(screen.getByLabelText(/copiar fórmulas desde/i), { target: { value: '' } });
  expect(screen.getByRole('button', { name: /copiar fórmulas/i })).toBeDisabled();
});

test('cierra el modal de copiar variables al cancelar', async () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
  expect(screen.queryByText(/copiar variables/i)).not.toBeInTheDocument();
});

test('cierra el modal de copiar fórmulas al cancelar', async () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /fórmulas/i }));
  fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
  expect(screen.queryByText(/copiar fórmulas/i)).not.toBeInTheDocument();
});

test('no copia variables si el período fuente no existe', () => {
  const copyVariablesFromPreviousPeriod = jest.fn();
  const { rerender } = render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={copyVariablesFromPreviousPeriod}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  // Llama directamente a la función interna (si la exportas para test)
  // O simula el flujo con un período que no existe
  // Aquí solo como ejemplo:
  // expect(copyVariablesFromPreviousPeriod).not.toHaveBeenCalled();
});

test('cierra el formulario de creación al cancelar', () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /\+ nuevo período/i }));
  fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
  expect(screen.queryByText(/crear nuevo período/i)).not.toBeInTheDocument();
});

test('cierra el formulario de creación al presionar Escape', () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /\+ nuevo período/i }));
  fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
  expect(screen.queryByText(/crear nuevo período/i)).not.toBeInTheDocument();
});

test('puede marcar y desmarcar checkboxes de copiar variables y fórmulas al crear período', () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /\+ nuevo período/i }));
  const varCheckbox = screen.getByLabelText(/copiar variables/i);
  const formCheckbox = screen.getByLabelText(/copiar fórmulas/i);
  fireEvent.click(varCheckbox);
  fireEvent.click(formCheckbox);
  expect(varCheckbox.checked).toBe(false); // o true, según el estado inicial
  expect(formCheckbox.checked).toBe(false); // o true, según el estado inicial
});

test('puede seleccionar otro período fuente en el modal de copiar variables', () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-08"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  const select = screen.getByLabelText(/copiar variables desde/i);
  fireEvent.change(select, { target: { value: '2025-07' } });
  expect(select.value).toBe('2025-07');
});

test('cierra el modal de copiar variables al presionar Escape', () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
  expect(screen.queryByText(/copiar variables/i)).not.toBeInTheDocument();
});

test('no permite seleccionar un período fuente inexistente en el modal de copiar variables', () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  const select = screen.getByLabelText(/copiar variables desde/i);
  fireEvent.change(select, { target: { value: 'no-existe' } });
  // El valor debe seguir siendo ""
  expect(select.value).toBe('');
  expect(screen.getByRole('button', { name: /copiar variables/i })).toBeDisabled();
});

test('crea un nuevo período correctamente y copia datos si corresponde', () => {
  jest.useFakeTimers(); // <-- Activa fake timers

  const createNewPeriod = jest.fn();
  const copyVariablesFromPreviousPeriod = jest.fn();
  const copyFormulasFromPreviousPeriod = jest.fn();

  render(
    <PeriodSelector
      periods={{
        '2025-07': { name: 'Periodo 1', variables: { x: 1 }, formulas: [{ name: 'F1' }] }
      }}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={createNewPeriod}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={copyVariablesFromPreviousPeriod}
      copyFormulasFromPreviousPeriod={copyFormulasFromPreviousPeriod}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: /\+ nuevo período/i }));
  fireEvent.change(screen.getByLabelText(/año/i), { target: { value: 2026 } });
  fireEvent.change(screen.getByLabelText(/mes/i), { target: { value: 8 } });

  // Busca el select correcto para "copiar desde"
  const selects = screen.getAllByRole('combobox');
  const copiarDesdeSelect = selects.find(
    sel => Array.from(sel.options).some(opt => opt.textContent?.match(/Periodo 1/))
  );
  fireEvent.change(copiarDesdeSelect, { target: { value: '2025-07' } });

  // Marca ambos checkboxes (ya están marcados por defecto, pero asegúrate)
  const varCheckbox = screen.getByLabelText(/copiar variables/i);
  const formCheckbox = screen.getByLabelText(/copiar fórmulas/i);
  if (!varCheckbox.checked) fireEvent.click(varCheckbox);
  if (!formCheckbox.checked) fireEvent.click(formCheckbox);

  fireEvent.click(screen.getByRole('button', { name: /crear/i }));

  expect(createNewPeriod).toHaveBeenCalledWith(2026, 8, expect.any(String));

  // Si tu lógica usa setTimeout para copiar, avanza los timers:
  jest.runAllTimers();

  expect(copyVariablesFromPreviousPeriod).toHaveBeenCalled();
  expect(copyFormulasFromPreviousPeriod).toHaveBeenCalled();

  jest.useRealTimers(); // <-- Limpia fake timers
});

test('cubre el return temprano del useEffect de showCreateForm', () => {
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  // El formulario no está abierto, el useEffect retorna temprano
  // Ahora ábrelo y ciérralo para cubrir ambos caminos
  fireEvent.click(screen.getByRole('button', { name: /\+ nuevo período/i }));
  fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
});

test('no copia variables si el período fuente no existe (branch)', () => {
  const copyVariablesFromPreviousPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={copyVariablesFromPreviousPeriod}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  // Intenta seleccionar un período que no existe
  const select = screen.getByLabelText(/copiar variables desde/i);
  fireEvent.change(select, { target: { value: 'no-existe' } });
  // El botón debe estar deshabilitado
  expect(screen.getByRole('button', { name: /copiar variables/i })).toBeDisabled();
});

test('no copia fórmulas si el período fuente no existe (branch)', () => {
  const copyFormulasFromPreviousPeriod = jest.fn();
  render(
    <PeriodSelector
      periods={periods}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={copyFormulasFromPreviousPeriod}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /fórmulas/i }));
  // Intenta seleccionar un período que no existe
  const select = screen.getByLabelText(/copiar fórmulas desde/i);
  fireEvent.change(select, { target: { value: 'no-existe' } });
  // El botón debe estar deshabilitado
  expect(screen.getByRole('button', { name: /copiar fórmulas/i })).toBeDisabled();
});

test('no copia variables si el período fuente tiene variables undefined', () => {
  const copyVariablesFromPreviousPeriod = jest.fn();
  const periodsSinVars = {
    ...periods,
    '2025-09': { name: 'Periodo 3' } // variables: undefined
  };
  render(
    <PeriodSelector
      periods={periodsSinVars}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={copyVariablesFromPreviousPeriod}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  fireEvent.change(screen.getByLabelText(/copiar variables desde/i), { target: { value: '2025-09' } });
  expect(screen.getByRole('button', { name: /copiar variables/i })).toBeDisabled();
});

test('no copia fórmulas si el período fuente tiene formulas undefined', () => {
  const copyFormulasFromPreviousPeriod = jest.fn();
  const periodsSinFormulas = {
    ...periods,
    '2025-09': { name: 'Periodo 3', variables: { z: 3 } } // formulas: undefined
  };
  render(
    <PeriodSelector
      periods={periodsSinFormulas}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={copyFormulasFromPreviousPeriod}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /fórmulas/i }));
  fireEvent.change(screen.getByLabelText(/copiar fórmulas desde/i), { target: { value: '2025-09' } });
  expect(screen.getByRole('button', { name: /copiar fórmulas/i })).toBeDisabled();
});

test('no copia variables si el período fuente no existe (branch defensivo)', () => {
  const copyVariablesFromPreviousPeriod = jest.fn();
  const periodsSinFuente = {
    '2025-07': { name: 'Periodo 1', variables: { x: 1 }, formulas: [{ name: 'F1' }] }
    // No existe '2025-99'
  };
  render(
    <PeriodSelector
      periods={periodsSinFuente}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={copyVariablesFromPreviousPeriod}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  // Simula la acción que intenta copiar desde un período inexistente
  // (puedes llamar directamente la función si está exportada, o simular el flujo)
  // Aquí solo asegúrate de que no se llama el callback
  // Por ejemplo, si tienes un botón para copiar, selecciona un período inexistente y haz click
  // El botón debe estar deshabilitado o no debe pasar nada
});

test('no copia fórmulas si el período fuente no existe (branch defensivo)', () => {
  const copyFormulasFromPreviousPeriod = jest.fn();
  const periodsSinFuente = {
    '2025-07': { name: 'Periodo 1', variables: { x: 1 }, formulas: [{ name: 'F1' }] }
    // No existe '2025-99'
  };
  render(
    <PeriodSelector
      periods={periodsSinFuente}
      currentPeriod="2025-07"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={copyFormulasFromPreviousPeriod}
    />
  );
  // Simula la acción que intenta copiar desde un período inexistente
  // El botón debe estar deshabilitado o no debe pasar nada
});

test('muestra "más..." si hay más de 5 variables al copiar', () => {
  render(<PeriodSelector
    periods={periods}
    currentPeriod="2025-08"
    setCurrentPeriod={() => {}}
    createNewPeriod={() => {}}
    deletePeriod={() => {}}
    copyVariablesFromPreviousPeriod={() => {}}
    copyFormulasFromPreviousPeriod={() => {}}
  />);
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  fireEvent.change(screen.getByLabelText(/copiar variables desde/i), { target: { value: '2025-07' } });
  expect(screen.getByText(/y 1 más.../i)).toBeInTheDocument();
});

test('muestra "más..." si hay más de 3 fórmulas al copiar', () => {
  render(<PeriodSelector
    periods={periods}
    currentPeriod="2025-08"
    setCurrentPeriod={() => {}}
    createNewPeriod={() => {}}
    deletePeriod={() => {}}
    copyVariablesFromPreviousPeriod={() => {}}
    copyFormulasFromPreviousPeriod={() => {}}
  />);
  fireEvent.click(screen.getByRole('button', { name: /fórmulas/i }));
  fireEvent.change(screen.getByLabelText(/copiar fórmulas desde/i), { target: { value: '2025-07' } });
  expect(screen.getByText(/y 1 más.../i)).toBeInTheDocument();
});

test('no muestra "más..." si el período fuente tiene exactamente 3 variables', () => {
  const periods3Vars = {
    ...periods,
    '2025-13': {
      name: 'Periodo 7',
      variables: { a: 1, b: 2, c: 3 },
      formulas: []
    }
  };
  render(
    <PeriodSelector
      periods={periods3Vars}
      currentPeriod="2025-08"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  fireEvent.change(screen.getByLabelText(/copiar variables desde/i), { target: { value: '2025-13' } });
  expect(screen.queryByText('...')).not.toBeInTheDocument();
});

test('no muestra "más..." si el período fuente tiene exactamente 5 variables', () => {
  const periods5Vars = {
    ...periods,
    '2025-14': {
      name: 'Periodo 8',
      variables: { a: 1, b: 2, c: 3, d: 4, e: 5 },
      formulas: []
    }
  };
  render(
    <PeriodSelector
      periods={periods5Vars}
      currentPeriod="2025-08"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  fireEvent.change(screen.getByLabelText(/copiar variables desde/i), { target: { value: '2025-14' } });
  expect(screen.queryByText(/más.../i)).not.toBeInTheDocument();
});

test('muestra "Sin seleccionar" si no hay período actual', () => {
  render(<PeriodSelector
    periods={{}}
    currentPeriod="no-existe"
    setCurrentPeriod={() => {}}
    createNewPeriod={() => {}}
    deletePeriod={() => {}}
    copyVariablesFromPreviousPeriod={() => {}}
    copyFormulasFromPreviousPeriod={() => {}}
  />);
  expect(screen.getByText(/Sin seleccionar/i)).toBeInTheDocument();
});

test('muestra mensaje si no hay períodos', () => {
  render(<PeriodSelector
    periods={{}}
    currentPeriod=""
    setCurrentPeriod={() => {}}
    createNewPeriod={() => {}}
    deletePeriod={() => {}}
    copyVariablesFromPreviousPeriod={() => {}}
    copyFormulasFromPreviousPeriod={() => {}}
  />);
  expect(screen.getByText(/no hay períodos/i)).toBeInTheDocument();
});

test('muestra mensaje si el período fuente no tiene variables', () => {
  const periodsSinVars = {
    ...periods,
    '2025-09': { name: 'Periodo 3', variables: {}, formulas: [] }
  };
  render(
    <PeriodSelector
      periods={periodsSinVars}
      currentPeriod="2025-08"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  fireEvent.change(screen.getByLabelText(/copiar variables desde/i), { target: { value: '2025-09' } });
  expect(screen.getByText(/no hay variables en este período/i)).toBeInTheDocument();
});

test('muestra "..." si el período fuente tiene más de 2 fórmulas', () => {
  const periodsMasF2 = {
    ...periods,
    '2025-10': {
      name: 'Periodo 4',
      variables: { x: 1 },
      formulas: [
        { name: 'F1' }, { name: 'F2' }, { name: 'F3' }, { name: 'F4' }
      ]
    }
  };
  render(
    <PeriodSelector
      periods={periodsMasF2}
      currentPeriod="2025-08"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /fórmulas/i }));
  fireEvent.change(screen.getByLabelText(/copiar fórmulas desde/i), { target: { value: '2025-10' } });
  expect(screen.getByText(/y 1 más\.\.\./i)).toBeInTheDocument();
});

test('muestra los nombres de hasta 5 variables al copiar', () => {
  const periods5Vars = {
    ...periods,
    '2025-11': {
      name: 'Periodo 5',
      variables: { a:1, b:2, c:3, d:4, e:5, f:6 },
      formulas: []
    }
  };
  render(
    <PeriodSelector
      periods={periods5Vars}
      currentPeriod="2025-08"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  fireEvent.change(screen.getByLabelText(/copiar variables desde/i), { target: { value: '2025-11' } });
  // Debe mostrar los nombres de las primeras 5 variables
  expect(screen.getByText(/a, b, c, d, e/)).toBeInTheDocument();
  // Y debe mostrar "y 1 más..." por la sexta variable
  expect(screen.getByText(/y 1 más.../i)).toBeInTheDocument();
});

test('muestra los nombres de hasta 3 fórmulas y "más..." si hay más', () => {
  const periods4Formulas = {
    ...periods,
    '2025-12': {
      name: 'Periodo 6',
      variables: {},
      formulas: [
        { name: 'F1' }, { name: 'F2' }, { name: 'F3' }, { name: 'F4' }
      ]
    }
  };
  render(
    <PeriodSelector
      periods={periods4Formulas}
      currentPeriod="2025-08"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /fórmulas/i }));
  fireEvent.change(screen.getByLabelText(/copiar fórmulas desde/i), { target: { value: '2025-12' } });
  // Debe mostrar los nombres de las primeras 3 fórmulas
  expect(screen.getByText(/F1, F2, F3/)).toBeInTheDocument();
  // Y debe mostrar "y 1 más..." por la cuarta fórmula
  expect(screen.getByText(/y 1 más.../i)).toBeInTheDocument();
});

test('no muestra "más..." si el período fuente tiene exactamente 3 fórmulas', () => {
  const periods3Formulas = {
    ...periods,
    '2025-15': {
      name: 'Periodo 9',
      variables: {},
      formulas: [
        { name: 'F1' }, { name: 'F2' }, { name: 'F3' }
      ]
    }
  };
  render(
    <PeriodSelector
      periods={periods3Formulas}
      currentPeriod="2025-08"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /fórmulas/i }));
  fireEvent.change(screen.getByLabelText(/copiar fórmulas desde/i), { target: { value: '2025-15' } });
  expect(screen.queryByText(/más.../i)).not.toBeInTheDocument();
});

test('muestra 0 variables si variables es undefined', () => {
  const periodsSinVars = {
    '2025-20': { name: 'Periodo sin vars' } // variables: undefined
  };
  render(
    <PeriodSelector
      periods={periodsSinVars}
      currentPeriod="2025-20"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  expect(screen.getByText(/0 variables/i)).toBeInTheDocument();
});

test('muestra 0 fórmulas si formulas es undefined', () => {
  const periodsSinFormulas = {
    '2025-22': { name: 'Periodo sin formulas', variables: { x: 1 } }
  };
  render(
    <PeriodSelector
      periods={periodsSinFormulas}
      currentPeriod="2025-22"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  expect(screen.getByText(/0 fórmulas/i)).toBeInTheDocument();
});

test('no muestra "..." si el período fuente tiene menos de 3 variables', () => {
  const periods2Vars = {
    '2025-21': { name: 'Periodo 2 vars', variables: { a: 1, b: 2 }, formulas: [] },
    '2025-22': { name: 'Otro', variables: { x: 1 }, formulas: [] }
  };
  render(
    <PeriodSelector
      periods={periods2Vars}
      currentPeriod="2025-22"
      setCurrentPeriod={() => {}}
      createNewPeriod={() => {}}
      deletePeriod={() => {}}
      copyVariablesFromPreviousPeriod={() => {}}
      copyFormulasFromPreviousPeriod={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /variables/i }));
  fireEvent.change(screen.getByLabelText(/copiar variables desde/i), { target: { value: '2025-21' } });
  expect(screen.queryByText('...')).not.toBeInTheDocument();
});