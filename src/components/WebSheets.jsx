import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Plus, Trash2, Sparkles, Key, Type, PaintBucket
} from "lucide-react";
import { evaluate } from 'mathjs';
import OpenAI from "openai";
import APIKeyInput from './APIKeyInput';

const WebSheets = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [formulaBar, setFormulaBar] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [openai, setOpenai] = useState(null);
  const [showApiInput, setShowApiInput] = useState(true);
  const [activeTool, setActiveTool] = useState(null);
  const sheetRef = useRef(null);

  useEffect(() => {
    const defaultHeaders = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const defaultData = Array(20).fill().map(() => Array(8).fill(''));
    setHeaders(defaultHeaders);
    setData(defaultData);
  }, []);

  const handleApiKeySubmit = (key) => {
    setApiKey(key);
    setOpenai(new OpenAI({ 
      apiKey: key, 
      dangerouslyAllowBrowser: true // Note: This is not recommended for production use
    }));
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
      const response = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates interesting content for spreadsheet cells." },
          { role: "user", content: "Generate a short, interesting fact or piece of data for a spreadsheet cell." }
        ],
        max_tokens: 50,
      });

      const generatedContent = response.choices[0].message.content.trim();
      handleCellChange(selectedCell.row, selectedCell.col, generatedContent);
    } catch (error) {
      console.error("Error generating content:", error);
    }
  };

  const handleCellClick = (rowIndex, colIndex, event) => {
    if (event.shiftKey && selectedCell) {
      setSelectedRange({
        startRow: Math.min(selectedCell.row, rowIndex),
        endRow: Math.max(selectedCell.row, rowIndex),
        startCol: Math.min(selectedCell.col, colIndex),
        endCol: Math.max(selectedCell.col, colIndex)
      });
    } else {
      setSelectedCell({ row: rowIndex, col: colIndex });
      setSelectedRange(null);
      setFormulaBar(data[rowIndex][colIndex]);
    }
  };

  const isCellSelected = (rowIndex, colIndex) => {
    if (selectedRange) {
      return rowIndex >= selectedRange.startRow && rowIndex <= selectedRange.endRow &&
             colIndex >= selectedRange.startCol && colIndex <= selectedRange.endCol;
    }
    return selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex;
  };

  const applyActiveTool = (rowIndex, colIndex) => {
    if (!activeTool) return;

    const newData = [...data];
    let currentValue = newData[rowIndex][colIndex];

    switch (activeTool) {
      case 'textColor':
        currentValue = `textColor(red,${currentValue})`;
        break;
      case 'bgColor':
        currentValue = `bgColor(yellow,${currentValue})`;
        break;
      // Add more cases for other tools
    }

    newData[rowIndex][colIndex] = currentValue;
    setData(newData);
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
      <div className="mb-4 flex space-x-2 bg-white p-2 rounded shadow">
        <Button onClick={() => formatCell('bold')} variant="ghost" size="sm"><Bold className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('italic')} variant="ghost" size="sm"><Italic className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('underline')} variant="ghost" size="sm"><Underline className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('left')} variant="ghost" size="sm"><AlignLeft className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('center')} variant="ghost" size="sm"><AlignCenter className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('right')} variant="ghost" size="sm"><AlignRight className="h-4 w-4" /></Button>
        <Button onClick={() => setActiveTool('textColor')} variant="ghost" size="sm"><Type className="h-4 w-4" /></Button>
        <Button onClick={() => setActiveTool('bgColor')} variant="ghost" size="sm"><PaintBucket className="h-4 w-4" /></Button>
        <Button onClick={generateContent} variant="ghost" size="sm" disabled={!openai}>
          <Sparkles className="h-4 w-4 mr-2" /> Generate Content
        </Button>
      </div>
      <div className="mb-4 flex items-center bg-white rounded shadow">
        <div className="p-2 font-bold text-gray-600">fx</div>
        <Input
          value={formulaBar}
          onChange={handleFormulaBarChange}
          placeholder="Enter formula or value"
          className="flex-grow border-none focus:ring-0"
        />
      </div>
      <div className="overflow-x-auto bg-white rounded shadow" ref={sheetRef}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-10 bg-gray-100 border border-gray-300 p-2"></th>
              {headers.map((header, index) => (
                <th key={index} className="sticky top-0 z-10 bg-gray-100 border border-gray-300 p-2 relative min-w-[100px]">
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
              <tr key={rowIndex}>
                <td className="sticky left-0 bg-gray-100 border border-gray-300 p-2 font-medium text-gray-500">{rowIndex + 1}</td>
                {row.map((cell, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={`border border-gray-300 p-0 relative ${isCellSelected(rowIndex, colIndex) ? 'bg-blue-100' : ''}`}
                    onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                    onMouseEnter={() => applyActiveTool(rowIndex, colIndex)}
                  >
                    <div className="absolute inset-0 pointer-events-none" dangerouslySetInnerHTML={{ __html: getCellValue(rowIndex, colIndex) }} />
                    <Input
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
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