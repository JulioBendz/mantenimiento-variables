import { create, all } from 'mathjs';

const math = create(all);

/**
 * Evalúa una fórmula matemática reemplazando las variables por sus valores.
 * @param {string} formula - La fórmula como string, por ejemplo "a + b * c"
 * @param {object} variables - Un objeto con los valores de las variables, ej: { a: 2, b: 3, c: 4 }
 * @returns {number|string} - El resultado numérico o un mensaje de error
 */
export function evaluateFormula(formula, variables) {
  try {
    // Convierte comas decimales a puntos
    let evaluableFormula = formula.replace(/(\d+),(\d+)/g, '$1.$2');
    // Reemplaza cada variable por su valor
    Object.keys(variables).forEach(varName => {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      evaluableFormula = evaluableFormula.replace(regex, variables[varName]);
    });
    // Evalúa la fórmula
    // eslint-disable-next-line no-new-func
    return Function(`"use strict";return (${evaluableFormula})`)();
  } catch (error) {
    return 'Error en la fórmula';
  }
}