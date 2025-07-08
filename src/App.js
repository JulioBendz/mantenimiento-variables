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
      
      // Guardar la fórmula calculada
      const newFormulaEntry = {
        id: Date.now(),
        originalFormula: formula,
        evaluatedFormula: evaluableFormula,
        result: calculatedResult,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setSavedFormulas(prev => [newFormulaEntry, ...prev]);
    } catch (error) {
      setResult('Error en la fórmula');
    }
  };

  const removeFormula = (id) => {
    setSavedFormulas(prev => prev.filter(formula => formula.id !== id));
  };

  const reuseFormula = (formulaText) => {
    setFormula(formulaText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl sm:max-w-screen-xl mx-auto">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Variables
            variables={variables}
            variableName={variableName}
            setVariableName={setVariableName}
            variableValue={variableValue}
            setVariableValue={setVariableValue}
            addVariable={addVariable}
            removeVariable={removeVariable}
          />

          <FormulaHistory
            savedFormulas={savedFormulas}
            removeFormula={removeFormula}
            reuseFormula={reuseFormula}
          />

          <Calculator
            formula={formula}
            setFormula={setFormula}
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
