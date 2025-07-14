import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import PeriodSelector from './components/PeriodSelector';
import Variables from './components/Variables';
import FormulaHistory from './components/FormulaHistory';
import Calculator from './components/Calculator';

// Configuración simple para API futura
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  // Función para obtener la clave del período actual (mes/año actual)
  const getCurrentPeriodKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  // Función para obtener el nombre del mes
  const getMonthName = (month) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month - 1];
  };

  // Estado principal organizado por períodos
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
  
  // Período actual seleccionado (por defecto el actual)
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriodKey());
  
  // Estados locales para el período actual
  const [variableName, setVariableName] = useState('');
  const [variableValue, setVariableValue] = useState('');
  const [formula, setFormula] = useState('');
  const [formulaName, setFormulaName] = useState('');
  const [result, setResult] = useState(null);

  // Obtener datos del período actual
  const getCurrentPeriodData = () => {
    return periods[currentPeriod] || { variables: {}, formulas: [] };
  };

  // Función helper para verificar si una fórmula usa una variable específica
  const formulaUsesVariable = (formula, variableName) => {
    const regex = new RegExp(`\\b${variableName}\\b`);
    return regex.test(formula.originalFormula);
  };

  // Función optimizada para recalcular solo fórmulas afectadas por una variable específica
  const recalculateFormulasForVariable = (variableName, targetPeriod = currentPeriod) => {
    const periodData = periods[targetPeriod];
    if (!periodData || periodData.formulas.length === 0) return;

    const updatedFormulas = periodData.formulas.map(formula => {
      // Solo procesar fórmulas que usan esta variable
      if (!formulaUsesVariable(formula, variableName)) {
        return formula; // No cambiar nada si no usa la variable
      }

      try {
        // Reemplazar variables en la fórmula
        let evaluableFormula = formula.originalFormula;
        Object.keys(periodData.variables).forEach(varName => {
          const regex = new RegExp(`\\b${varName}\\b`, 'g');
          evaluableFormula = evaluableFormula.replace(regex, periodData.variables[varName]);
        });
        
        // Calcular nuevo resultado
        const calculatedResult = Function(`"use strict"; return (${evaluableFormula})`)();
        
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

  // Función mejorada para recalcular todas las fórmulas (para casos generales)
  const recalculateAllFormulas = (targetPeriod = currentPeriod) => {
    const periodData = periods[targetPeriod];
    if (!periodData || periodData.formulas.length === 0) return;

    const updatedFormulas = periodData.formulas.map(formula => {
      try {
        // Reemplazar variables en la fórmula
        let evaluableFormula = formula.originalFormula;
        Object.keys(periodData.variables).forEach(varName => {
          const regex = new RegExp(`\\b${varName}\\b`, 'g');
          evaluableFormula = evaluableFormula.replace(regex, periodData.variables[varName]);
        });
        
        // Calcular nuevo resultado
        const calculatedResult = Function(`"use strict"; return (${evaluableFormula})`)();
        
        // Verificar si el resultado realmente cambió
        const resultChanged = formula.result !== calculatedResult;
        const evaluationChanged = formula.evaluatedFormula !== evaluableFormula;
        
        // Solo actualizar timestamp si hubo cambios reales
        const shouldUpdateTimestamp = resultChanged || evaluationChanged || !formula.lastRecalculated;
        
        return {
          ...formula,
          evaluatedFormula: evaluableFormula,
          result: calculatedResult,
          lastRecalculated: shouldUpdateTimestamp ? new Date().toLocaleTimeString() : formula.lastRecalculated
        };
      } catch (error) {
        // En caso de error, verificar si el error es nuevo
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

  // Effects para recálculo automático - CORREGIDOS
  useEffect(() => {
    const currentData = getCurrentPeriodData();
    if (currentData.formulas.length > 0) {
      recalculateAllFormulas();
    }
  }, [currentPeriod]); // Solo cuando cambie el período

  // Nuevo useEffect para detectar cambios en variables del período actual
  useEffect(() => {
    const currentData = getCurrentPeriodData();
    if (currentData.formulas.length > 0) {
      const timeoutId = setTimeout(() => {
        recalculateAllFormulas(currentPeriod);
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [periods[currentPeriod]?.variables]); // Detecta cambios en variables

  // Nuevo useEffect para detectar cambios en fórmulas del período actual
  useEffect(() => {
    const currentData = getCurrentPeriodData();
    if (currentData.formulas.length > 0) {
      const timeoutId = setTimeout(() => {
        recalculateAllFormulas(currentPeriod);
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [periods[currentPeriod]?.formulas?.length]); // Detecta cuando se agregan/eliminan fórmulas

  // Función para crear un nuevo período
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

  // Función para eliminar un período
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

      // Si se elimina el período actual, cambiar a otro período
      if (currentPeriod === periodKey) {
        const remainingPeriods = Object.keys(periods).filter(key => key !== periodKey);
        setCurrentPeriod(remainingPeriods[0]);
      }
    }
  };

  // Función para copiar variables del período anterior (CORREGIDA)
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

      // El recálculo automático se ejecutará por el useEffect que detecta cambios en variables
    }
  };

  // Función para copiar fórmulas del período anterior (CORREGIDA)
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
      // Copiar fórmulas con nuevos IDs y timestamps
      const copiedFormulas = sourceFormulas.map(formula => ({
        ...formula,
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        result: null, // Se recalculará automáticamente
        evaluatedFormula: null, // Se recalculará automáticamente
        lastRecalculated: null
      }));
      
      setPeriods(prev => ({
        ...prev,
        [targetPeriod]: {
          ...prev[targetPeriod],
          formulas: [...prev[targetPeriod].formulas, ...copiedFormulas]
        }
      }));

      // El recálculo automático se ejecutará por el useEffect que detecta cambios en la longitud de fórmulas
    }
  };

  // Funciones adaptadas para trabajar con períodos
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
      // El recálculo automático se ejecutará por el useEffect que detecta cambios en variables
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
    // El recálculo automático se ejecutará por el useEffect que detecta cambios en variables
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
    // El recálculo automático se ejecutará por el useEffect que detecta cambios en variables
  };

  const calculateFormula = () => {
    try {
      const currentData = getCurrentPeriodData();
      
      // Reemplazar variables en la fórmula
      let evaluableFormula = formula;
      Object.keys(currentData.variables).forEach(varName => {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        evaluableFormula = evaluableFormula.replace(regex, currentData.variables[varName]);
      });
      
      const calculatedResult = Function(`"use strict"; return (${evaluableFormula})`)();
      setResult(calculatedResult);
      
      const finalFormulaName = formulaName || `Fórmula ${Date.now()}`;
      const existingFormula = currentData.formulas.find(f => f.name === finalFormulaName);
      
      if (existingFormula) {
        const confirmReplace = window.confirm(
          `Ya existe una fórmula con el nombre "${finalFormulaName}" en ${periods[currentPeriod].name}.\n\n¿Deseas reemplazar la fórmula existente?`
        );
        
        if (!confirmReplace) return;
        
        // Reemplazar fórmula existente
        setPeriods(prev => ({
          ...prev,
          [currentPeriod]: {
            ...prev[currentPeriod],
            formulas: prev[currentPeriod].formulas.map(f => 
              f.name === finalFormulaName 
                ? {
                    ...f,
                    originalFormula: formula,
                    evaluatedFormula: evaluableFormula,
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
        // Agregar nueva fórmula
        const newFormulaEntry = {
          id: Date.now(),
          name: finalFormulaName,
          originalFormula: formula,
          evaluatedFormula: evaluableFormula,
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
      
      // Lógica de reemplazo similar a antes
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

  const currentData = getCurrentPeriodData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl lg:max-w-7xl xl:max-w-screen-xl mx-auto">
        <Header />

        {/* Selector de período */}
        <PeriodSelector
          periods={periods}
          currentPeriod={currentPeriod}
          setCurrentPeriod={setCurrentPeriod}
          createNewPeriod={createNewPeriod}
          deletePeriod={deletePeriod}
          copyVariablesFromPreviousPeriod={copyVariablesFromPreviousPeriod}
          copyFormulasFromPreviousPeriod={copyFormulasFromPreviousPeriod}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6">
          <Variables
            variables={currentData.variables}
            variableName={variableName}
            setVariableName={setVariableName}
            variableValue={variableValue}
            setVariableValue={setVariableValue}
            addVariable={addVariable}
            removeVariable={removeVariable}
            editVariable={editVariable}
            currentPeriod={periods[currentPeriod]?.name}
          />

          <FormulaHistory
            savedFormulas={currentData.formulas}
            removeFormula={removeFormula}
            reuseFormula={reuseFormula}
            editFormulaName={editFormulaName}
            currentPeriod={periods[currentPeriod]?.name}
            variables={currentData.variables}
          />

          <Calculator
            formula={formula}
            setFormula={setFormula}
            formulaName={formulaName}
            setFormulaName={setFormulaName}
            calculateFormula={calculateFormula}
            result={result}
            variables={currentData.variables}
            currentPeriod={periods[currentPeriod]?.name}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
