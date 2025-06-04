import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDatabase, setupDatabaseEvents } from "./config/database";
import { setupAuth } from "./auth";
import { authRoutes } from "./routes/authRoutes";
import { playlistRoutes } from "./routes/playlistRoutes";
import { songRoutes } from "./routes/songRoutes";
import { spotifyRoutes } from "./routes/spotifyRoutes";
import cors from "cors";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for cross-origin requests
  app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:5000', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
  }));

  // Connect to MongoDB
  await connectDatabase();
  setupDatabaseEvents();

  // Setup authentication (passport, sessions, etc.)
  setupAuth(app);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Music Playlist Management API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Register API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/playlists', playlistRoutes);
  app.use('/api/songs', songRoutes);
  app.use('/api/spotify', spotifyRoutes);

  // Legacy auth routes for compatibility
  app.use('/api', authRoutes);

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Global error handler:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: err.message
      });
    }
    
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate resource',
        details: 'A resource with this information already exists'
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
