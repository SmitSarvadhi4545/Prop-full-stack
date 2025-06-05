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
    res.setHeader("Content-Type", "application/json");
    next();
  });

  // JWT verification middleware helper
  app.use("/api", (req: any, res, next) => {
    console.log(`Incoming request path: ${req.path}`); // Log the request path

    // Skip auth for public routes
    const publicRoutes = [
      "/health",
      "/auth/register",
      "/auth/login",
      "/spotify/search",
      "/spotify/track/",
      "/spotify/status",
      "/songs",
    ];

    const isPublicRoute = publicRoutes.some(
      (route) => req.path === route || req.path.startsWith(route)
    );

    console.log(`Is public route: ${isPublicRoute}`); // Log whether the route is public

    if (isPublicRoute) {
      return next();
    }

    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    console.log(`Authorization header: ${authHeader}`); // Log the Authorization header

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Access token missing or invalid"); // Log missing or invalid token

      return res.status(401).json({
        success: false,
        error: "Access token required",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log(`Extracted token: ${token}`); // Log the extracted token

    try {
      const decoded = authService.verifyToken(token);
      console.log(`Decoded token: ${JSON.stringify(decoded)}`); // Log the decoded token

      if (!decoded) {
        console.log("Token verification failed"); // Log token verification failure

        return res.status(401).json({
          success: false,
          error: "Invalid or expired token",
        });
      }

      // Attach user ID to request for downstream middleware
      req.user = { id: decoded.userId };
      console.log(`User attached to request: ${JSON.stringify(req.user)}`); // Log attached user

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }
  });
}

/**
 * Generate JWT token for user authentication
 */
export function generateToken(userId: string): string {
  console.log(
    `Generating token for user ID: ${userId}  -- ${process.env.JWT_SECRET}`
  ); // Log user ID for token generation
  const secret = process.env.JWT_SECRET || "your-secret-key";

  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

/**
 * Verify JWT token and return user data
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    console.log(`Verifying token secret: ${process.env.JWT_SECRET}`); // Log the token being verified
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}
