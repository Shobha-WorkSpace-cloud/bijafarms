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
  const basePath = process.env.VITE_BASE_URL || process.env.BASE_URL || '';
  const apiBasePath = basePath ? `${basePath}api` : '/api';

  console.log(`🚀 Server starting with API base path: ${apiBasePath}`);

  // Helper function to register routes with both paths (with and without base path)
  const registerRoute = (method: 'get' | 'post' | 'put' | 'delete', path: string, handler: any) => {
    // Register original path (for local development)
    app[method](`/api${path}`, handler);

    // Register with base path if it exists (for deployment)
    if (basePath && basePath !== '/') {
      app[method](`${basePath}api${path}`, handler);
    }
  };

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Expense routes
  app.get("/api/expenses", getExpenses);
  app.post("/api/expenses", addExpense);
  app.put("/api/expenses/:id", updateExpense);
  app.delete("/api/expenses/:id", deleteExpense);
  app.post("/api/expenses/import", importExpenses);
  app.post("/api/expenses/bulk-delete", bulkDeleteExpenses);
  app.get("/api/expenses/backup", backupExpenses);
  app.get("/api/expenses/categories", getCategories);
  app.post("/api/expenses/categories", saveCategories);
  app.post("/api/expenses/populate-categories", populateCategories);

  // WhatsApp reminder routes
  app.post("/api/send-whatsapp-reminder", sendWhatsAppReminderEndpoint);
  app.post("/api/schedule-reminder", scheduleReminder);
  app.post("/api/test-whatsapp", sendTestWhatsApp);
  app.post("/api/test-whatsapp-simple", sendTestWhatsAppSimple);

  // Task management routes
  app.get("/api/tasks", getTasks);
  app.post("/api/tasks", addTask);
  app.put("/api/tasks/:id", updateTask);
  app.delete("/api/tasks/:id", deleteTask);
  app.post("/api/tasks/bulk-delete", bulkDeleteTasks);
  app.get("/api/tasks/backup", backupTasks);
  app.post("/api/tasks/import", importTasks);

  // Test reminder validation routes
  app.post("/api/test-reminder-validation", createTestReminderTask);
  app.get("/api/test-reminder-validation", checkReminderValidation);
  app.delete("/api/test-reminder-validation", cleanupTestTasks);

  // Animal management routes
  app.get("/api/animals", getAnimals);
  app.post("/api/animals", addAnimal);
  app.put("/api/animals/:id", updateAnimal);
  app.delete("/api/animals/:id", deleteAnimal);
  app.get("/api/animals/summary", getAnimalSummary);
  app.get("/api/animals/backup", backupAnimals);

  // Animal record routes
  app.get("/api/weight-records", getWeightRecords);
  app.post("/api/weight-records", addWeightRecord);
  app.get("/api/breeding-records", getBreedingRecords);
  app.post("/api/breeding-records", addBreedingRecord);
  app.get("/api/vaccination-records", getVaccinationRecords);
  app.post("/api/vaccination-records", addVaccinationRecord);
  app.get("/api/health-records", getHealthRecords);
  app.post("/api/health-records", addHealthRecord);

  return app;
}
