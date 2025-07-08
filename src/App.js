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
      
      // Guardar la fórmula calculada con nombre personalizado
      const newFormulaEntry = {
        id: Date.now(),
        name: formulaName || `Fórmula ${Date.now()}`,
        originalFormula: formula,
        evaluatedFormula: evaluableFormula,
        result: calculatedResult,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
      };
      
      setSavedFormulas(prev => [newFormulaEntry, ...prev]);
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
    setSavedFormulas(prev => 
      prev.map(formula => 
        formula.id === id 
          ? { ...formula, name: newName || formula.name }
          : formula
      )
    );
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
