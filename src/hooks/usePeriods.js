import { useState, useEffect } from 'react';
import { evaluateFormula } from '../utils/formulaUtils';

export function usePeriods() {
  // Helpers
  const getCurrentPeriodKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  const getMonthName = (month) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month - 1];
  };

  // Estado principal
  const [periods, setPeriods] = useState(() => {
    const currentPeriodKey = getCurrentPeriodKey();
    const now = new Date();
    const currentMonthName = getMonthName(now.getMonth() + 1);
    const currentYear = now.getFullYear();

    return {
      [currentPeriodKey]: {
        variables: {},
        formulas: [],
        created: new Date().toISOString(),
        name: `${currentMonthName} ${currentYear}`
      }
    };
  });

  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriodKey());
  const [variableName, setVariableName] = useState('');
  const [variableValue, setVariableValue] = useState('');
  const [formula, setFormula] = useState('');
  const [formulaName, setFormulaName] = useState('');
  const [result, setResult] = useState(null);

  // Helpers
  const getCurrentPeriodData = () => periods[currentPeriod] || { variables: {}, formulas: [] };

  const formulaUsesVariable = (formula, variableName) => {
    const regex = new RegExp(`\\b${variableName}\\b`);
    return regex.test(formula.originalFormula);
  };

  // Recalcular solo fórmulas afectadas por una variable
  const recalculateFormulasForVariable = (variableName, targetPeriod = currentPeriod) => {
    const periodData = periods[targetPeriod];
    if (!periodData || periodData.formulas.length === 0) return;

    const updatedFormulas = periodData.formulas.map(formula => {
      if (!formulaUsesVariable(formula, variableName)) return formula;
      try {
        // Reemplazo para mostrar en la UI
        let evaluableFormula = formula.originalFormula;
        Object.keys(periodData.variables).forEach(varName => {
          const regex = new RegExp(`\\b${varName}\\b`, 'g');
          evaluableFormula = evaluableFormula.replace(regex, periodData.variables[varName]);
        });
        // Evaluación centralizada
        const calculatedResult = evaluateFormula(formula.originalFormula, periodData.variables);
        return {
          ...formula,
          evaluatedFormula: evaluableFormula,
          result: calculatedResult,
          lastRecalculated: new Date().toLocaleTimeString()
        };
      } catch (error) {
        return {
          ...formula,
          evaluatedFormula: 'Error en evaluación',
          result: 'Error en la fórmula',
          lastRecalculated: new Date().toLocaleTimeString()
        };
      }
    });

    setPeriods(prev => ({
      ...prev,
      [targetPeriod]: {
        ...prev[targetPeriod],
        formulas: updatedFormulas
      }
    }));
  };

  // Recalcular todas las fórmulas
  const recalculateAllFormulas = (targetPeriod = currentPeriod) => {
    const periodData = periods[targetPeriod];
    if (!periodData || periodData.formulas.length === 0) return;

    const updatedFormulas = periodData.formulas.map(formula => {
      try {
        // Reemplazo para mostrar en la UI
        let evaluableFormula = formula.originalFormula;
        Object.keys(periodData.variables).forEach(varName => {
          const regex = new RegExp(`\\b${varName}\\b`, 'g');
          evaluableFormula = evaluableFormula.replace(regex, periodData.variables[varName]);
        });
        // Evaluación centralizada
        const calculatedResult = evaluateFormula(formula.originalFormula, periodData.variables);
        const resultChanged = formula.result !== calculatedResult;
        const evaluationChanged = formula.evaluatedFormula !== evaluableFormula;
        const shouldUpdateTimestamp = resultChanged || evaluationChanged || !formula.lastRecalculated;
        return {
          ...formula,
          evaluatedFormula: evaluableFormula,
          result: calculatedResult,
          lastRecalculated: shouldUpdateTimestamp ? new Date().toLocaleTimeString() : formula.lastRecalculated
        };
      } catch (error) {
        const errorChanged = formula.result !== 'Error en la fórmula' || formula.evaluatedFormula !== 'Error en evaluación';
        return {
          ...formula,
          evaluatedFormula: 'Error en evaluación',
          result: 'Error en la fórmula',
          lastRecalculated: errorChanged ? new Date().toLocaleTimeString() : formula.lastRecalculated
        };
      }
    });

    setPeriods(prev => ({
      ...prev,
      [targetPeriod]: {
        ...prev[targetPeriod],
        formulas: updatedFormulas
      }
    }));
  };

  // Effects para recálculo automático
  useEffect(() => {
    const currentData = getCurrentPeriodData();
    if (currentData.formulas.length > 0) {
      recalculateAllFormulas();
    }
  }, [currentPeriod]);

  useEffect(() => {
    const currentData = getCurrentPeriodData();
    if (currentData.formulas.length > 0) {
      const timeoutId = setTimeout(() => {
        recalculateAllFormulas(currentPeriod);
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [periods[currentPeriod]?.variables]);

  useEffect(() => {
    const currentData = getCurrentPeriodData();
    if (currentData.formulas.length > 0) {
      const timeoutId = setTimeout(() => {
        recalculateAllFormulas(currentPeriod);
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [periods[currentPeriod]?.formulas?.length]);

  // CRUD de períodos, variables y fórmulas
  const createNewPeriod = (year, month, name) => {
    const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
    if (periods[periodKey]) {
      alert(`Ya existe un período para ${name}`);
      return;
    }
    const newPeriod = {
      variables: {},
      formulas: [],
      created: new Date().toISOString(),
      name: name || `${getMonthName(month)} ${year}`
    };
    setPeriods(prev => ({
      ...prev,
      [periodKey]: newPeriod
    }));
    setCurrentPeriod(periodKey);
  };

  const deletePeriod = (periodKey) => {
    if (Object.keys(periods).length === 1) {
      alert('No puedes eliminar el último período. Debe existir al menos uno.');
      return;
    }
    const periodToDelete = periods[periodKey];
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el período "${periodToDelete.name}"?\n\n` +
      `Variables: ${Object.keys(periodToDelete.variables).length}\n` +
      `Fórmulas: ${periodToDelete.formulas.length}\n\n` +
      `Esta acción no se puede deshacer.`
    );
    if (confirmDelete) {
      setPeriods(prev => {
        const newPeriods = { ...prev };
        delete newPeriods[periodKey];
        return newPeriods;
      });
      if (currentPeriod === periodKey) {
        const remainingPeriods = Object.keys(periods).filter(key => key !== periodKey);
        setCurrentPeriod(remainingPeriods[0]);
      }
    }
  };

  const copyVariablesFromPreviousPeriod = (targetPeriod, specificSourcePeriod = null) => {
    const periodKeys = Object.keys(periods).sort();
    const currentIndex = periodKeys.indexOf(targetPeriod);
    let sourcePeriodKey;
    if (specificSourcePeriod) {
      sourcePeriodKey = specificSourcePeriod;
    } else if (currentIndex > 0) {
      sourcePeriodKey = periodKeys[currentIndex - 1];
    } else {
      alert('No hay período anterior disponible');
      return;
    }
    if (!periods[sourcePeriodKey]) {
      alert('Período fuente no encontrado');
      return;
    }
    const sourceVariables = periods[sourcePeriodKey].variables;
    if (Object.keys(sourceVariables).length === 0) {
      alert(`No hay variables en el período ${periods[sourcePeriodKey].name}`);
      return;
    }
    const confirmCopy = window.confirm(
      `¿Deseas copiar las variables del período ${periods[sourcePeriodKey].name}?\n\nSe copiarán ${Object.keys(sourceVariables).length} variables: ${Object.keys(sourceVariables).slice(0, 3).join(', ')}${Object.keys(sourceVariables).length > 3 ? '...' : ''}\n\nPodrás cambiar sus valores después.`
    );
    if (confirmCopy) {
      setPeriods(prev => ({
        ...prev,
        [targetPeriod]: {
          ...prev[targetPeriod],
          variables: { ...sourceVariables }
        }
      }));
    }
  };

  const copyFormulasFromPreviousPeriod = (targetPeriod, specificSourcePeriod = null) => {
    const periodKeys = Object.keys(periods).sort();
    const currentIndex = periodKeys.indexOf(targetPeriod);
    let sourcePeriodKey;
    if (specificSourcePeriod) {
      sourcePeriodKey = specificSourcePeriod;
    } else if (currentIndex > 0) {
      sourcePeriodKey = periodKeys[currentIndex - 1];
    } else {
      alert('No hay período anterior disponible');
      return;
    }
    if (!periods[sourcePeriodKey]) {
      alert('Período fuente no encontrado');
      return;
    }
    const sourceFormulas = periods[sourcePeriodKey].formulas;
    if (sourceFormulas.length === 0) {
      alert(`No hay fórmulas en el período ${periods[sourcePeriodKey].name}`);
      return;
    }
    const confirmCopy = window.confirm(
      `¿Deseas copiar las fórmulas del período ${periods[sourcePeriodKey].name}?\n\nSe copiarán ${sourceFormulas.length} fórmulas: ${sourceFormulas.slice(0, 3).map(f => f.name).join(', ')}${sourceFormulas.length > 3 ? '...' : ''}\n\nSe recalcularán con las variables del período actual.`
    );
    if (confirmCopy) {
      const copiedFormulas = sourceFormulas.map(formula => ({
        ...formula,
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        result: null,
        evaluatedFormula: null,
        lastRecalculated: null
      }));
      setPeriods(prev => ({
        ...prev,
        [targetPeriod]: {
          ...prev[targetPeriod],
          formulas: [...prev[targetPeriod].formulas, ...copiedFormulas]
        }
      }));
    }
  };

  const addVariable = () => {
    if (variableName && variableValue) {
      const currentData = getCurrentPeriodData();
      if (currentData.variables[variableName]) {
        const confirmReplace = window.confirm(
          `La variable "${variableName}" ya existe en ${periods[currentPeriod].name} con el valor ${currentData.variables[variableName]}.\n\n¿Deseas reemplazar el valor actual con ${variableValue}?`
        );
        if (!confirmReplace) return;
      }
      setPeriods(prev => ({
        ...prev,
        [currentPeriod]: {
          ...prev[currentPeriod],
          variables: {
            ...prev[currentPeriod].variables,
            [variableName]: parseFloat(variableValue)
          }
        }
      }));
      setVariableName('');
      setVariableValue('');
    }
  };

  const removeVariable = (name) => {
    setPeriods(prev => {
      const newVariables = { ...prev[currentPeriod].variables };
      delete newVariables[name];
      return {
        ...prev,
        [currentPeriod]: {
          ...prev[currentPeriod],
          variables: newVariables
        }
      };
    });
  };

  const editVariable = (name, newValue) => {
    setPeriods(prev => ({
      ...prev,
      [currentPeriod]: {
        ...prev[currentPeriod],
        variables: {
          ...prev[currentPeriod].variables,
          [name]: newValue
        }
      }
    }));
  };

  // Calcular y guardar fórmula desde el calculador
  const calculateFormula = () => {
    try {
      if (!formula || !formulaName) return; // <-- Validación para evitar agregar fórmulas vacías
      const currentData = getCurrentPeriodData();
      // Limpia la fórmula antes de evaluar y guardar
      const cleanFormula = formula.replace(/\r?\n|\r/g, ' ').trim();
      // Reemplaza ^ por ** para la evaluación
      let formulaToEval = cleanFormula.replace(/\^/g, '**');
      // Evaluación centralizada
      const calculatedResult = evaluateFormula(formulaToEval, currentData.variables);
      setResult(calculatedResult);
      const finalFormulaName = formulaName || `Fórmula ${Date.now()}`;
      const existingFormula = currentData.formulas.find(f => f.name === finalFormulaName);
      if (existingFormula) {
        const confirmReplace = window.confirm(
          `Ya existe una fórmula con el nombre "${finalFormulaName}" en ${periods[currentPeriod].name}.\n\n¿Deseas reemplazar la fórmula existente?`
        );
        if (!confirmReplace) return;
        setPeriods(prev => ({
          ...prev,
          [currentPeriod]: {
            ...prev[currentPeriod],
            formulas: prev[currentPeriod].formulas.map(f =>
              f.name === finalFormulaName
                ? {
                  ...f,
                  originalFormula: formulaToEval,
                  evaluatedFormula: formulaToEval, // lo que uses para mostrar
                  result: calculatedResult,
                  timestamp: new Date().toLocaleTimeString(),
                  date: new Date().toLocaleDateString(),
                  lastRecalculated: new Date().toLocaleTimeString()
                }
                : f
            )
          }
        }));
      } else {
        const newFormulaEntry = {
          id: Date.now(),
          name: finalFormulaName,
          originalFormula: formulaToEval,
          evaluatedFormula: formulaToEval, // lo que uses para mostrar
          result: calculatedResult,
          timestamp: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString(),
          period: currentPeriod,
          lastRecalculated: new Date().toLocaleTimeString()
        };
        setPeriods(prev => ({
          ...prev,
          [currentPeriod]: {
            ...prev[currentPeriod],
            formulas: [newFormulaEntry, ...prev[currentPeriod].formulas]
          }
        }));
      }
      setFormulaName('');
    } catch (error) {
      setResult('Error en la fórmula');
    }
  };

  const removeFormula = (id) => {
    setPeriods(prev => ({
      ...prev,
      [currentPeriod]: {
        ...prev[currentPeriod],
        formulas: prev[currentPeriod].formulas.filter(formula => formula.id !== id)
      }
    }));
  };

  const reuseFormula = (formulaEntry) => {
    if (!formulaEntry) return; // <-- Validación para evitar error si es undefined
    setFormula(formulaEntry.originalFormula);
    setFormulaName(formulaEntry.name + ' (copia)');
  };

  const editFormulaName = (id, newName) => {
    const currentData = getCurrentPeriodData();
    const existingFormula = currentData.formulas.find(f => f.name === newName && f.id !== id);
    if (existingFormula) {
      const confirmReplace = window.confirm(
        `Ya existe una fórmula con el nombre "${newName}" en ${periods[currentPeriod].name}.\n\n¿Deseas reemplazar la fórmula existente?`
      );
      if (!confirmReplace) return;
      const formulaBeingEdited = currentData.formulas.find(f => f.id === id);
      setPeriods(prev => ({
        ...prev,
        [currentPeriod]: {
          ...prev[currentPeriod],
          formulas: prev[currentPeriod].formulas
            .filter(f => f.id !== id)
            .map(f =>
              f.name === newName
                ? {
                  ...f,
                  originalFormula: formulaBeingEdited.originalFormula,
                  evaluatedFormula: formulaBeingEdited.evaluatedFormula,
                  result: formulaBeingEdited.result,
                  timestamp: formulaBeingEdited.timestamp,
                  date: formulaBeingEdited.date,
                  lastRecalculated: formulaBeingEdited.lastRecalculated
                }
                : f
            )
        }
      }));
    } else {
      setPeriods(prev => ({
        ...prev,
        [currentPeriod]: {
          ...prev[currentPeriod],
          formulas: prev[currentPeriod].formulas.map(formula =>
            formula.id === id
              ? { ...formula, name: newName || formula.name }
              : formula
          )
        }
      }));
    }
  };

  // Exponer todo lo necesario
  return {
    periods,
    setPeriods,
    currentPeriod,
    setCurrentPeriod,
    variableName,
    setVariableName,
    variableValue,
    setVariableValue,
    formula,
    setFormula,
    formulaName,
    setFormulaName,
    result,
    setResult,
    getMonthName,
    getCurrentPeriodData,
    createNewPeriod,
    deletePeriod,
    copyVariablesFromPreviousPeriod,
    copyFormulasFromPreviousPeriod,
    addVariable,
    removeVariable,
    editVariable,
    calculateFormula,
    removeFormula,
    reuseFormula,
    editFormulaName
  };
}