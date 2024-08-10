import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus, Trash2, Sparkles, Key } from "lucide-react";
import { evaluate } from 'mathjs';
import OpenAI from "openai";
import APIKeyInput from './APIKeyInput';

const WebSheets = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [formulaBar, setFormulaBar] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [openai, setOpenai] = useState(null);
  const [showApiInput, setShowApiInput] = useState(true);

  useEffect(() => {
    const defaultHeaders = ['A', 'B', 'C', 'D', 'E'];
    const defaultData = Array(10).fill().map(() => Array(5).fill(''));
    setHeaders(defaultHeaders);
    setData(defaultData);
  }, []);

  const handleApiKeySubmit = (key) => {
    setApiKey(key);
    setOpenai(new OpenAI({ apiKey: key }));
    setShowApiInput(false);
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  const addRow = () => {
    const newRow = new Array(headers.length).fill('');
    setData([...data, newRow]);
  };

  const deleteRow = (rowIndex) => {
    const newData = data.filter((_, index) => index !== rowIndex);
    setData(newData);
  };

  const addColumn = () => {
    const newHeaders = [...headers, String.fromCharCode(65 + headers.length)];
    const newData = data.map(row => [...row, '']);
    setHeaders(newHeaders);
    setData(newData);
  };

  const deleteColumn = (colIndex) => {
    const newHeaders = headers.filter((_, index) => index !== colIndex);
    const newData = data.map(row => row.filter((_, index) => index !== colIndex));
    setHeaders(newHeaders);
    setData(newData);
  };

  const handleFormulaBarChange = (e) => {
    setFormulaBar(e.target.value);
    if (selectedCell) {
      handleCellChange(selectedCell.row, selectedCell.col, e.target.value);
    }
  };

  const evaluateFormula = (formula) => {
    if (formula.startsWith('=')) {
      try {
        return evaluate(formula.slice(1));
      } catch (error) {
        return '#ERROR!';
      }
    }
    return formula;
  };

  const getCellValue = (rowIndex, colIndex) => {
    const cellValue = data[rowIndex][colIndex];
    return evaluateFormula(cellValue);
  };

  const formatCell = (format) => {
    if (selectedCell) {
      const newData = [...data];
      const currentValue = newData[selectedCell.row][selectedCell.col];
      newData[selectedCell.row][selectedCell.col] = `${format}(${currentValue})`;
      setData(newData);
    }
  };

  const generateContent = async () => {
    if (!openai || !selectedCell) return;

    try {
      const response = await openai.completions.create({
        model: "text-davinci-002",
        prompt: "Generate a short, interesting fact or piece of data for a spreadsheet cell.",
        max_tokens: 50,
      });

      const generatedContent = response.choices[0].text.trim();
      handleCellChange(selectedCell.row, selectedCell.col, generatedContent);
    } catch (error) {
      console.error("Error generating content:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">WebSheets</h1>
      {showApiInput ? (
        <APIKeyInput onApiKeySubmit={handleApiKeySubmit} />
      ) : (
        <Button onClick={() => setShowApiInput(true)} className="mb-4">
          <Key className="mr-2 h-4 w-4" /> Change API Key
        </Button>
      )}
      <div className="mb-4 flex space-x-2 bg-gray-200 p-2 rounded">
        <Button onClick={() => formatCell('bold')} variant="ghost" size="sm" className="bg-gray-800 text-white"><Bold className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('italic')} variant="ghost" size="sm" className="bg-gray-800 text-white"><Italic className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('underline')} variant="ghost" size="sm" className="bg-gray-800 text-white"><Underline className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('left')} variant="ghost" size="sm" className="bg-gray-800 text-white"><AlignLeft className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('center')} variant="ghost" size="sm" className="bg-gray-800 text-white"><AlignCenter className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('right')} variant="ghost" size="sm" className="bg-gray-800 text-white"><AlignRight className="h-4 w-4" /></Button>
        <Button onClick={generateContent} variant="ghost" size="sm" className="bg-gray-800 text-white" disabled={!openai}>
          <Sparkles className="h-4 w-4 mr-2" /> Generate Content
        </Button>
      </div>
      <div className="mb-4">
        <Input
          value={formulaBar}
          onChange={handleFormulaBarChange}
          placeholder="Enter formula or value"
          className="w-full border-2 border-gray-300"
        />
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2"></th>
              {headers.map((header, index) => (
                <th key={index} className="border border-gray-300 p-2 relative">
                  {header}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
                    onClick={() => deleteColumn(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border border-gray-300 p-2 font-medium text-gray-500">{rowIndex + 1}</td>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border border-gray-300 p-0">
                    <Input
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                      className="h-full w-full border-none bg-transparent"
                    />
                  </td>
                ))}
                <td className="border border-gray-300 p-2">
                  <Button variant="ghost" size="sm" onClick={() => deleteRow(rowIndex)} className="text-gray-500 hover:text-gray-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between">
        <Button onClick={addRow} className="bg-gray-800 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Row
        </Button>
        <Button onClick={addColumn} className="bg-gray-800 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Column
        </Button>
      </div>
    </div>
  );
};

export default WebSheets;