# Mantenimiento de Variables y Fórmulas

Este proyecto es una solución **end-to-end** para la gestión de variables y fórmulas matemáticas, incluyendo frontend en React, backend en .NET, pruebas automatizadas, integración continua y despliegue. Está diseñado para ser escalable, mantenible y fácil de extender.

---

## Características principales

- **Frontend React:**  
  - Gestión dinámica de variables y fórmulas.
  - Historial, edición, copia y eliminación múltiple.
  - Buscador, paginación y feedback visual.
  - UI lista para integración con backend.

- **Backend .NET (API):**  
  - Estructura preparada para exponer endpoints RESTful.
  - Pensado para persistencia, autenticación y lógica de negocio.

- **Pruebas automatizadas:**  
  - Unitarias y de integración con Jest y React Testing Library.
  - Cobertura superior al 85% en componentes y lógica.
  - Listo para agregar pruebas end-to-end (E2E) con Cypress o Playwright.

- **Ciclo DevOps:**  
  - Listo para integración continua (CI) y despliegue continuo (CD).
  - Buenas prácticas de versionado, documentación y calidad de código.

---

## Estructura del proyecto

```
/src
  /components      # Componentes React principales
  /utils           # Funciones utilitarias y helpers
  /hooks           # Custom hooks de React
  /__tests__       # Pruebas unitarias e integración
/MantenimientoVariablesApi
  /Controllers     # Controladores .NET para la API
  /Models          # Modelos de datos
  /...             # Otros archivos backend
README.md
package.json
...
```

---

## Instalación y uso

### 1. Clonar el repositorio

```sh
git clone https://github.com/tu-usuario/mantenimiento-variables.git
cd mantenimiento-variables
```

### 2. Instalar dependencias frontend

```sh
npm install
```

### 3. Ejecutar frontend

```sh
npm start
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 4. Ejecutar backend (.NET)

```sh
cd MantenimientoVariablesApi
dotnet restore
dotnet run
```
Por defecto, la API estará disponible en [http://localhost:5000](http://localhost:5000) o el puerto configurado.

---

## Pruebas automatizadas

### Ejecutar tests unitarios y de integración

```sh
npm test
```
Para ejecutar **todos los tests**:
```sh
npm test -- --watchAll
```
Para ver la **cobertura de código**:
```sh
npm test -- --coverage
```

### Pruebas end-to-end (E2E)

> **Recomendado:**  
> Agrega [Cypress](https://www.cypress.io/) o [Playwright](https://playwright.dev/) para simular flujos completos de usuario.

Ejemplo de instalación Cypress:
```sh
npm install --save-dev cypress
npx cypress open
```

---

## Despliegue

- **Frontend:**  
  Puedes desplegar en Vercel, Netlify, Azure Static Web Apps, etc.
- **Backend:**  
  Despliegue en Azure App Service, AWS, Heroku, o tu servidor preferido.
- **CI/CD:**  
  Configura pipelines en GitHub Actions, GitLab CI, Azure DevOps, etc., para automatizar tests y despliegue.

---

## Buenas prácticas y ciclo de desarrollo

- **Desarrollo guiado por tests:** Escribe tests para cada nueva funcionalidad.
- **Integración continua:** Usa pipelines para validar cada cambio.
- **Revisión de código:** Haz pull requests y revisa en equipo.
- **Documentación:** Mantén este README y la documentación técnica actualizada.
- **Monitoreo y feedback:** Agrega logs, manejo de errores y monitoreo en producción.
- **Refactorización continua:** Aprovecha la alta cobertura para mejorar el código sin miedo.

---

## Ejemplo de test unitario

```js
import { render, screen, fireEvent } from '@testing-library/react';
import VariableItem from './VariableItem';

test('muestra el nombre y valor de la variable', () => {
  render(<VariableItem name="x" value={10} />);
  expect(screen.getByText(/x = 10/)).toBeInTheDocument();
});
```

---

## Contribuir

1. Haz un fork del repositorio.
2. Crea una rama nueva (`git checkout -b feature/nueva-funcionalidad`).
3. Haz tus cambios y agrega tests.
4. Haz un pull request.

---

## Recursos y documentación recomendada

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest](https://jestjs.io/docs/getting-started)
- [Cypress](https://docs.cypress.io/)
- [Playwright](https://playwright.dev/)
- [Guía de pruebas en React](https://react.dev/learn/testing)
- [Documentación .NET](https://learn.microsoft.com/dotnet/)
- [Guía de CI/CD en GitHub Actions](https://docs.github.com/en/actions)

---

## Licencia

MIT
