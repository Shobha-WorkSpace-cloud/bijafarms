import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import fs from "fs";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const EXPENSES_FILE = path.join(__dirname, "../data/expenses.json");
const CATEGORIES_FILE = path.join(__dirname, "../data/categories.json");
const dataDir$2 = path.dirname(EXPENSES_FILE);
if (!fs.existsSync(dataDir$2)) {
  fs.mkdirSync(dataDir$2, { recursive: true });
}
const readExpenses = () => {
  try {
    if (!fs.existsSync(EXPENSES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(EXPENSES_FILE, "utf8");
    const rawData = JSON.parse(data);
    return rawData.map((item, index) => {
      let formattedDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const dateStr = item.Date || item.date;
      if (dateStr) {
        try {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            formattedDate = dateStr;
          } else {
            const dateParts = dateStr.split("/");
            if (dateParts.length === 3) {
              const [month, day, year] = dateParts;
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
        notes: item.Notes || item.notes || ""
      };
    });
  } catch (error) {
    console.error("Error reading expenses:", error);
    return [];
  }
};
const writeExpenses = (expenses) => {
  try {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
  } catch (error) {
    console.error("Error writing expenses:", error);
    throw error;
  }
};
const readCategories = () => {
  try {
    if (!fs.existsSync(CATEGORIES_FILE)) {
      return { categories: [], lastUpdated: (/* @__PURE__ */ new Date()).toISOString() };
    }
    const data = fs.readFileSync(CATEGORIES_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading categories:", error);
    return { categories: [], lastUpdated: (/* @__PURE__ */ new Date()).toISOString() };
  }
};
const writeCategories = (data) => {
  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing categories:", error);
    throw error;
  }
};
const getExpenses = (req, res) => {
  try {
    const expenses = readExpenses();
    res.json(expenses);
  } catch (error) {
    console.error("Error getting expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};
const addExpense = (req, res) => {
  try {
    const newExpense = req.body;
    if (!newExpense.description || !newExpense.amount || !newExpense.category) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const expenses = readExpenses();
    let maxId = 0;
    expenses.forEach((expense) => {
      const numId = parseInt(expense.id);
      if (!isNaN(numId) && numId > maxId) {
        maxId = numId;
      }
    });
    newExpense.id = (maxId + 1).toString();
    expenses.unshift(newExpense);
    writeExpenses(expenses);
    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: "Failed to add expense" });
  }
};
const updateExpense = (req, res) => {
  try {
    const { id } = req.params;
    const updatedExpense = req.body;
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
const deleteExpense = (req, res) => {
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
const importExpenses = (req, res) => {
  try {
    const importedExpenses = req.body;
    if (!Array.isArray(importedExpenses)) {
      return res.status(400).json({ error: "Expected array of expenses" });
    }
    const expenses = readExpenses();
    const updatedExpenses = [...importedExpenses, ...expenses];
    writeExpenses(updatedExpenses);
    res.json({
      message: "Expenses imported successfully",
      count: importedExpenses.length
    });
  } catch (error) {
    console.error("Error importing expenses:", error);
    res.status(500).json({ error: "Failed to import expenses" });
  }
};
const bulkDeleteExpenses = (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "Expected array of IDs" });
    }
    const expenses = readExpenses();
    const filteredExpenses = expenses.filter(
      (expense) => !ids.includes(expense.id)
    );
    writeExpenses(filteredExpenses);
    res.json({
      message: "Expenses deleted successfully",
      deletedCount: expenses.length - filteredExpenses.length
    });
  } catch (error) {
    console.error("Error bulk deleting expenses:", error);
    res.status(500).json({ error: "Failed to delete expenses" });
  }
};
const backupExpenses = (req, res) => {
  try {
    const expenses = readExpenses();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const backupFileName = `expenses-backup-${timestamp}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${backupFileName}"`
    );
    res.json(expenses);
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({ error: "Failed to create backup" });
  }
};
const getCategories = (req, res) => {
  try {
    const categories = readCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};
const saveCategories = (req, res) => {
  try {
    const categoryData = req.body;
    if (!categoryData.categories || !Array.isArray(categoryData.categories)) {
      return res.status(400).json({ error: "Invalid categories data" });
    }
    writeCategories(categoryData);
    res.json({ message: "Categories saved successfully" });
  } catch (error) {
    console.error("Error saving categories:", error);
    res.status(500).json({ error: "Failed to save categories" });
  }
};
const populateCategories = (req, res) => {
  try {
    const expenses = readExpenses();
    const categoryMap = {};
    expenses.forEach((expense) => {
      if (expense.category && expense.category.trim() !== "") {
        const category = expense.category.trim();
        const subCategory = expense.subCategory ? expense.subCategory.trim() : "General";
        if (!categoryMap[category]) {
          categoryMap[category] = /* @__PURE__ */ new Set();
        }
        if (subCategory && subCategory !== "") {
          categoryMap[category].add(subCategory);
        }
      }
    });
    const categories = Object.entries(categoryMap).map(
      ([categoryName, subCategoriesSet], index) => {
        const subCategories = Array.from(subCategoriesSet).filter((sub) => sub && sub.trim() !== "").map((sub) => {
          if (sub.toLowerCase() === "misc") return "Misc";
          if (sub.toLowerCase() === "plubming") return "Plumbing";
          if (sub.toLowerCase() === "solar") return "Solar";
          if (sub.toLowerCase() === "doors") return "Doors";
          if (sub.toLowerCase() === "electric") return "Electric";
          return sub;
        }).filter(
          (sub, idx, arr) => arr.findIndex((s) => s.toLowerCase() === sub.toLowerCase()) === idx
        ).sort();
        return {
          id: (Date.now() + index).toString(),
          name: categoryName,
          subCategories: subCategories.length > 0 ? subCategories : ["General"],
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
    );
    categories.sort((a, b) => a.name.localeCompare(b.name));
    const categoryData = {
      categories,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    writeCategories(categoryData);
    res.json({
      message: "Categories populated successfully",
      count: categories.length,
      categories: categoryData
    });
  } catch (error) {
    console.error("Error populating categories:", error);
    res.status(500).json({ error: "Failed to populate categories" });
  }
};
const generateWhatsAppURL = (phone, message) => {
  const formattedPhone = phone.startsWith("+91") ? phone.substring(1) : phone.startsWith("91") ? phone : phone.startsWith("0") ? "91" + phone.substring(1) : "91" + phone;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  console.log(`Generated WhatsApp URL for: ${formattedPhone}`);
  console.log(`Message: ${message}`);
  return whatsappUrl;
};
const sendWhatsAppReminder = async (phone, message) => {
  try {
    const whatsappUrl = generateWhatsAppURL(phone, message);
    return {
      success: true,
      message: "WhatsApp URL generated successfully",
      whatsappUrl,
      data: {
        phone,
        formattedPhone: phone.startsWith("+91") ? phone.substring(1) : phone,
        message
      }
    };
  } catch (error) {
    console.error("Error generating WhatsApp URL:", error);
    return {
      success: false,
      message: "Failed to generate WhatsApp URL",
      data: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
const sendWhatsAppReminderEndpoint = async (req, res) => {
  try {
    const { phone, message, taskTitle, dueDate } = req.body;
    console.log(
      `WhatsApp Reminder - Phone: ${phone}, Task: ${taskTitle}, Due: ${dueDate}`
    );
    const whatsappResponse = await sendWhatsAppReminder(phone, message);
    if (whatsappResponse.success) {
      res.json({
        success: true,
        message: "WhatsApp reminder URL generated successfully",
        phone,
        taskTitle,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        provider: "WhatsApp",
        whatsappUrl: whatsappResponse.whatsappUrl,
        providerResponse: whatsappResponse
      });
    } else {
      console.error("WhatsApp error:", whatsappResponse);
      res.status(400).json({
        success: false,
        error: "Failed to generate WhatsApp URL",
        details: whatsappResponse.message || "Unknown error"
      });
    }
  } catch (error) {
    console.error("Error generating WhatsApp reminder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate WhatsApp reminder",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
const sendTestWhatsAppSimple = async (req, res) => {
  console.log("=== Simple Test WhatsApp Request ===");
  res.setHeader("Content-Type", "application/json");
  try {
    const testMessage = `🧪 TEST: Bija Farms WhatsApp working! ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`;
    console.log("Test message:", testMessage);
    res.status(200).json({
      success: true,
      message: "Test WhatsApp endpoint working",
      phone: "+919985442209",
      testMessage,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      provider: "WhatsApp"
    });
  } catch (error) {
    console.error("Simple test error:", error);
    res.status(500).json({
      success: false,
      error: "Test failed",
      details: String(error)
    });
  }
};
const sendTestWhatsApp = async (req, res) => {
  try {
    console.log("=== Test WhatsApp Request Started ===");
    const testMessage = `🧪 TEST MESSAGE from Bija Farms: WhatsApp integration is working! Sent at ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;
    console.log("Generating test WhatsApp URL for +919985442209...");
    console.log("Test message:", testMessage);
    const whatsappResponse = await sendWhatsAppReminder(
      "+919985442209",
      testMessage
    );
    console.log("WhatsApp Response received:", whatsappResponse);
    if (whatsappResponse.success) {
      console.log("✅ Test WhatsApp URL generated successfully");
      res.json({
        success: true,
        message: "Test WhatsApp URL generated successfully",
        phone: "+919985442209",
        testMessage,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        provider: "WhatsApp",
        whatsappUrl: whatsappResponse.whatsappUrl,
        providerResponse: whatsappResponse
      });
    } else {
      console.error("❌ WhatsApp test error:", whatsappResponse);
      res.status(400).json({
        success: false,
        error: "Failed to generate test WhatsApp URL",
        details: whatsappResponse.message || "Unknown error",
        providerResponse: whatsappResponse
      });
    }
  } catch (error) {
    console.error("❌ Error generating test WhatsApp:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate test WhatsApp",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
const scheduleReminder = async (req, res) => {
  try {
    const { taskId, title, dueDate, description } = req.body;
    const dueDateObj = new Date(dueDate);
    const reminderDate = new Date(dueDateObj);
    reminderDate.setDate(reminderDate.getDate() - 1);
    const now = /* @__PURE__ */ new Date();
    const timeUntilReminder = reminderDate.getTime() - now.getTime();
    if (timeUntilReminder <= 0) {
      const message = `🚨 URGENT: Farm task "${title}" is due ${dueDate === now.toISOString().split("T")[0] ? "TODAY" : "OVERDUE"}! Please complete: ${description}`;
      try {
        const whatsappResponse = await sendWhatsAppReminder(
          "+919985442209",
          message
        );
        return res.json({
          success: true,
          message: "Immediate reminder WhatsApp URL generated (task is due soon)",
          scheduledFor: "immediate",
          provider: "WhatsApp",
          whatsappUrl: whatsappResponse.whatsappUrl,
          whatsappStatus: whatsappResponse.success ? "generated" : "failed"
        });
      } catch (error) {
        console.error("Failed to generate immediate WhatsApp URL:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to generate immediate WhatsApp reminder",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    setTimeout(async () => {
      const message = `⏰ Reminder: Farm task "${title}" is due tomorrow (${dueDate}). Description: ${description}. Please prepare accordingly.`;
      try {
        const whatsappResponse = await sendWhatsAppReminder(
          "+919985442209",
          message
        );
        console.log(`WhatsApp reminder URL generated for task: ${title}`);
        console.log(`WhatsApp URL: ${whatsappResponse.whatsappUrl}`);
      } catch (error) {
        console.error(
          `Failed to generate WhatsApp reminder for task ${title}:`,
          error
        );
      }
    }, timeUntilReminder);
    res.json({
      success: true,
      message: "Reminder scheduled successfully",
      taskId,
      scheduledFor: reminderDate.toISOString(),
      timeUntilReminder: Math.round(timeUntilReminder / (1e3 * 60 * 60)) + " hours"
    });
  } catch (error) {
    console.error("Error scheduling reminder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to schedule reminder"
    });
  }
};
const TASKS_FILE$1 = path.join(__dirname, "../data/TaskTracker.json");
const dataDir$1 = path.dirname(TASKS_FILE$1);
if (!fs.existsSync(dataDir$1)) {
  fs.mkdirSync(dataDir$1, { recursive: true });
}
const readTasks$1 = () => {
  try {
    if (!fs.existsSync(TASKS_FILE$1)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE$1, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks:", error);
    return [];
  }
};
const writeTasks$1 = (tasks) => {
  try {
    fs.writeFileSync(TASKS_FILE$1, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error("Error writing tasks:", error);
    throw error;
  }
};
const getTasks = (req, res) => {
  try {
    const tasks = readTasks$1();
    res.json(tasks);
  } catch (error) {
    console.error("Error getting tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};
const addTask = (req, res) => {
  try {
    const newTask = req.body;
    if (!newTask.title || !newTask.dueDate || !newTask.assignedTo) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!newTask.id) {
      newTask.id = Date.now().toString();
    }
    newTask.status = newTask.status || "pending";
    newTask.createdAt = newTask.createdAt || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    newTask.reminderSent = false;
    const tasks = readTasks$1();
    tasks.unshift(newTask);
    writeTasks$1(tasks);
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
};
const updateTask = (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask = req.body;
    const tasks = readTasks$1();
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Task not found" });
    }
    if (updatedTask.status === "completed" && tasks[index].status !== "completed") {
      updatedTask.completedAt = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    }
    tasks[index] = { ...tasks[index], ...updatedTask, id };
    writeTasks$1(tasks);
    res.json(tasks[index]);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};
const deleteTask = (req, res) => {
  try {
    const { id } = req.params;
    const tasks = readTasks$1();
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Task not found" });
    }
    const deletedTask = tasks.splice(index, 1)[0];
    writeTasks$1(tasks);
    res.json({
      message: "Task deleted successfully",
      deletedTask
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};
const bulkDeleteTasks = (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "Expected array of IDs" });
    }
    const tasks = readTasks$1();
    const filteredTasks = tasks.filter((task) => !ids.includes(task.id));
    writeTasks$1(filteredTasks);
    res.json({
      message: "Tasks deleted successfully",
      deletedCount: tasks.length - filteredTasks.length
    });
  } catch (error) {
    console.error("Error bulk deleting tasks:", error);
    res.status(500).json({ error: "Failed to delete tasks" });
  }
};
const backupTasks = (req, res) => {
  try {
    const tasks = readTasks$1();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const backupFileName = `tasks-backup-${timestamp}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${backupFileName}"`
    );
    res.json(tasks);
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({ error: "Failed to create backup" });
  }
};
const importTasks = (req, res) => {
  try {
    const importedTasks = req.body;
    if (!Array.isArray(importedTasks)) {
      return res.status(400).json({ error: "Expected array of tasks" });
    }
    const tasks = readTasks$1();
    const updatedTasks = [...importedTasks, ...tasks];
    writeTasks$1(updatedTasks);
    res.json({
      message: "Tasks imported successfully",
      count: importedTasks.length
    });
  } catch (error) {
    console.error("Error importing tasks:", error);
    res.status(500).json({ error: "Failed to import tasks" });
  }
};
const TASKS_FILE = path.join(__dirname, "../data/TaskTracker.json");
const readTasks = () => {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks:", error);
    return [];
  }
};
const writeTasks = (tasks) => {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error("Error writing tasks:", error);
    throw error;
  }
};
const createTestReminderTask = (req, res) => {
  try {
    console.log("=== Creating Test Reminder Task ===");
    const tomorrow = /* @__PURE__ */ new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];
    const testTask = {
      id: `test-${Date.now()}`,
      title: "🧪 TEST REMINDER - Goat Health Check",
      description: "This is a test task to validate WhatsApp reminder functionality. It should trigger a reminder today for tomorrow's due date.",
      category: "animal-health",
      taskType: "checkup",
      priority: "high",
      status: "pending",
      dueDate: tomorrowDate,
      assignedTo: "Test Farmer",
      notes: "TEST TASK: This validates that reminders are sent 1 day before due date.",
      createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      reminderSent: false
    };
    const tasks = readTasks();
    tasks.unshift(testTask);
    writeTasks(tasks);
    console.log(`✅ Test task created with due date: ${tomorrowDate}`);
    console.log(`📅 Reminder should be triggered today for tomorrow's task`);
    res.json({
      success: true,
      message: "Test reminder task created successfully",
      testTask,
      reminderInfo: {
        taskDueDate: tomorrowDate,
        reminderShouldTrigger: "today",
        expectedBehavior: "WhatsApp reminder URL should be generated automatically"
      }
    });
  } catch (error) {
    console.error("Error creating test reminder task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create test reminder task",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
const checkReminderValidation = (req, res) => {
  try {
    console.log("=== Checking Reminder Validation ===");
    const tasks = readTasks();
    const testTasks = tasks.filter((task) => task.id.startsWith("test-"));
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const tomorrow = /* @__PURE__ */ new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];
    const validationResults = testTasks.map((task) => {
      const daysDifference = Math.ceil(
        (new Date(task.dueDate).getTime() - new Date(today).getTime()) / (1e3 * 60 * 60 * 24)
      );
      return {
        taskId: task.id,
        title: task.title,
        dueDate: task.dueDate,
        daysDifference,
        shouldTriggerReminder: daysDifference === 1,
        reminderSent: task.reminderSent || false,
        status: task.status
      };
    });
    res.json({
      success: true,
      message: "Reminder validation check completed",
      today,
      tomorrow: tomorrowDate,
      testTasksFound: testTasks.length,
      validationResults,
      summary: {
        tasksNeedingReminders: validationResults.filter(
          (r) => r.shouldTriggerReminder && !r.reminderSent
        ).length,
        remindersSent: validationResults.filter((r) => r.reminderSent).length
      }
    });
  } catch (error) {
    console.error("Error checking reminder validation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check reminder validation",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
const cleanupTestTasks = (req, res) => {
  try {
    console.log("=== Cleaning Up Test Tasks ===");
    const tasks = readTasks();
    const nonTestTasks = tasks.filter(
      (task) => !task.id.startsWith("test-")
    );
    const deletedCount = tasks.length - nonTestTasks.length;
    writeTasks(nonTestTasks);
    console.log(`🗑️ Removed ${deletedCount} test tasks`);
    res.json({
      success: true,
      message: "Test tasks cleaned up successfully",
      deletedCount,
      remainingTasks: nonTestTasks.length
    });
  } catch (error) {
    console.error("Error cleaning up test tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cleanup test tasks",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
const ANIMALS_FILE = path.join(__dirname, "../data/animals.json");
const WEIGHT_RECORDS_FILE = path.join(__dirname, "../data/weight-records.json");
const BREEDING_RECORDS_FILE = path.join(
  __dirname,
  "../data/breeding-records.json"
);
const VACCINATION_RECORDS_FILE = path.join(
  __dirname,
  "../data/vaccination-records.json"
);
const HEALTH_RECORDS_FILE = path.join(__dirname, "../data/health-records.json");
const dataDir = path.dirname(ANIMALS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const readAnimals = () => {
  try {
    if (!fs.existsSync(ANIMALS_FILE)) return [];
    const data = fs.readFileSync(ANIMALS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading animals:", error);
    return [];
  }
};
const writeAnimals = (animals) => {
  try {
    fs.writeFileSync(ANIMALS_FILE, JSON.stringify(animals, null, 2));
  } catch (error) {
    console.error("Error writing animals:", error);
    throw error;
  }
};
const readWeightRecords = () => {
  try {
    if (!fs.existsSync(WEIGHT_RECORDS_FILE)) return [];
    const data = fs.readFileSync(WEIGHT_RECORDS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading weight records:", error);
    return [];
  }
};
const writeWeightRecords = (records) => {
  try {
    fs.writeFileSync(WEIGHT_RECORDS_FILE, JSON.stringify(records, null, 2));
  } catch (error) {
    console.error("Error writing weight records:", error);
    throw error;
  }
};
const readBreedingRecords = () => {
  try {
    if (!fs.existsSync(BREEDING_RECORDS_FILE)) return [];
    const data = fs.readFileSync(BREEDING_RECORDS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading breeding records:", error);
    return [];
  }
};
const writeBreedingRecords = (records) => {
  try {
    fs.writeFileSync(BREEDING_RECORDS_FILE, JSON.stringify(records, null, 2));
  } catch (error) {
    console.error("Error writing breeding records:", error);
    throw error;
  }
};
const readVaccinationRecords = () => {
  try {
    if (!fs.existsSync(VACCINATION_RECORDS_FILE)) return [];
    const data = fs.readFileSync(VACCINATION_RECORDS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading vaccination records:", error);
    return [];
  }
};
const writeVaccinationRecords = (records) => {
  try {
    fs.writeFileSync(
      VACCINATION_RECORDS_FILE,
      JSON.stringify(records, null, 2)
    );
  } catch (error) {
    console.error("Error writing vaccination records:", error);
    throw error;
  }
};
const readHealthRecords = () => {
  try {
    if (!fs.existsSync(HEALTH_RECORDS_FILE)) return [];
    const data = fs.readFileSync(HEALTH_RECORDS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading health records:", error);
    return [];
  }
};
const writeHealthRecords = (records) => {
  try {
    fs.writeFileSync(HEALTH_RECORDS_FILE, JSON.stringify(records, null, 2));
  } catch (error) {
    console.error("Error writing health records:", error);
    throw error;
  }
};
const getAnimals = (req, res) => {
  try {
    const animals = readAnimals();
    res.json(animals);
  } catch (error) {
    console.error("Error getting animals:", error);
    res.status(500).json({ error: "Failed to fetch animals" });
  }
};
const addAnimal = (req, res) => {
  try {
    const newAnimal = req.body;
    if (!newAnimal.id) {
      const animals2 = readAnimals();
      let maxId = 0;
      animals2.forEach((animal) => {
        const numId = parseInt(animal.id);
        if (!isNaN(numId) && numId > maxId) {
          maxId = numId;
        }
      });
      newAnimal.id = (maxId + 1).toString();
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    newAnimal.createdAt = now;
    newAnimal.updatedAt = now;
    const animals = readAnimals();
    animals.unshift(newAnimal);
    writeAnimals(animals);
    res.status(201).json(newAnimal);
  } catch (error) {
    console.error("Error adding animal:", error);
    res.status(500).json({ error: "Failed to add animal" });
  }
};
const updateAnimal = (req, res) => {
  try {
    const { id } = req.params;
    const updatedAnimal = req.body;
    const animals = readAnimals();
    const index = animals.findIndex((animal) => animal.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Animal not found" });
    }
    updatedAnimal.createdAt = animals[index].createdAt;
    updatedAnimal.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    updatedAnimal.id = id;
    animals[index] = updatedAnimal;
    writeAnimals(animals);
    res.json(animals[index]);
  } catch (error) {
    console.error("Error updating animal:", error);
    res.status(500).json({ error: "Failed to update animal" });
  }
};
const deleteAnimal = (req, res) => {
  try {
    const { id } = req.params;
    const animals = readAnimals();
    const index = animals.findIndex((animal) => animal.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Animal not found" });
    }
    animals.splice(index, 1);
    writeAnimals(animals);
    res.json({ message: "Animal deleted successfully" });
  } catch (error) {
    console.error("Error deleting animal:", error);
    res.status(500).json({ error: "Failed to delete animal" });
  }
};
const getWeightRecords = (req, res) => {
  try {
    const { animalId } = req.query;
    let records = readWeightRecords();
    if (animalId) {
      records = records.filter((record) => record.animalId === animalId);
    }
    res.json(records);
  } catch (error) {
    console.error("Error getting weight records:", error);
    res.status(500).json({ error: "Failed to fetch weight records" });
  }
};
const addWeightRecord = (req, res) => {
  try {
    const newRecord = req.body;
    newRecord.id = Date.now().toString();
    newRecord.createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const records = readWeightRecords();
    records.unshift(newRecord);
    writeWeightRecords(records);
    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error adding weight record:", error);
    res.status(500).json({ error: "Failed to add weight record" });
  }
};
const getBreedingRecords = (req, res) => {
  try {
    const { animalId } = req.query;
    let records = readBreedingRecords();
    if (animalId) {
      records = records.filter(
        (record) => record.motherId === animalId || record.fatherId === animalId
      );
    }
    res.json(records);
  } catch (error) {
    console.error("Error getting breeding records:", error);
    res.status(500).json({ error: "Failed to fetch breeding records" });
  }
};
const addBreedingRecord = (req, res) => {
  try {
    const newRecord = req.body;
    newRecord.id = Date.now().toString();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    newRecord.createdAt = now;
    newRecord.updatedAt = now;
    const records = readBreedingRecords();
    records.unshift(newRecord);
    writeBreedingRecords(records);
    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error adding breeding record:", error);
    res.status(500).json({ error: "Failed to add breeding record" });
  }
};
const getVaccinationRecords = (req, res) => {
  try {
    const { animalId } = req.query;
    let records = readVaccinationRecords();
    if (animalId) {
      records = records.filter((record) => record.animalId === animalId);
    }
    res.json(records);
  } catch (error) {
    console.error("Error getting vaccination records:", error);
    res.status(500).json({ error: "Failed to fetch vaccination records" });
  }
};
const addVaccinationRecord = (req, res) => {
  try {
    const newRecord = req.body;
    newRecord.id = Date.now().toString();
    newRecord.createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const records = readVaccinationRecords();
    records.unshift(newRecord);
    writeVaccinationRecords(records);
    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error adding vaccination record:", error);
    res.status(500).json({ error: "Failed to add vaccination record" });
  }
};
const getHealthRecords = (req, res) => {
  try {
    const { animalId } = req.query;
    let records = readHealthRecords();
    if (animalId) {
      records = records.filter((record) => record.animalId === animalId);
    }
    res.json(records);
  } catch (error) {
    console.error("Error getting health records:", error);
    res.status(500).json({ error: "Failed to fetch health records" });
  }
};
const addHealthRecord = (req, res) => {
  try {
    const newRecord = req.body;
    newRecord.id = Date.now().toString();
    newRecord.createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const records = readHealthRecords();
    records.unshift(newRecord);
    writeHealthRecords(records);
    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error adding health record:", error);
    res.status(500).json({ error: "Failed to add health record" });
  }
};
const getAnimalSummary = (req, res) => {
  try {
    const animals = readAnimals();
    const weightRecords = readWeightRecords();
    const summary = {
      totalAnimals: animals.length,
      totalGoats: animals.filter((a) => a.type === "goat").length,
      totalSheep: animals.filter((a) => a.type === "sheep").length,
      totalMales: animals.filter((a) => a.gender === "male").length,
      totalFemales: animals.filter((a) => a.gender === "female").length,
      activeAnimals: animals.filter((a) => a.status === "active").length,
      soldAnimals: animals.filter((a) => a.status === "sold").length,
      readyToSell: animals.filter((a) => a.status === "ready_to_sell").length,
      deadAnimals: animals.filter((a) => a.status === "dead").length,
      averageWeight: 0,
      totalInvestment: 0,
      totalRevenue: 0,
      profitLoss: 0
    };
    const animalWeights = animals.map((animal) => {
      const animalWeightRecords = weightRecords.filter((w) => w.animalId === animal.id).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return animalWeightRecords.length > 0 ? animalWeightRecords[0].weight : animal.currentWeight || 0;
    }).filter((weight) => weight > 0);
    if (animalWeights.length > 0) {
      summary.averageWeight = animalWeights.reduce((sum, weight) => sum + weight, 0) / animalWeights.length;
    }
    summary.totalInvestment = animals.reduce(
      (sum, animal) => sum + (animal.purchasePrice || 0),
      0
    );
    summary.totalRevenue = animals.filter((a) => a.status === "sold").reduce((sum, animal) => sum + (animal.salePrice || 0), 0);
    summary.profitLoss = summary.totalRevenue - summary.totalInvestment;
    res.json(summary);
  } catch (error) {
    console.error("Error getting animal summary:", error);
    res.status(500).json({ error: "Failed to fetch animal summary" });
  }
};
const backupAnimals = (req, res) => {
  try {
    const animals = readAnimals();
    const weightRecords = readWeightRecords();
    const breedingRecords = readBreedingRecords();
    const vaccinationRecords = readVaccinationRecords();
    const healthRecords = readHealthRecords();
    const backup = {
      animals,
      weightRecords,
      breedingRecords,
      vaccinationRecords,
      healthRecords,
      exportDate: (/* @__PURE__ */ new Date()).toISOString()
    };
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const backupFileName = `animals-backup-${timestamp}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${backupFileName}"`
    );
    res.json(backup);
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({ error: "Failed to create backup" });
  }
};
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.get("/api/demo", handleDemo);
  app2.get("/api/expenses", getExpenses);
  app2.post("/api/expenses", addExpense);
  app2.put("/api/expenses/:id", updateExpense);
  app2.delete("/api/expenses/:id", deleteExpense);
  app2.post("/api/expenses/import", importExpenses);
  app2.post("/api/expenses/bulk-delete", bulkDeleteExpenses);
  app2.get("/api/expenses/backup", backupExpenses);
  app2.get("/api/expenses/categories", getCategories);
  app2.post("/api/expenses/categories", saveCategories);
  app2.post("/api/expenses/populate-categories", populateCategories);
  app2.post("/api/send-whatsapp-reminder", sendWhatsAppReminderEndpoint);
  app2.post("/api/schedule-reminder", scheduleReminder);
  app2.post("/api/test-whatsapp", sendTestWhatsApp);
  app2.post("/api/test-whatsapp-simple", sendTestWhatsAppSimple);
  app2.get("/api/tasks", getTasks);
  app2.post("/api/tasks", addTask);
  app2.put("/api/tasks/:id", updateTask);
  app2.delete("/api/tasks/:id", deleteTask);
  app2.post("/api/tasks/bulk-delete", bulkDeleteTasks);
  app2.get("/api/tasks/backup", backupTasks);
  app2.post("/api/tasks/import", importTasks);
  app2.post("/api/test-reminder-validation", createTestReminderTask);
  app2.get("/api/test-reminder-validation", checkReminderValidation);
  app2.delete("/api/test-reminder-validation", cleanupTestTasks);
  app2.get("/api/animals", getAnimals);
  app2.post("/api/animals", addAnimal);
  app2.put("/api/animals/:id", updateAnimal);
  app2.delete("/api/animals/:id", deleteAnimal);
  app2.get("/api/animals/summary", getAnimalSummary);
  app2.get("/api/animals/backup", backupAnimals);
  app2.get("/api/weight-records", getWeightRecords);
  app2.post("/api/weight-records", addWeightRecord);
  app2.get("/api/breeding-records", getBreedingRecords);
  app2.post("/api/breeding-records", addBreedingRecord);
  app2.get("/api/vaccination-records", getVaccinationRecords);
  app2.post("/api/vaccination-records", addVaccinationRecord);
  app2.get("/api/health-records", getHealthRecords);
  app2.post("/api/health-records", addHealthRecord);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname$1 = import.meta.dirname;
const distPath = path.join(__dirname$1, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
