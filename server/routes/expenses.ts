import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { ExpenseRecord } from "@shared/expense-types";

const EXPENSES_FILE = path.join(__dirname, "../data/expenses.json");

// Ensure data directory exists
const dataDir = path.dirname(EXPENSES_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper function to read expenses from JSON file
const readExpenses = (): ExpenseRecord[] => {
  try {
    if (!fs.existsSync(EXPENSES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(EXPENSES_FILE, "utf8");
    const rawData = JSON.parse(data);

    // Transform the data to match the expected format and ensure unique IDs
    return rawData.map((item: any, index: number) => {
      // Handle date format - check if already in YYYY-MM-DD format or needs conversion from M/D/YYYY
      let formattedDate = new Date().toISOString().split("T")[0];
      const dateStr = item.Date || item.date;
      if (dateStr) {
        try {
          // Check if already in YYYY-MM-DD format
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            formattedDate = dateStr;
          } else {
            // Try to parse M/D/YYYY format
            const dateParts = dateStr.split("/");
            if (dateParts.length === 3) {
              const [month, day, year] = dateParts;

              // Ensure proper padding for month and day
              const paddedMonth = month.padStart(2, "0");
              const paddedDay = day.padStart(2, "0");

              formattedDate = `${year}-${paddedMonth}-${paddedDay}`;
            }
          }
        } catch (e) {
          console.warn(`Invalid date format: ${dateStr}`);
        }
      }

      return {
        id: String(item.id || index + 1),
        date: formattedDate,
        type: item.Type || item.type || "Expense",
        description: item.Description || item.description || "No description",
        amount: parseFloat(item.Amount || item.amount || 0),
        paidBy: item["Paid By"] || item.paidBy || "Unknown",
        category: item.Category || item.category || "Other",
        subCategory: item["Sub-Category"] || item.subCategory || "General",
        source: item.Source || item.source || "Unknown",
        notes: item.Notes || item.notes || "",
      };
    });
  } catch (error) {
    console.error("Error reading expenses:", error);
    return [];
  }
};

// Helper function to write expenses to JSON file
const writeExpenses = (expenses: ExpenseRecord[]): void => {
  try {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
  } catch (error) {
    console.error("Error writing expenses:", error);
    throw error;
  }
};

// GET /api/expenses - Get all expenses
export const getExpenses: RequestHandler = (req, res) => {
  try {
    const expenses = readExpenses();
    res.json(expenses);
  } catch (error) {
    console.error("Error getting expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

// POST /api/expenses - Add new expense
export const addExpense: RequestHandler = (req, res) => {
  try {
    const newExpense: ExpenseRecord = req.body;

    // Validate required fields
    if (!newExpense.description || !newExpense.amount || !newExpense.category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate auto-increment integer ID
    const expenses = readExpenses();
    let maxId = 0;

    // Find the highest existing ID
    expenses.forEach((expense) => {
      const numId = parseInt(expense.id);
      if (!isNaN(numId) && numId > maxId) {
        maxId = numId;
      }
    });

    // Set new ID as next integer
    newExpense.id = (maxId + 1).toString();
    expenses.unshift(newExpense); // Add to beginning of array
    writeExpenses(expenses);

    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: "Failed to add expense" });
  }
};

// PUT /api/expenses/:id - Update existing expense
export const updateExpense: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updatedExpense: ExpenseRecord = req.body;

    const expenses = readExpenses();
    const index = expenses.findIndex((expense) => expense.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Expense not found" });
    }

    expenses[index] = { ...expenses[index], ...updatedExpense, id };
    writeExpenses(expenses);

    res.json(expenses[index]);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
};

// DELETE /api/expenses/:id - Delete expense
export const deleteExpense: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const expenses = readExpenses();
    const index = expenses.findIndex((expense) => expense.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Expense not found" });
    }

    expenses.splice(index, 1);
    writeExpenses(expenses);

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

// POST /api/expenses/import - Import multiple expenses
export const importExpenses: RequestHandler = (req, res) => {
  try {
    const importedExpenses: ExpenseRecord[] = req.body;

    if (!Array.isArray(importedExpenses)) {
      return res.status(400).json({ error: "Expected array of expenses" });
    }

    const expenses = readExpenses();

    // Add imported expenses to the beginning
    const updatedExpenses = [...importedExpenses, ...expenses];
    writeExpenses(updatedExpenses);

    res.json({
      message: "Expenses imported successfully",
      count: importedExpenses.length,
    });
  } catch (error) {
    console.error("Error importing expenses:", error);
    res.status(500).json({ error: "Failed to import expenses" });
  }
};

// POST /api/expenses/bulk-delete - Delete multiple expenses
export const bulkDeleteExpenses: RequestHandler = (req, res) => {
  try {
    const { ids }: { ids: string[] } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "Expected array of IDs" });
    }

    const expenses = readExpenses();
    const filteredExpenses = expenses.filter(
      (expense) => !ids.includes(expense.id),
    );
    writeExpenses(filteredExpenses);

    res.json({
      message: "Expenses deleted successfully",
      deletedCount: expenses.length - filteredExpenses.length,
    });
  } catch (error) {
    console.error("Error bulk deleting expenses:", error);
    res.status(500).json({ error: "Failed to delete expenses" });
  }
};

// GET /api/expenses/backup - Create backup of expenses
export const backupExpenses: RequestHandler = (req, res) => {
  try {
    const expenses = readExpenses();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `expenses-backup-${timestamp}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${backupFileName}"`,
    );
    res.json(expenses);
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({ error: "Failed to create backup" });
  }
};
