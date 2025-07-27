import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';

export function ExcelParser() {
  const [data, setData] = useState<any[]>([]);

  const parseExcelFromURL = async () => {
    try {
      const response = await fetch("https://cdn.builder.io/o/assets%2F1d4ff3bbccd84e4e83b5f5b6a234adb0%2F4a6cb3077a95451493da982cea912d9f?alt=media&token=aec86c20-79c6-463f-bd85-a183f358c08a&apiKey=1d4ff3bbccd84e4e83b5f5b6a234adb0");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Parsed Excel Data:', jsonData);
      console.log('Headers:', Object.keys(jsonData[0] || {}));
      console.log('Total rows:', jsonData.length);
      
      setData(jsonData);
    } catch (error) {
      console.error('Error parsing Excel:', error);
    }
  };

  return (
    <div className="p-4">
      <Button onClick={parseExcelFromURL}>Parse Excel File</Button>
      {data.length > 0 && (
        <div className="mt-4">
          <p>Parsed {data.length} rows</p>
          <pre className="bg-gray-100 p-2 mt-2 text-xs overflow-auto max-h-96">
            {JSON.stringify(data.slice(0, 5), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
