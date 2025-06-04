import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

/**
 * Connects to MongoDB database using environment variables
 * Handles connection events and provides proper error handling
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    let mongoUri: string;
    
    // Use environment MongoDB URI if available, otherwise use in-memory MongoDB
    if (process.env.MONGODB_URI) {
      mongoUri = process.env.MONGODB_URI;
    } else {
      // Start in-memory MongoDB for development
      mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'playlist-manager'
        }
      });
      mongoUri = mongod.getUri();
      console.log('🟡 Using in-memory MongoDB for development');
    }
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };

    await mongoose.connect(mongoUri, options);
    
    console.log('📦 Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't exit process in development, just log the error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

/**
 * Handles MongoDB connection events
 */
export const setupDatabaseEvents = (): void => {
  mongoose.connection.on('connected', () => {
    console.log('🟢 MongoDB connected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('🔴 MongoDB error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🟡 MongoDB disconnected');
  });

  // Handle application termination
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('📦 MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
      process.exit(1);
    }
  });
};

/**
 * Disconnects from MongoDB database
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    
    // Stop in-memory MongoDB if it was used
    if (mongod) {
      await mongod.stop();
    }
    
    console.log('📦 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};
