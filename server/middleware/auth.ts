import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to authenticate JWT tokens and attach user to request
 * Verifies the token and retrieves user information from database
 */
// export const authenticateToken = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

//     if (!token) {
//       res.status(401).json({
//         success: false,
//         error: 'Access token required'
//       });
//       return;
//     }

//     console.log("aaaaaaaaaaaaaaaaaaaaaa",process.env.JWT_SECRET);

//     const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

//     // Verify the JWT token
//     const decoded = jwt.verify(token, jwtSecret) as { userId: string };

//     // Get user from database (excluding password)
//     const user = await UserModel.findById(decoded.userId).select('-password');

//     if (!user) {
//       res.status(401).json({
//         success: false,
//         error: 'User not found'
//       });
//       return;
//     }

//     // Attach user to request object
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Auth middleware error:', error);

//     if (error instanceof jwt.JsonWebTokenError) {
//       res.status(401).json({
//         success: false,
//         error: 'Invalid token'
//       });
//     } else {
//       res.status(500).json({
//         success: false,
//         error: 'Authentication failed'
//       });
//     }
//   }
// };
export const authenticateToken = async (
  req: any,
  res: any,
  next: any
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Access token required" });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || "default-secret";

    const decoded = jwt.verify(token, jwtSecret); // Verify token with the correct secret
    if (typeof decoded === "object" && "userId" in decoded) {
      req.user = { id: decoded.userId };
    } else {
      throw new Error("Invalid token payload");
    }
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ success: false, error: "Invalid token" });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (token) {
      const jwtSecret =
        process.env.JWT_SECRET || "your-secret-key-change-in-production";
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      const user = await UserModel.findById(decoded.userId).select("-password");
      req.user = user;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};
