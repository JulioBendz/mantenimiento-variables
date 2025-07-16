import React from 'react';
import './App.css';
import Header from './components/Header';
import PeriodSelector from './components/PeriodSelector';
import Variables from './components/Variables';
import FormulaHistory from './components/FormulaHistory';
import Calculator from './components/Calculator';
import { usePeriods } from './hooks/usePeriods';

function App() {
  const periodsHook = usePeriods();

  const currentData = periodsHook.getCurrentPeriodData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl lg:max-w-7xl xl:max-w-screen-xl mx-auto">
        <Header />

        <PeriodSelector
          periods={periodsHook.periods}
          currentPeriod={periodsHook.currentPeriod}
          setCurrentPeriod={periodsHook.setCurrentPeriod}
          createNewPeriod={periodsHook.createNewPeriod}
          deletePeriod={periodsHook.deletePeriod}
          copyVariablesFromPreviousPeriod={periodsHook.copyVariablesFromPreviousPeriod}
          copyFormulasFromPreviousPeriod={periodsHook.copyFormulasFromPreviousPeriod}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6">
          <Variables
            variables={currentData.variables}
            variableName={periodsHook.variableName}
            setVariableName={periodsHook.setVariableName}
            variableValue={periodsHook.variableValue}
            setVariableValue={periodsHook.setVariableValue}
            addVariable={periodsHook.addVariable}
            removeVariable={periodsHook.removeVariable}
            editVariable={periodsHook.editVariable}
            currentPeriod={periodsHook.periods[periodsHook.currentPeriod]?.name}
          />

          <FormulaHistory
            savedFormulas={currentData.formulas}
            removeFormula={periodsHook.removeFormula}
            reuseFormula={periodsHook.reuseFormula}
            editFormulaName={periodsHook.editFormulaName}
            currentPeriod={periodsHook.periods[periodsHook.currentPeriod]?.name}
            variables={currentData.variables}
          />

          <Calculator
            formula={periodsHook.formula}
            setFormula={periodsHook.setFormula}
            formulaName={periodsHook.formulaName}
            setFormulaName={periodsHook.setFormulaName}
            calculateFormula={periodsHook.calculateFormula}
            result={periodsHook.result}
            variables={currentData.variables}
            currentPeriod={periodsHook.periods[periodsHook.currentPeriod]?.name}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
