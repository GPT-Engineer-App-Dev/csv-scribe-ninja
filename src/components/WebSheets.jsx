import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, Plus, Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { evaluate } from 'mathjs';

const WebSheets = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [formulaBar, setFormulaBar] = useState('');

  useEffect(() => {
    // Initialize with some default data
    const defaultHeaders = ['A', 'B', 'C', 'D', 'E'];
    const defaultData = Array(10).fill().map(() => Array(5).fill(''));
    setHeaders(defaultHeaders);
    setData(defaultData);
  }, []);

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WebSheets</h1>
      <div className="mb-4 flex space-x-2">
        <Button onClick={() => formatCell('bold')}><Bold className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('italic')}><Italic className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('underline')}><Underline className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('left')}><AlignLeft className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('center')}><AlignCenter className="h-4 w-4" /></Button>
        <Button onClick={() => formatCell('right')}><AlignRight className="h-4 w-4" /></Button>
      </div>
      <div className="mb-4">
        <Input
          value={formulaBar}
          onChange={handleFormulaBarChange}
          placeholder="Enter formula or value"
          className="w-full"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              {headers.map((header, index) => (
                <TableHead key={index} className="relative">
                  {header}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0"
                    onClick={() => deleteColumn(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="font-medium">{rowIndex + 1}</TableCell>
                {row.map((cell, colIndex) => (
                  <TableCell key={colIndex} className="p-0">
                    <Input
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                      className="h-full w-full border-none"
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => deleteRow(rowIndex)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex justify-between">
        <Button onClick={addRow}>
          <Plus className="mr-2 h-4 w-4" /> Add Row
        </Button>
        <Button onClick={addColumn}>
          <Plus className="mr-2 h-4 w-4" /> Add Column
        </Button>
      </div>
    </div>
  );
};

export default WebSheets;