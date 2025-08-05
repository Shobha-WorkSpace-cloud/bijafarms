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
  registerRoute('get', '/ping', (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  registerRoute('get', '/demo', handleDemo);

  // Expense routes
  registerRoute('get', '/expenses', getExpenses);
  registerRoute('post', '/expenses', addExpense);
  registerRoute('put', '/expenses/:id', updateExpense);
  registerRoute('delete', '/expenses/:id', deleteExpense);
  registerRoute('post', '/expenses/import', importExpenses);
  registerRoute('post', '/expenses/bulk-delete', bulkDeleteExpenses);
  registerRoute('get', '/expenses/backup', backupExpenses);
  registerRoute('get', '/expenses/categories', getCategories);
  registerRoute('post', '/expenses/categories', saveCategories);
  registerRoute('post', '/expenses/populate-categories', populateCategories);

  // WhatsApp reminder routes
  registerRoute('post', '/send-whatsapp-reminder', sendWhatsAppReminderEndpoint);
  registerRoute('post', '/schedule-reminder', scheduleReminder);
  registerRoute('post', '/test-whatsapp', sendTestWhatsApp);
  registerRoute('post', '/test-whatsapp-simple', sendTestWhatsAppSimple);

  // Task management routes
  registerRoute('get', '/tasks', getTasks);
  registerRoute('post', '/tasks', addTask);
  registerRoute('put', '/tasks/:id', updateTask);
  registerRoute('delete', '/tasks/:id', deleteTask);
  registerRoute('post', '/tasks/bulk-delete', bulkDeleteTasks);
  registerRoute('get', '/tasks/backup', backupTasks);
  registerRoute('post', '/tasks/import', importTasks);

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
