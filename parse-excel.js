const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('/tmp/expense_data.xlsx');
const sheetName = workbook.SheetNames[0];
console.log('Sheet Names:', workbook.SheetNames);

const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Headers:', Object.keys(data[0] || {}));
console.log('First 3 rows:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));
console.log('Total rows:', data.length);

// Save the data to a JSON file for inspection
fs.writeFileSync('excel-data.json', JSON.stringify(data, null, 2));
console.log('Data saved to excel-data.json');
