interface Task {
  id: string;
  title: string;
  description: string;
  category:
    | "animal-husbandry"
    | "crop-management"
    | "equipment"
    | "irrigation"
    | "harvesting"
    | "maintenance"
    | "general";
  taskType:
    | "vaccination"
    | "checkup"
    | "treatment"
    | "feeding"
    | "cleaning"
    | "planting"
    | "watering"
    | "fertilizing"
    | "harvesting"
    | "equipment-maintenance"
    | "repair"
    | "inspection"
    | "other";
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
  assigned_to: string;
  notes: string;
  createdAt: string;
  completedAt?: string;
  reminderSent?: boolean;
}

import { apiGet, apiPost, apiPut, apiDelete } from "./api-config";

// Fetch all tasks
export const fetchTasks = async (): Promise<Task[]> => {
  return apiGet("/tasks");
};

// Create a new task
export const createTask = async (
  task: Omit<Task, "id" | "createdAt">,
): Promise<Task> => {
  return apiPost("/tasks", task);
};

// Update an existing task
export const updateTask = async (
  id: string,
  task: Partial<Task>,
): Promise<Task> => {
  return apiPut(`/tasks/${id}`, task);
};

// Delete a task
export const deleteTask = async (id: string): Promise<void> => {
  return apiDelete(`/tasks/${id}`);
};

// Bulk delete tasks
export const bulkDeleteTasks = async (ids: string[]): Promise<void> => {
  return apiPost("/tasks/bulk-delete", { ids });
};

// Export tasks backup
export const exportTasksBackup = async (): Promise<void> => {
  const response = await fetch("/api/tasks/backup");
  if (!response.ok) {
    throw new Error(`Failed to export tasks: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tasks-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Import tasks
export const importTasks = async (tasks: Task[]): Promise<void> => {
  const response = await fetch("/api/tasks/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tasks),
  });

  if (!response.ok) {
    throw new Error(`Failed to import tasks: ${response.statusText}`);
  }
};

export type { Task };
