import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

// Import all route handlers
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
} from "../routes/expenses";

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
} from "../routes/animals";

import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
  backupTasks,
  importTasks,
} from "../routes/tasks";

// Test data directory
const TEST_DATA_DIR = path.join(process.cwd(), "server/test-data");

// Create test app
function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  // Animal routes
  app.get("/api/animals", getAnimals);
  app.post("/api/animals", addAnimal);
  app.put("/api/animals/:id", updateAnimal);
  app.delete("/api/animals/:id", deleteAnimal);
  app.get("/api/animals/summary", getAnimalSummary);
  app.get("/api/animals/backup", backupAnimals);
  app.get("/api/weight-records", getWeightRecords);
  app.post("/api/weight-records", addWeightRecord);
  app.get("/api/breeding-records", getBreedingRecords);
  app.post("/api/breeding-records", addBreedingRecord);
  app.get("/api/vaccination-records", getVaccinationRecords);
  app.post("/api/vaccination-records", addVaccinationRecord);
  app.get("/api/health-records", getHealthRecords);
  app.post("/api/health-records", addHealthRecord);

  // Task routes
  app.get("/api/tasks", getTasks);
  app.post("/api/tasks", addTask);
  app.put("/api/tasks/:id", updateTask);
  app.delete("/api/tasks/:id", deleteTask);
  app.post("/api/tasks/bulk-delete", bulkDeleteTasks);
  app.get("/api/tasks/backup", backupTasks);
  app.post("/api/tasks/import", importTasks);

  return app;
}

// Test data samples
const sampleExpense = {
  date: "2024-01-15",
  type: "Expense",
  description: "Test expense",
  amount: 100,
  paidBy: "Test User",
  category: "Test Category",
  subCategory: "Test Sub",
  source: "Test Source",
  notes: "Test notes",
};

const sampleAnimal = {
  name: "Test Animal",
  type: "goat",
  breed: "Test Breed",
  gender: "female",
  dateOfBirth: "2023-01-15",
  photos: [],
  status: "active",
  currentWeight: 25,
  markings: "Test markings",
  insured: false,
  notes: "Test animal notes",
};

const sampleTask = {
  title: "Test Task",
  description: "Test task description",
  category: "Health",
  taskType: "Vaccination",
  priority: "medium",
  status: "pending",
  dueDate: "2024-02-01",
  assignedTo: "Test User",
  notes: "Test task notes",
};

const sampleWeightRecord = {
  animalId: "1",
  weight: 30,
  date: "2024-01-15",
  notes: "Test weight record",
  recordedBy: "Test User",
};

const sampleBreedingRecord = {
  motherId: "1",
  fatherId: "2",
  breedingDate: "2024-01-01",
  expectedDeliveryDate: "2024-06-01",
  breedingMethod: "natural",
  notes: "Test breeding record",
};

const sampleVaccinationRecord = {
  animalId: "1",
  vaccineName: "Test Vaccine",
  vaccineType: "Viral Protection",
  administrationDate: "2024-01-15",
  nextDueDate: "2025-01-15",
  veterinarianName: "Dr. Test",
  dosage: "1ml",
  cost: 150,
  notes: "Test vaccination",
};

const sampleHealthRecord = {
  animalId: "1",
  recordType: "checkup",
  date: "2024-01-15",
  description: "Test health checkup",
  veterinarianName: "Dr. Test",
  diagnosis: "Healthy",
  treatment: "No treatment required",
  cost: 200,
  notes: "Test health record",
};

let app: express.Application;

beforeAll(() => {
  app = createTestApp();

  // Mock file operations to use test directory
  vi.mock("fs", async () => {
    const actual = await vi.importActual("fs");
    return {
      ...actual,
      existsSync: vi.fn().mockReturnValue(true),
      readFileSync: vi.fn().mockReturnValue("[]"),
      writeFileSync: vi.fn().mockImplementation(() => {}),
      mkdirSync: vi.fn().mockImplementation(() => {}),
    };
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("API Endpoints Tests", () => {
  describe("Expenses API", () => {
    it("GET /api/expenses should return expenses list", async () => {
      const response = await request(app).get("/api/expenses");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("POST /api/expenses should create new expense", async () => {
      const response = await request(app)
        .post("/api/expenses")
        .send(sampleExpense);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ...sampleExpense,
        id: expect.any(String),
      });
    });

    it("POST /api/expenses should fail with missing required fields", async () => {
      const invalidExpense = {
        date: "2024-01-15",
        // Missing required fields: description, amount, category
      };

      const response = await request(app)
        .post("/api/expenses")
        .send(invalidExpense);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing required fields");
    });

    it("PUT /api/expenses/:id should update expense", async () => {
      const updatedExpense = {
        ...sampleExpense,
        id: "1",
        description: "Updated expense",
      };

      const response = await request(app)
        .put("/api/expenses/1")
        .send(updatedExpense);

      expect(response.status).toBe(200);
      expect(response.body.description).toBe("Updated expense");
    });

    it("DELETE /api/expenses/:id should delete expense", async () => {
      const response = await request(app).delete("/api/expenses/1");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Expense deleted successfully");
    });

    it("GET /api/expenses/categories should return categories", async () => {
      const response = await request(app).get("/api/expenses/categories");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("categories");
    });

    it("POST /api/expenses/categories should save categories", async () => {
      const categoryData = {
        categories: [
          {
            id: "1",
            name: "Test Category",
            subCategories: ["Sub1"],
            createdAt: new Date().toISOString(),
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const response = await request(app)
        .post("/api/expenses/categories")
        .send(categoryData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Categories saved successfully");
    });

    it("POST /api/expenses/bulk-delete should delete multiple expenses", async () => {
      const response = await request(app)
        .post("/api/expenses/bulk-delete")
        .send({ ids: ["1", "2", "3"] });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Expenses deleted successfully");
    });

    it("GET /api/expenses/backup should create backup", async () => {
      const response = await request(app).get("/api/expenses/backup");
      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
    });
  });

  describe("Animals API", () => {
    it("GET /api/animals should return animals list", async () => {
      const response = await request(app).get("/api/animals");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("POST /api/animals should create new animal", async () => {
      const response = await request(app)
        .post("/api/animals")
        .send(sampleAnimal);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ...sampleAnimal,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("PUT /api/animals/:id should update animal", async () => {
      const updatedAnimal = {
        ...sampleAnimal,
        id: "1",
        name: "Updated Animal",
      };

      const response = await request(app)
        .put("/api/animals/1")
        .send(updatedAnimal);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Updated Animal");
    });

    it("DELETE /api/animals/:id should delete animal", async () => {
      const response = await request(app).delete("/api/animals/1");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Animal deleted successfully");
    });

    it("GET /api/animals/summary should return summary statistics", async () => {
      const response = await request(app).get("/api/animals/summary");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("totalAnimals");
      expect(response.body).toHaveProperty("totalGoats");
      expect(response.body).toHaveProperty("totalSheep");
    });

    it("GET /api/weight-records should return weight records", async () => {
      const response = await request(app).get("/api/weight-records");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("POST /api/weight-records should create weight record", async () => {
      const response = await request(app)
        .post("/api/weight-records")
        .send(sampleWeightRecord);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ...sampleWeightRecord,
        id: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it("GET /api/breeding-records should return breeding records", async () => {
      const response = await request(app).get("/api/breeding-records");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("POST /api/breeding-records should create breeding record", async () => {
      const response = await request(app)
        .post("/api/breeding-records")
        .send(sampleBreedingRecord);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ...sampleBreedingRecord,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("GET /api/vaccination-records should return vaccination records", async () => {
      const response = await request(app).get("/api/vaccination-records");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("POST /api/vaccination-records should create vaccination record", async () => {
      const response = await request(app)
        .post("/api/vaccination-records")
        .send(sampleVaccinationRecord);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ...sampleVaccinationRecord,
        id: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it("GET /api/health-records should return health records", async () => {
      const response = await request(app).get("/api/health-records");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("POST /api/health-records should create health record", async () => {
      const response = await request(app)
        .post("/api/health-records")
        .send(sampleHealthRecord);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ...sampleHealthRecord,
        id: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it("GET /api/animals/backup should create animals backup", async () => {
      const response = await request(app).get("/api/animals/backup");
      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
    });
  });

  describe("Tasks API", () => {
    it("GET /api/tasks should return tasks list", async () => {
      const response = await request(app).get("/api/tasks");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("POST /api/tasks should create new task", async () => {
      const response = await request(app).post("/api/tasks").send(sampleTask);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ...sampleTask,
        id: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it("PUT /api/tasks/:id should update task", async () => {
      const updatedTask = { ...sampleTask, id: "1", title: "Updated Task" };

      const response = await request(app).put("/api/tasks/1").send(updatedTask);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Updated Task");
    });

    it("DELETE /api/tasks/:id should delete task", async () => {
      const response = await request(app).delete("/api/tasks/1");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task deleted successfully");
    });

    it("POST /api/tasks/bulk-delete should delete multiple tasks", async () => {
      const response = await request(app)
        .post("/api/tasks/bulk-delete")
        .send({ ids: ["1", "2", "3"] });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Tasks deleted successfully");
    });

    it("GET /api/tasks/backup should create tasks backup", async () => {
      const response = await request(app).get("/api/tasks/backup");
      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
    });

    it("POST /api/tasks/import should import tasks", async () => {
      const tasksToImport = [
        sampleTask,
        { ...sampleTask, title: "Another Task" },
      ];

      const response = await request(app)
        .post("/api/tasks/import")
        .send(tasksToImport);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Tasks imported successfully");
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 for non-existent expense", async () => {
      const response = await request(app).get("/api/expenses/non-existent-id");
      expect(response.status).toBe(404);
    });

    it("should handle 404 for non-existent animal", async () => {
      const response = await request(app).get("/api/animals/non-existent-id");
      expect(response.status).toBe(404);
    });

    it("should handle 404 for non-existent task", async () => {
      const response = await request(app).get("/api/tasks/non-existent-id");
      expect(response.status).toBe(404);
    });

    it("should handle invalid JSON in request body", async () => {
      const response = await request(app)
        .post("/api/expenses")
        .set("Content-Type", "application/json")
        .send("invalid json");

      expect(response.status).toBe(400);
    });

    it("should handle missing required fields in expense creation", async () => {
      const response = await request(app)
        .post("/api/expenses")
        .send({ date: "2024-01-15" }); // Missing required fields

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing required fields");
    });
  });

  describe("Data Filtering", () => {
    it("should filter weight records by animal ID", async () => {
      const response = await request(app).get("/api/weight-records?animalId=1");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should filter breeding records by animal ID", async () => {
      const response = await request(app).get(
        "/api/breeding-records?animalId=1",
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should filter vaccination records by animal ID", async () => {
      const response = await request(app).get(
        "/api/vaccination-records?animalId=1",
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should filter health records by animal ID", async () => {
      const response = await request(app).get("/api/health-records?animalId=1");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
