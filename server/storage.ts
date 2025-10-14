// Storage interface for the application
// Currently not used as image processing is stateless
// Can be extended for features like image history, user preferences, etc.

export interface IStorage {
  // Add storage methods here as needed
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize storage
  }
}

export const storage = new MemStorage();
