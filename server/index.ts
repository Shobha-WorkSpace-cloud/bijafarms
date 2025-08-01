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
} from "./routes/expenses";
import {
  sendWhatsAppReminderEndpoint,
  scheduleReminder,
  sendTestWhatsApp,
  sendTestWhatsAppSimple
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

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  return app;
}
