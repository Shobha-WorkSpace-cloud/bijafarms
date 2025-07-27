import { useRef } from "react";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ExpenseRecord } from "@shared/expense-types";
import * as XLSX from "xlsx";

interface ImportExportProps {
  expenses: ExpenseRecord[];
  onImport: (expenses: ExpenseRecord[]) => Promise<void> | void;
}

export function ImportExport({ expenses, onImport }: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const exportToExcel = () => {
    try {
      // Prepare data for Excel export
      const excelData = expenses.map((expense) => ({
        Date: expense.date,
        Type: expense.type,
        Description: expense.description,
        Amount: expense.amount,
        "Paid By": expense.paidBy,
        Category: expense.category,
        "Sub-Category": expense.subCategory,
        Source: expense.source,
        Notes: expense.notes,
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better formatting
      const colWidths = [
        { wch: 12 }, // Date
        { wch: 10 }, // Type
        { wch: 30 }, // Description
        { wch: 12 }, // Amount
        { wch: 15 }, // Paid By
        { wch: 18 }, // Category
        { wch: 18 }, // Sub-Category
        { wch: 15 }, // Source
        { wch: 30 }, // Notes
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Expenses");

      // Generate filename with current date
      const today = new Date().toISOString().split("T")[0];
      const filename = `expenses_${today}.xlsx`;

      // Save the file
      XLSX.writeFile(wb, filename);

      toast({
        title: "Export Successful",
        description: `Exported ${expenses.length} transactions to ${filename}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description:
          "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    try {
      const headers = [
        "Date",
        "Type",
        "Description",
        "Amount",
        "Paid By",
        "Category",
        "Sub-Category",
        "Source",
        "Notes",
      ];
      const csvContent = [
        headers.join(","),
        ...expenses.map((expense) =>
          [
            expense.date,
            expense.type,
            `"${expense.description.replace(/"/g, '""')}"`,
            expense.amount,
            `"${expense.paidBy.replace(/"/g, '""')}"`,
            `"${expense.category.replace(/"/g, '""')}"`,
            `"${expense.subCategory.replace(/"/g, '""')}"`,
            `"${expense.source.replace(/"/g, '""')}"`,
            `"${expense.notes.replace(/"/g, '""')}"`,
          ].join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().split("T")[0];
      a.download = `expenses_${today}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${expenses.length} transactions to CSV`,
      });
    } catch (error) {
      console.error("CSV export error:", error);
      toast({
        title: "Export Failed",
        description:
          "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        let importedExpenses: ExpenseRecord[] = [];

        if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          // Handle Excel files
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log("Excel Import Debug:");
          console.log("Sheet Names:", workbook.SheetNames);
          console.log("First 3 rows:", jsonData.slice(0, 3));
          console.log("Available columns:", Object.keys(jsonData[0] || {}));

          importedExpenses = jsonData.map((row: any, index: number) => {
            // Try to map common column names with more variations
            const dateValue =
              row["Date"] ||
              row["date"] ||
              row["DATE"] ||
              row["Transaction Date"] ||
              row["transaction_date"];
            const typeValue =
              row["Type"] ||
              row["type"] ||
              row["TYPE"] ||
              row["Transaction Type"] ||
              row["Income/Expense"];
            const descriptionValue =
              row["Description"] ||
              row["description"] ||
              row["DESCRIPTION"] ||
              row["Particulars"] ||
              row["Details"] ||
              row["Narration"];
            const amountValue =
              row["Amount"] ||
              row["amount"] ||
              row["AMOUNT"] ||
              row["Value"] ||
              row["Sum"] ||
              row["Total"];
            const paidByValue =
              row["Paid By"] ||
              row["paid by"] ||
              row["PAID BY"] ||
              row["PaidBy"] ||
              row["paidBy"] ||
              row["Payer"] ||
              row["Person"];
            const categoryValue =
              row["Category"] ||
              row["category"] ||
              row["CATEGORY"] ||
              row["Expense Category"] ||
              row["Type Category"];
            const subCategoryValue =
              row["Sub-Category"] ||
              row["sub-category"] ||
              row["SUB-CATEGORY"] ||
              row["SubCategory"] ||
              row["subCategory"] ||
              row["Sub Category"];
            const sourceValue =
              row["Source"] ||
              row["source"] ||
              row["SOURCE"] ||
              row["Payment Method"] ||
              row["Mode"] ||
              row["Account"];
            const notesValue =
              row["Notes"] ||
              row["notes"] ||
              row["NOTES"] ||
              row["Remarks"] ||
              row["Comments"];

            console.log(`Row ${index}:`, {
              dateValue,
              typeValue,
              descriptionValue,
              amountValue,
              paidByValue,
              categoryValue,
              sourceValue,
              allKeys: Object.keys(row),
            });

            return {
              id: `imported_${Date.now()}_${index}`,
              date: dateValue
                ? new Date(dateValue).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              type:
                typeValue === "Income" ||
                typeValue === "income" ||
                typeValue === "INCOME"
                  ? ("Income" as const)
                  : ("Expense" as const),
              description: String(descriptionValue || "Imported transaction"),
              amount: parseFloat(String(amountValue)) || 0,
              paidBy: String(paidByValue || "Unknown"),
              category: String(categoryValue || "Other"),
              subCategory: String(subCategoryValue || "General"),
              source: String(sourceValue || "Unknown"),
              notes: String(notesValue || ""),
            };
          });
        } else if (file.name.endsWith(".csv")) {
          // Handle CSV files
          const csvText = data as string;
          const lines = csvText.split("\n");
          const headers = lines[0]
            .split(",")
            .map((h) => h.trim().replace(/"/g, ""));

          importedExpenses = lines
            .slice(1)
            .filter((line) => line.trim())
            .map((line, index) => {
              const values = line
                .split(",")
                .map((v) => v.trim().replace(/"/g, ""));
              const rowData: any = {};
              headers.forEach((header, i) => {
                rowData[header] = values[i] || "";
              });

              const dateValue =
                rowData["Date"] || rowData["date"] || rowData["DATE"];
              const typeValue =
                rowData["Type"] || rowData["type"] || rowData["TYPE"];
              const descriptionValue =
                rowData["Description"] ||
                rowData["description"] ||
                rowData["DESCRIPTION"];
              const amountValue =
                rowData["Amount"] || rowData["amount"] || rowData["AMOUNT"];
              const paidByValue =
                rowData["Paid By"] ||
                rowData["paid by"] ||
                rowData["PAID BY"] ||
                rowData["PaidBy"] ||
                rowData["paidBy"];
              const categoryValue =
                rowData["Category"] ||
                rowData["category"] ||
                rowData["CATEGORY"];
              const subCategoryValue =
                rowData["Sub-Category"] ||
                rowData["sub-category"] ||
                rowData["SUB-CATEGORY"] ||
                rowData["SubCategory"] ||
                rowData["subCategory"];
              const sourceValue =
                rowData["Source"] || rowData["source"] || rowData["SOURCE"];
              const notesValue =
                rowData["Notes"] || rowData["notes"] || rowData["NOTES"];

              return {
                id: `imported_${Date.now()}_${index}`,
                date: dateValue
                  ? new Date(dateValue).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0],
                type:
                  typeValue === "Income" || typeValue === "income"
                    ? ("Income" as const)
                    : ("Expense" as const),
                description: String(descriptionValue || "Imported transaction"),
                amount: parseFloat(String(amountValue)) || 0,
                paidBy: String(paidByValue || "Unknown"),
                category: String(categoryValue || "Other"),
                subCategory: String(subCategoryValue || "General"),
                source: String(sourceValue || "Unknown"),
                notes: String(notesValue || ""),
              };
            });
        }

        if (importedExpenses.length > 0) {
          await onImport(importedExpenses);
          toast({
            title: "Import Successful",
            description: `Imported ${importedExpenses.length} transactions from ${file.name}`,
          });
        } else {
          toast({
            title: "Import Failed",
            description: "No valid transactions found in the file.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Import Failed",
          description:
            "There was an error importing the file. Please check the format and try again.",
          variant: "destructive",
        });
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }

    // Reset file input
    event.target.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const testImportFromURL = async () => {
    try {
      const response = await fetch(
        "https://cdn.builder.io/o/assets%2F1d4ff3bbccd84e4e83b5f5b6a234adb0%2F1328ed5dadf04425a7d8a20ec5785fbb?alt=media&token=d1c3f020-ad03-4d6f-9c98-df1334b5ebf8&apiKey=1d4ff3bbccd84e4e83b5f5b6a234adb0",
      );
      const arrayBuffer = await response.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("URL Import Debug:");
      console.log("Sheet Names:", workbook.SheetNames);
      console.log("First 3 rows:", jsonData.slice(0, 3));
      console.log("Available columns:", Object.keys(jsonData[0] || {}));

      const importedExpenses = jsonData.map((row: any, index: number) => {
        // Try to map common column names with more variations
        const dateValue =
          row["Date"] ||
          row["date"] ||
          row["DATE"] ||
          row["Transaction Date"] ||
          row["transaction_date"];
        const typeValue =
          row["Type"] ||
          row["type"] ||
          row["TYPE"] ||
          row["Transaction Type"] ||
          row["Income/Expense"];
        const descriptionValue =
          row["Description"] ||
          row["description"] ||
          row["DESCRIPTION"] ||
          row["Particulars"] ||
          row["Details"] ||
          row["Narration"];
        const amountValue =
          row["Amount"] ||
          row["amount"] ||
          row["AMOUNT"] ||
          row["Value"] ||
          row["Sum"] ||
          row["Total"];
        const paidByValue =
          row["Paid By"] ||
          row["paid by"] ||
          row["PAID BY"] ||
          row["PaidBy"] ||
          row["paidBy"] ||
          row["Payer"] ||
          row["Person"];
        const categoryValue =
          row["Category"] ||
          row["category"] ||
          row["CATEGORY"] ||
          row["Expense Category"] ||
          row["Type Category"];
        const subCategoryValue =
          row["Sub-Category"] ||
          row["sub-category"] ||
          row["SUB-CATEGORY"] ||
          row["SubCategory"] ||
          row["subCategory"] ||
          row["Sub Category"];
        const sourceValue =
          row["Source"] ||
          row["source"] ||
          row["SOURCE"] ||
          row["Payment Method"] ||
          row["Mode"] ||
          row["Account"];
        const notesValue =
          row["Notes"] ||
          row["notes"] ||
          row["NOTES"] ||
          row["Remarks"] ||
          row["Comments"];

        console.log(`URL Row ${index}:`, {
          dateValue,
          typeValue,
          descriptionValue,
          amountValue,
          paidByValue,
          categoryValue,
          sourceValue,
          allKeys: Object.keys(row),
        });

        return {
          id: `imported_${Date.now()}_${index}`,
          date: dateValue
            ? new Date(dateValue).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          type:
            typeValue === "Income" ||
            typeValue === "income" ||
            typeValue === "INCOME"
              ? ("Income" as const)
              : ("Expense" as const),
          description: String(descriptionValue || "Imported transaction"),
          amount: parseFloat(String(amountValue)) || 0,
          paidBy: String(paidByValue || "Unknown"),
          category: String(categoryValue || "Other"),
          subCategory: String(subCategoryValue || "General"),
          source: String(sourceValue || "Unknown"),
          notes: String(notesValue || ""),
        };
      });

      if (importedExpenses.length > 0) {
        await onImport(importedExpenses);
        toast({
          title: "Import Successful",
          description: `Imported ${importedExpenses.length} transactions from URL`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: "No valid transactions found in the file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("URL Import error:", error);
      toast({
        title: "Import Failed",
        description:
          "There was an error importing the file from URL. Please check the format and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import & Export
        </CardTitle>
        <CardDescription>
          Import transactions from Excel/CSV files or export your current data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={triggerFileInput}
            variant="outline"
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import from Excel/CSV
          </Button>

          <Button
            onClick={testImportFromURL}
            variant="outline"
            className="flex-1 bg-blue-50 border-blue-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            Test Import from URL
          </Button>

          <Button onClick={exportToExcel} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>

          <Button onClick={exportToCSV} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileImport}
          className="hidden"
        />

        <div className="text-sm text-slate-600 space-y-2">
          <p>
            <strong>Import Instructions:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Supported formats: Excel (.xlsx, .xls) and CSV (.csv)</li>
            <li>Required columns: Date, Type, Description, Amount</li>
            <li>
              Optional columns: Paid By, Category, Sub-Category, Source, Notes
            </li>
            <li>Type should be either "Income" or "Expense"</li>
            <li>Amount should be a number (no currency symbols)</li>
            <li>Date should be in YYYY-MM-DD format or Excel date format</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
