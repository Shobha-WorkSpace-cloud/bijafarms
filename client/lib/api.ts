import { ExpenseRecord } from "@shared/expense-types";

const API_BASE = "/api/expenses";

// Get all expenses
export const fetchExpenses = async (): Promise<ExpenseRecord[]> => {
  const response = await fetch(`${API_BASE}?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  const data = await response.json();
  console.log("API Response - Total records:", data.length);
  console.log(
    "API Response - Max ID:",
    Math.max(...data.map((item: any) => parseInt(item.id) || 0)),
  );
  console.log(
    "API Response - Has ID 321:",
    data.some((item: any) => item.id === "321"),
  );

  // Debug first few dates
  console.log("First 3 dates from API:", data.slice(0, 3).map((item: any) => ({
    id: item.id,
    originalDate: item.date,
    parsedDate: new Date(item.date).toLocaleDateString("en-US")
  })));

  return data;
};

// Add new expense
export const createExpense = async (
  expense: Omit<ExpenseRecord, "id">,
): Promise<ExpenseRecord> => {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error("Failed to create expense");
  }

  return response.json();
};

// Update existing expense
export const updateExpense = async (
  id: string,
  expense: ExpenseRecord,
): Promise<ExpenseRecord> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error("Failed to update expense");
  }

  return response.json();
};

// Delete expense
export const deleteExpense = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete expense");
  }
};

// Import multiple expenses
export const importExpenses = async (
  expenses: ExpenseRecord[],
): Promise<{ message: string; count: number }> => {
  const response = await fetch(`${API_BASE}/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenses),
  });

  if (!response.ok) {
    throw new Error("Failed to import expenses");
  }

  return response.json();
};

// Bulk delete expenses
export const bulkDeleteExpenses = async (
  ids: string[],
): Promise<{ message: string; deletedCount: number }> => {
  const response = await fetch(`${API_BASE}/bulk-delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new Error("Failed to bulk delete expenses");
  }

  return response.json();
};

// Create backup
export const createBackup = async (): Promise<Blob> => {
  const response = await fetch(`${API_BASE}/backup`);

  if (!response.ok) {
    throw new Error("Failed to create backup");
  }

  return response.blob();
};
