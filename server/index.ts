import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  importExpenses,
  bulkDeleteExpenses,
  backupExpenses,
  getCategories,
  saveCategories,
  populateCategories,
} from "./routes/expenses";
import {
  sendWhatsAppReminderEndpoint,
  scheduleReminder,
  sendTestWhatsApp,
  sendTestWhatsAppSimple,
} from "./routes/sms-reminders";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
  backupTasks,
  importTasks,
} from "./routes/tasks";
import {
  createTestReminderTask,
  checkReminderValidation,
  cleanupTestTasks,
} from "./routes/test-reminder";
import {
  getAnimals,
  addAnimal,
  updateAnimal,
  deleteAnimal,
  getWeightRecords,
  addWeightRecord,
  getBreedingRecords,
  addBreedingRecord,
  getVaccinationRecords,
  addVaccinationRecord,
  getHealthRecords,
  addHealthRecord,
  getAnimalSummary,
  backupAnimals,
} from "./routes/animals";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Get base path from environment or default
  // Check various environment variables and detect from deployment URL
  let basePath = process.env.VITE_BASE_URL || process.env.BASE_URL || "";

  // If no base path is set, check if we're using builder-aura-haven base path
  if (!basePath) {
    // For this specific project, always use the base path
    basePath = "/builder-aura-haven/";
  }

  const apiBasePath = basePath ? `${basePath}api` : "/api";

  console.log(`🚀 Server starting with API base path: ${apiBasePath}`);

  // Helper function to register routes with both paths (with and without base path)
  const registerRoute = (
    method: "get" | "post" | "put" | "delete",
    path: string,
    handler: any,
  ) => {
    // Register original path (for local development)
    const originalPath = `/api${path}`;
    app[method](originalPath, handler);
    console.log(`📝 Registered: ${method.toUpperCase()} ${originalPath}`);

    // Register with base path if it exists (for deployment)
    if (basePath && basePath !== "/") {
      const deploymentPath = `${basePath}api${path}`;
      app[method](deploymentPath, handler);
      console.log(`📝 Registered: ${method.toUpperCase()} ${deploymentPath}`);
    }
  };

  // Example API routes
  registerRoute("get", "/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  registerRoute("get", "/demo", handleDemo);

  // Expense routes
  registerRoute("get", "/expenses", getExpenses);
  registerRoute("post", "/expenses", addExpense);
  registerRoute("put", "/expenses/:id", updateExpense);
  registerRoute("delete", "/expenses/:id", deleteExpense);
  registerRoute("post", "/expenses/import", importExpenses);
  registerRoute("post", "/expenses/bulk-delete", bulkDeleteExpenses);
  registerRoute("get", "/expenses/backup", backupExpenses);
  registerRoute("get", "/expenses/categories", getCategories);
  registerRoute("post", "/expenses/categories", saveCategories);
  registerRoute("post", "/expenses/populate-categories", populateCategories);

  // WhatsApp reminder routes
  registerRoute(
    "post",
    "/send-whatsapp-reminder",
    sendWhatsAppReminderEndpoint,
  );
  registerRoute("post", "/schedule-reminder", scheduleReminder);
  registerRoute("post", "/test-whatsapp", sendTestWhatsApp);
  registerRoute("post", "/test-whatsapp-simple", sendTestWhatsAppSimple);

  // Task management routes
  registerRoute("get", "/tasks", getTasks);
  registerRoute("post", "/tasks", addTask);
  registerRoute("put", "/tasks/:id", updateTask);
  registerRoute("delete", "/tasks/:id", deleteTask);
  registerRoute("post", "/tasks/bulk-delete", bulkDeleteTasks);
  registerRoute("get", "/tasks/backup", backupTasks);
  registerRoute("post", "/tasks/import", importTasks);

  // Test reminder validation routes
  registerRoute("post", "/test-reminder-validation", createTestReminderTask);
  registerRoute("get", "/test-reminder-validation", checkReminderValidation);
  registerRoute("delete", "/test-reminder-validation", cleanupTestTasks);

  // Animal management routes
  registerRoute("get", "/animals", getAnimals);
  registerRoute("post", "/animals", addAnimal);
  registerRoute("put", "/animals/:id", updateAnimal);
  registerRoute("delete", "/animals/:id", deleteAnimal);
  registerRoute("get", "/animals/summary", getAnimalSummary);
  registerRoute("get", "/animals/backup", backupAnimals);

  // Animal record routes
  registerRoute("get", "/weight-records", getWeightRecords);
  registerRoute("post", "/weight-records", addWeightRecord);
  registerRoute("get", "/breeding-records", getBreedingRecords);
  registerRoute("post", "/breeding-records", addBreedingRecord);
  registerRoute("get", "/vaccination-records", getVaccinationRecords);
  registerRoute("post", "/vaccination-records", addVaccinationRecord);
  registerRoute("get", "/health-records", getHealthRecords);
  registerRoute("post", "/health-records", addHealthRecord);

  return app;
}
