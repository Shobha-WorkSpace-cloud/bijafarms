import {
  AnimalRecord,
  WeightRecord,
  BreedingRecord,
  VaccinationRecord,
  HealthRecord,
  AnimalSummary,
} from "@shared/animal-types";
import { apiGet, apiPost, apiPut, apiDelete } from "./api-config";

// Animal CRUD operations
export const fetchAnimals = async (): Promise<AnimalRecord[]> => {
  return apiGet("/animals");
};

export const createAnimal = async (
  animal: Omit<AnimalRecord, "id" | "createdAt" | "updatedAt">,
): Promise<AnimalRecord> => {
  return apiPost("/animals", animal);
};

export const updateAnimal = async (
  id: string,
  animal: AnimalRecord,
): Promise<AnimalRecord> => {
  return apiPut(`/animals/${id}`, animal);
};

export const deleteAnimal = async (id: string): Promise<void> => {
  return apiDelete(`/animals/${id}`);
};

// Weight records
export const fetchWeightRecords = async (
  animalId?: string,
): Promise<WeightRecord[]> => {
  const url = animalId
    ? `${API_BASE}/weight-records?animalId=${animalId}&t=${Date.now()}`
    : `${API_BASE}/weight-records?t=${Date.now()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch weight records");
  }
  return response.json();
};

export const createWeightRecord = async (
  record: Omit<WeightRecord, "id" | "createdAt">,
): Promise<WeightRecord> => {
  const response = await fetch(`${API_BASE}/weight-records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error("Failed to create weight record");
  }

  return response.json();
};

// Breeding records
export const fetchBreedingRecords = async (
  animalId?: string,
): Promise<BreedingRecord[]> => {
  const url = animalId
    ? `${API_BASE}/breeding-records?animalId=${animalId}&t=${Date.now()}`
    : `${API_BASE}/breeding-records?t=${Date.now()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch breeding records");
  }
  return response.json();
};

export const createBreedingRecord = async (
  record: Omit<BreedingRecord, "id" | "createdAt" | "updatedAt">,
): Promise<BreedingRecord> => {
  const response = await fetch(`${API_BASE}/breeding-records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error("Failed to create breeding record");
  }

  return response.json();
};

// Vaccination records
export const fetchVaccinationRecords = async (
  animalId?: string,
): Promise<VaccinationRecord[]> => {
  const url = animalId
    ? `${API_BASE}/vaccination-records?animalId=${animalId}&t=${Date.now()}`
    : `${API_BASE}/vaccination-records?t=${Date.now()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch vaccination records");
  }
  return response.json();
};

export const createVaccinationRecord = async (
  record: Omit<VaccinationRecord, "id" | "createdAt">,
): Promise<VaccinationRecord> => {
  const response = await fetch(`${API_BASE}/vaccination-records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error("Failed to create vaccination record");
  }

  return response.json();
};

// Health records
export const fetchHealthRecords = async (
  animalId?: string,
): Promise<HealthRecord[]> => {
  const url = animalId
    ? `${API_BASE}/health-records?animalId=${animalId}&t=${Date.now()}`
    : `${API_BASE}/health-records?t=${Date.now()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch health records");
  }
  return response.json();
};

export const createHealthRecord = async (
  record: Omit<HealthRecord, "id" | "createdAt">,
): Promise<HealthRecord> => {
  const response = await fetch(`${API_BASE}/health-records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error("Failed to create health record");
  }

  return response.json();
};

// Dashboard summary
export const fetchAnimalSummary = async (): Promise<AnimalSummary> => {
  const response = await fetch(`${API_BASE}/animals/summary?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch animal summary");
  }
  return response.json();
};

// Backup
export const createAnimalBackup = async (): Promise<Blob> => {
  const response = await fetch(`${API_BASE}/animals/backup`);
  if (!response.ok) {
    throw new Error("Failed to create backup");
  }
  return response.blob();
};

export type {
  AnimalRecord,
  WeightRecord,
  BreedingRecord,
  VaccinationRecord,
  HealthRecord,
  AnimalSummary,
};
