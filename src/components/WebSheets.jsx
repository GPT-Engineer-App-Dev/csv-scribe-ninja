import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Plus, Trash2, Sparkles, Key, Type, PaintBucket
} from "lucide-react";
import { create, all } from 'mathjs';
import OpenAI from "openai";
import APIKeyInput from './APIKeyInput';

const math = create(all);

const WebSheets = () => {
  // ... (previous code remains unchanged)

  const evaluateFormula = async (formula, rowIndex, colIndex) => {
    if (!formula.startsWith('=')) return formula;

    try {
      // Replace cell references with their values
      const formulaWithValues = formula.slice(1).replace(/[A-Z]\d+/g, (match) => {
        return getCellByReference(match);
      });

      // Check for LLM function
      if (formulaWithValues.startsWith('LLM(')) {
        const args = formulaWithValues.slice(4, -1).split(',').map(arg => arg.trim());
        if (args.length !== 2) return '#ERROR: Invalid LLM arguments';
        return await llmFunction(args[0], args[1]);
      }

      // Evaluate other formulas
      const scope = {
        LLM: llmFunction,
        CELL: getCellReference(rowIndex, colIndex)
      };
      const result = math.evaluate(formulaWithValues, scope);
      
      // Extract the value from the result object
      return result && typeof result === 'object' && 'value' in result ? result.value : result;
    } catch (error) {
      console.error("Formula evaluation error:", error);
      return '#ERROR';
    }
  };

  // ... (rest of the WebSheets component remains unchanged)

  return (
    // ... (previous JSX remains unchanged)
  );
};

const CellContent = React.memo(({ rowIndex, colIndex, getCellValue }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    getCellValue(rowIndex, colIndex).then(result => {
      // Convert the result to a string for display
      setValue(String(result));
    });
  }, [rowIndex, colIndex, getCellValue]);

  return <div className="h-full w-full p-1">{value}</div>;
});

export default WebSheets;