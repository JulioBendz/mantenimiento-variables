import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import PeriodSelector from './components/PeriodSelector';
import Variables from './components/Variables';
import FormulaHistory from './components/FormulaHistory';
import Calculator from './components/Calculator';

function App() {
  // Estado principal organizado por períodos
  const [periods, setPeriods] = useState({
    '2025-01': {
      variables: {},
      formulas: [],
      created: new Date('2025-01-01').toISOString(),
      name: 'Plantilla 2025'
    }
  });
  
  // Período actual seleccionado
  const [currentPeriod, setCurrentPeriod] = useState('2025-01');
  
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

  // Función para copiar variables del período anterior (modificada para aceptar período específico)
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

  // Función para copiar fórmulas del período anterior (modificada para aceptar período específico)
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
        result: null, // Se recalculará
        evaluatedFormula: null // Se recalculará
      }));
      
      setPeriods(prev => ({
        ...prev,
        [targetPeriod]: {
          ...prev[targetPeriod],
          formulas: copiedFormulas
        }
      }));
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
                    date: new Date().toLocaleDateString()
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
          period: currentPeriod
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
                    date: formulaBeingEdited.date
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

  // Función helper para nombres de meses
  const getMonthName = (month) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month - 1];
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
