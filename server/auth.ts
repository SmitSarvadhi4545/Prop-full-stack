import { Express } from "express";
import * as jwt from "jsonwebtoken";
import { authService } from "./services/authService";

/**
 * Setup authentication middleware and configuration
 * This configures JWT authentication for the Express app
 */
export function setupAuth(app: Express) {
  // Middleware to parse JSON bodies
  app.use((req, res, next) => {
    // Set default headers for API responses
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // JWT verification middleware helper
  app.use('/api', (req: any, res, next) => {
    // Skip auth for public routes
    const publicRoutes = [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/spotify/search',
      '/api/spotify/track/',
      '/api/spotify/status',
      '/api/songs'
    ];

    const isPublicRoute = publicRoutes.some(route => 
      req.path === route || req.path.startsWith(route)
    );

    if (isPublicRoute) {
      return next();
    }

    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = authService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      // Attach user ID to request for downstream middleware
      req.user = { id: decoded.userId };
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  });
}

/**
 * Generate JWT token for user authentication
 */
export function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

/**
 * Verify JWT token and return user data
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}