import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ExcelDebugger() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testExcelImport = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://cdn.builder.io/o/assets%2F1d4ff3bbccd84e4e83b5f5b6a234adb0%2F1328ed5dadf04425a7d8a20ec5785fbb?alt=media&token=d1c3f020-ad03-4d6f-9c98-df1334b5ebf8&apiKey=1d4ff3bbccd84e4e83b5f5b6a234adb0');
      const arrayBuffer = await response.arrayBuffer();
      
      const workbook = XLSX.read(arrayBuffer);
      console.log('Workbook:', workbook);
      console.log('Sheet Names:', workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      console.log('Worksheet:', worksheet);
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log('JSON Data:', jsonData);
      
      // Also get the headers
      const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
      console.log('Headers:', headers);
      
      setDebugData({
        sheetNames: workbook.SheetNames,
        headers,
        sampleRows: jsonData.slice(0, 5),
        totalRows: jsonData.length,
        allData: jsonData
      });
    } catch (error) {
      console.error('Error loading Excel:', error);
      setDebugData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Excel Import Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testExcelImport} disabled={loading}>
          {loading ? 'Loading...' : 'Test Excel Import'}
        </Button>
        
        {debugData && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Debug Results:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
