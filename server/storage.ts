// This file is kept for compatibility with the existing stack
// but the actual data storage is handled by MongoDB through Mongoose models

import { User, InsertUser } from "@shared/schema";
import { UserModel } from "./models/User";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: any;
}

export class MongoStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Use memory store for sessions in development
    // In production, you might want to use Redis or MongoDB session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).select('-password').exec();
    return user ? user.toJSON() : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username }).select('-password').exec();
    return user ? user.toJSON() : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = new UserModel(insertUser);
    await user.save();
    return user.toJSON();
  }
}

export const storage = new MongoStorage();
