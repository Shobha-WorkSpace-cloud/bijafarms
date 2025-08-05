import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createServer } from "../index";
import fs from "fs";
import path from "path";

// Test data directory
const TEST_DATA_DIR = path.join(process.cwd(), "server/test-data");

// Backup original data files
const ORIGINAL_DATA_DIR = path.join(process.cwd(), "server/data");
const backupFiles = [
  "expenses.json",
  "animals.json", 
  "TaskTracker.json",
  "categories.json",
  "weight-records.json",
  "breeding-records.json",
  "vaccination-records.json",
  "health-records.json"
];

describe("Integration Tests - File Operations", () => {
  let app: any;

  beforeEach(() => {
    // Create test data directory
    if (!fs.existsSync(TEST_DATA_DIR)) {
      fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    }

    // Create empty test data files
    backupFiles.forEach(file => {
      const testFile = path.join(TEST_DATA_DIR, file);
      fs.writeFileSync(testFile, "[]");
    });

    // Override process.cwd() to use test directory
    const originalCwd = process.cwd;
    process.cwd = () => TEST_DATA_DIR.replace("/server/test-data", "");
    
    app = createServer();
  });

  afterEach(() => {
    // Clean up test data directory
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
    }
  });

  describe("Expenses File Operations", () => {
    it("should persist expenses to file", async () => {
      const expense = {
        date: "2024-01-15",
        type: "Expense",
        description: "Test expense for file persistence",
        amount: 100,
        paidBy: "Test User",
        category: "Test Category",
        subCategory: "Test Sub",
        source: "Test Source",
        notes: "Test notes",
      };

      // Create expense
      const createResponse = await request(app)
        .post("/api/expenses")
        .send(expense);
      
      expect(createResponse.status).toBe(201);
      const createdExpense = createResponse.body;

      // Verify it's persisted by fetching all expenses
      const getResponse = await request(app).get("/api/expenses");
      expect(getResponse.status).toBe(200);
      
      const expenses = getResponse.body;
      const foundExpense = expenses.find((e: any) => e.id === createdExpense.id);
      expect(foundExpense).toBeDefined();
      expect(foundExpense.description).toBe(expense.description);
    });

    it("should handle bulk operations correctly", async () => {
      // Create multiple expenses
      const expenses = [
        {
          date: "2024-01-15",
          type: "Expense",
          description: "Bulk test 1",
          amount: 100,
          paidBy: "User 1",
          category: "Category 1",
          subCategory: "Sub 1",
          source: "Source 1",
          notes: "Notes 1",
        },
        {
          date: "2024-01-16", 
          type: "Expense",
          description: "Bulk test 2",
          amount: 200,
          paidBy: "User 2",
          category: "Category 2",
          subCategory: "Sub 2",
          source: "Source 2",
          notes: "Notes 2",
        }
      ];

      const createdIds: string[] = [];

      // Create expenses
      for (const expense of expenses) {
        const response = await request(app)
          .post("/api/expenses")
          .send(expense);
        expect(response.status).toBe(201);
        createdIds.push(response.body.id);
      }

      // Verify all created
      const getResponse = await request(app).get("/api/expenses");
      expect(getResponse.body.length).toBe(2);

      // Bulk delete
      const deleteResponse = await request(app)
        .post("/api/expenses/bulk-delete")
        .send({ ids: createdIds });
      
      expect(deleteResponse.status).toBe(200);

      // Verify all deleted
      const finalGetResponse = await request(app).get("/api/expenses");
      expect(finalGetResponse.body.length).toBe(0);
    });
  });

  describe("Animals File Operations", () => {
    it("should persist animals to file", async () => {
      const animal = {
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

      // Create animal
      const createResponse = await request(app)
        .post("/api/animals")
        .send(animal);
      
      expect(createResponse.status).toBe(201);
      const createdAnimal = createResponse.body;

      // Verify persistence
      const getResponse = await request(app).get("/api/animals");
      expect(getResponse.status).toBe(200);
      
      const animals = getResponse.body;
      const foundAnimal = animals.find((a: any) => a.id === createdAnimal.id);
      expect(foundAnimal).toBeDefined();
      expect(foundAnimal.name).toBe(animal.name);
    });

    it("should handle related records correctly", async () => {
      // Create animal first
      const animal = {
        name: "Test Animal for Records",
        type: "goat",
        breed: "Test Breed",
        gender: "female",
        status: "active",
        currentWeight: 25,
      };

      const animalResponse = await request(app)
        .post("/api/animals")
        .send(animal);
      
      const createdAnimal = animalResponse.body;

      // Create weight record
      const weightRecord = {
        animalId: createdAnimal.id,
        weight: 30,
        date: "2024-01-15",
        notes: "Test weight record",
        recordedBy: "Test User",
      };

      const weightResponse = await request(app)
        .post("/api/weight-records")
        .send(weightRecord);
      
      expect(weightResponse.status).toBe(201);

      // Verify weight record persistence
      const getWeightResponse = await request(app)
        .get(`/api/weight-records?animalId=${createdAnimal.id}`);
      
      expect(getWeightResponse.status).toBe(200);
      expect(getWeightResponse.body.length).toBe(1);
      expect(getWeightResponse.body[0].weight).toBe(30);
    });
  });

  describe("Tasks File Operations", () => {
    it("should persist tasks to file", async () => {
      const task = {
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

      // Create task
      const createResponse = await request(app)
        .post("/api/tasks")
        .send(task);
      
      expect(createResponse.status).toBe(201);
      const createdTask = createResponse.body;

      // Verify persistence
      const getResponse = await request(app).get("/api/tasks");
      expect(getResponse.status).toBe(200);
      
      const tasks = getResponse.body;
      const foundTask = tasks.find((t: any) => t.id === createdTask.id);
      expect(foundTask).toBeDefined();
      expect(foundTask.title).toBe(task.title);
    });
  });

  describe("Data Consistency", () => {
    it("should maintain data integrity across operations", async () => {
      // Create animal
      const animal = {
        name: "Consistency Test Animal",
        type: "goat",
        breed: "Test Breed",
        gender: "female",
        status: "active",
        currentWeight: 25,
      };

      const animalResponse = await request(app)
        .post("/api/animals")
        .send(animal);
      
      const createdAnimal = animalResponse.body;

      // Create multiple related records
      const weightRecord = {
        animalId: createdAnimal.id,
        weight: 30,
        date: "2024-01-15",
        notes: "Weight record",
        recordedBy: "Test User",
      };

      const healthRecord = {
        animalId: createdAnimal.id,
        recordType: "checkup",
        date: "2024-01-15",
        description: "Health checkup",
        veterinarianName: "Dr. Test",
        diagnosis: "Healthy",
        cost: 200,
        notes: "Health record",
      };

      // Create both records
      await request(app).post("/api/weight-records").send(weightRecord);
      await request(app).post("/api/health-records").send(healthRecord);

      // Verify all data exists
      const animalsResponse = await request(app).get("/api/animals");
      const weightsResponse = await request(app).get("/api/weight-records");
      const healthResponse = await request(app).get("/api/health-records");

      expect(animalsResponse.body.length).toBe(1);
      expect(weightsResponse.body.length).toBe(1);
      expect(healthResponse.body.length).toBe(1);

      // Verify relationships
      expect(weightsResponse.body[0].animalId).toBe(createdAnimal.id);
      expect(healthResponse.body[0].animalId).toBe(createdAnimal.id);
    });
  });
});
