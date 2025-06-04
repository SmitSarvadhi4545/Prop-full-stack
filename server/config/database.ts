import mongoose from 'mongoose';

/**
 * Connects to MongoDB database using environment variables
 * Handles connection events and provides proper error handling
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/playlist-manager';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    };

    await mongoose.connect(mongoUri, options);
    
    console.log('📦 Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
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
    console.log('📦 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};
