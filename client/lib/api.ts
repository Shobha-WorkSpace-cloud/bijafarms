import { ExpenseRecord } from "@shared/expense-types";

const API_BASE = '/api/expenses';

// Get all expenses
export const fetchExpenses = async (): Promise<ExpenseRecord[]> => {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }
  return response.json();
};

// Add new expense
export const createExpense = async (expense: Omit<ExpenseRecord, 'id'>): Promise<ExpenseRecord> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expense),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create expense');
  }
  
  return response.json();
};

// Update existing expense
export const updateExpense = async (id: string, expense: ExpenseRecord): Promise<ExpenseRecord> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expense),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update expense');
  }
  
  return response.json();
};

// Delete expense
export const deleteExpense = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete expense');
  }
};

// Import multiple expenses
export const importExpenses = async (expenses: ExpenseRecord[]): Promise<{ message: string; count: number }> => {
  const response = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenses),
  });
  
  if (!response.ok) {
    throw new Error('Failed to import expenses');
  }
  
  return response.json();
};

// Bulk delete expenses
export const bulkDeleteExpenses = async (ids: string[]): Promise<{ message: string; deletedCount: number }> => {
  const response = await fetch(`${API_BASE}/bulk-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to bulk delete expenses');
  }
  
  return response.json();
};

// Create backup
export const createBackup = async (): Promise<Blob> => {
  const response = await fetch(`${API_BASE}/backup`);
  
  if (!response.ok) {
    throw new Error('Failed to create backup');
  }
  
  return response.blob();
};
