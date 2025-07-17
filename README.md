# Mantenimiento de Variables y Fórmulas

Este proyecto permite gestionar variables y fórmulas matemáticas de forma dinámica, con historial, edición, copia y eliminación múltiple. Está desarrollado en React y utiliza pruebas automatizadas para asegurar la calidad y estabilidad del código.

## Características

- Agregar, editar y eliminar variables.
- Crear y calcular fórmulas usando variables.
- Historial de fórmulas con copia y reutilización.
- Eliminación múltiple y selección por página.
- Feedback visual al copiar.
- Buscador y paginación.
- Tests automatizados con Jest y React Testing Library.
- Estructura lista para conectar con backend (API .NET incluida en la solución).

## Instalación

```sh
npm install
```

## Uso

```sh
npm start
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Ejecutar tests

```sh
npm test
```
Para ejecutar **todos los tests**, presiona la tecla `a` cuando aparezca el menú interactivo, o ejecuta:
```sh
npm test -- --watchAll
```
Para ver la **cobertura de código**:
```sh
npm test -- --coverage
```

Para ver directamente **cobertura completa**
```sh
npm test -- --coverage --watchAll=false
```


## Estructura del proyecto

- `/src/components`: Componentes React principales (Variables, Fórmulas, Calculadora, etc.).
- `/src/utils`: Funciones utilitarias para lógica de negocio y helpers.
- `/src/__tests__` o archivos `.test.js`: Pruebas unitarias y de integración.
- `/MantenimientoVariablesApi`: Proyecto backend en .NET para futura integración.

## Pruebas automatizadas

Las pruebas están escritas usando [Jest](https://jestjs.io/) y [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).  
Ejemplo de test unitario para un componente:

```js
// VariableItem.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import VariableItem from './VariableItem';

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
```

**¿Qué se prueba?**
- Que el componente renderiza correctamente los datos.
- Que responde a eventos del usuario (clic, input, etc.).
- Que muestra el feedback visual esperado.

**¿De dónde se sacó la estructura de los tests?**
- [Documentación oficial de React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Documentación de Jest](https://jestjs.io/docs/getting-started)
- Ejemplos adaptados al código y estructura de este proyecto.

## Buenas prácticas y recomendaciones

- **Escribe tests para cada nueva funcionalidad.**
- **Simula el flujo real del usuario:** Usa `fireEvent` para inputs y botones.
- **Revisa la cobertura de código** para asegurar que los tests cubren lo importante.
- **Haz commit solo si los tests pasan.**
- **Si un test se rompe al hacer cambios:**  
  - Revisa si el cambio afecta el comportamiento esperado.
  - Actualiza el test si el nuevo comportamiento es correcto.
  - Corrige el código si el test detecta un bug real.

## ¿Qué pasa si los tests se rompen al avanzar?

Es normal que algunos tests fallen si cambias la lógica, los nombres de los elementos, o el flujo de la app.  
Esto te ayuda a detectar rápidamente si algo importante dejó de funcionar.  
**Siempre revisa los tests rotos y decide si debes actualizar el test o corregir el código.**

## Fuentes y documentación recomendada

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest](https://jestjs.io/docs/getting-started)
- [Guía de pruebas en React](https://react.dev/learn/testing)
- [Testing Playground](https://testing-playground.com/) para generar queries de testing.

## Contribuir

1. Haz un fork del repositorio.
2. Crea una rama nueva (`git checkout -b feature/nueva-funcionalidad`).
3. Haz tus cambios y agrega tests.
4. Haz un pull request.

## Licencia

MIT
