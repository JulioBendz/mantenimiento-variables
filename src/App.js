import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Variables from './components/Variables';
import FormulaHistory from './components/FormulaHistory';
import Calculator from './components/Calculator';

function App() {
  const [variables, setVariables] = useState({});
  const [variableName, setVariableName] = useState('');
  const [variableValue, setVariableValue] = useState('');
  const [formula, setFormula] = useState('');
  const [formulaName, setFormulaName] = useState('');
  const [result, setResult] = useState(null);
  const [savedFormulas, setSavedFormulas] = useState([]);

  const addVariable = () => {
    if (variableName && variableValue) {
      // Verificar si la variable ya existe
      if (variables[variableName]) {
        const confirmReplace = window.confirm(
          `La variable "${variableName}" ya existe con el valor ${variables[variableName]}.\n\n¿Deseas reemplazar el valor actual con ${variableValue}?`
        );
        
        if (!confirmReplace) {
          return; // No hacer nada si el usuario cancela
        }
      }

      setVariables(prev => ({
        ...prev,
        [variableName]: parseFloat(variableValue)
      }));
      setVariableName('');
      setVariableValue('');
    }
  };

  const removeVariable = (name) => {
    setVariables(prev => {
      const newVars = { ...prev };
      delete newVars[name];
      return newVars;
    });
  };

  // Nueva función para editar variables
  const editVariable = (name, newValue) => {
    setVariables(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const calculateFormula = () => {
    try {
      // Reemplazar variables en la fórmula
      let evaluableFormula = formula;
      Object.keys(variables).forEach(varName => {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        evaluableFormula = evaluableFormula.replace(regex, variables[varName]);
      });
      
      // Evaluar la fórmula (en un entorno real, usar una librería más segura)
      const calculatedResult = Function(`"use strict"; return (${evaluableFormula})`)();
      setResult(calculatedResult);
      
      // Generar nombre de fórmula
      const finalFormulaName = formulaName || `Fórmula ${Date.now()}`;
      
      // Verificar si ya existe una fórmula con el mismo nombre
      const existingFormula = savedFormulas.find(f => f.name === finalFormulaName);
      
      if (existingFormula) {
        const confirmReplace = window.confirm(
          `Ya existe una fórmula con el nombre "${finalFormulaName}".\n\nFórmula existente: ${existingFormula.originalFormula}\nResultado existente: ${existingFormula.result}\n\nNueva fórmula: ${formula}\nNuevo resultado: ${calculatedResult}\n\n¿Deseas reemplazar la fórmula existente?`
        );
        
        if (!confirmReplace) {
          return; // No hacer nada si el usuario cancela
        }
        
        // Reemplazar la fórmula existente
        setSavedFormulas(prev => 
          prev.map(f => 
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
        );
      } else {
        // Agregar nueva fórmula
        const newFormulaEntry = {
          id: Date.now(),
          name: finalFormulaName,
          originalFormula: formula,
          evaluatedFormula: evaluableFormula,
          result: calculatedResult,
          timestamp: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString()
        };
        
        setSavedFormulas(prev => [newFormulaEntry, ...prev]);
      }
      
      setFormulaName('');
    } catch (error) {
      setResult('Error en la fórmula');
    }
  };

  const removeFormula = (id) => {
    setSavedFormulas(prev => prev.filter(formula => formula.id !== id));
  };

  const reuseFormula = (formulaEntry) => {
    setFormula(formulaEntry.originalFormula);
    setFormulaName(formulaEntry.name + ' (copia)');
  };

  const editFormulaName = (id, newName) => {
    // Verificar si ya existe una fórmula con el nuevo nombre
    const existingFormula = savedFormulas.find(f => f.name === newName && f.id !== id);
    
    if (existingFormula) {
      const confirmReplace = window.confirm(
        `Ya existe una fórmula con el nombre "${newName}".\n\nFórmula existente: ${existingFormula.originalFormula}\nResultado existente: ${existingFormula.result}\n\n¿Deseas reemplazar la fórmula existente con esta?`
      );
      
      if (!confirmReplace) {
        return; // No hacer nada si el usuario cancela
      }
      
      // Obtener la fórmula que se está editando
      const formulaBeingEdited = savedFormulas.find(f => f.id === id);
      
      // Reemplazar la fórmula existente con los datos de la que se está editando
      setSavedFormulas(prev => 
        prev.filter(f => f.id !== id) // Remover la fórmula que se está editando
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
      );
    } else {
      // Simplemente cambiar el nombre si no hay conflicto
      setSavedFormulas(prev => 
        prev.map(formula => 
          formula.id === id 
            ? { ...formula, name: newName || formula.name }
            : formula
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl lg:max-w-7xl xl:max-w-screen-xl mx-auto">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <Variables
            variables={variables}
            variableName={variableName}
            setVariableName={setVariableName}
            variableValue={variableValue}
            setVariableValue={setVariableValue}
            addVariable={addVariable}
            removeVariable={removeVariable}
            editVariable={editVariable}
          />

          <FormulaHistory
            savedFormulas={savedFormulas}
            removeFormula={removeFormula}
            reuseFormula={reuseFormula}
            editFormulaName={editFormulaName}
          />

          <Calculator
            formula={formula}
            setFormula={setFormula}
            formulaName={formulaName}
            setFormulaName={setFormulaName}
            calculateFormula={calculateFormula}
            result={result}
            variables={variables}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
