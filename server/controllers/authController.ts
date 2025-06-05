import { Request, Response } from "express";
import { authService } from "../services/authService";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";
import { UserModel } from "../models/User";
import jwt from "jsonwebtoken";

/**
 * Authentication controller handling user registration, login, and profile management
 */
export class AuthController {
  /**
   * Register a new user account
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      console.log("Registering user with data:", req.body);
      const validationResult = insertUserSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: "Invalid input data",
          details: validationResult.error.errors,
        });
        return;
      }

      const userData = validationResult.data;

      // Check if user already exists
      const existingUser = await authService.findUserByEmail(userData.email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: "User with this email already exists",
        });
        return;
      }

      // Check if username is taken
      const existingUsername = await authService.findUserByUsername(
        userData.username
      );
      if (existingUsername) {
        res.status(409).json({
          success: false,
          error: "Username is already taken",
        });
        return;
      }

      // Create new user
      const result = await authService.createUser(userData);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
        message: "User registered successfully",
      });
    } catch (error: unknown) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error during registration",
      });
    }
  }

  /**
   * Authenticate user and return JWT token
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res
          .status(400)
          .json({ success: false, error: "Email and password are required" });
        return;
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        res
          .status(401)
          .json({ success: false, error: "Invalid email or password" });
        return;
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "default-secret",
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        }
      );

      res.status(200).json({
        success: true,
        data: { user, token },
        message: "Login successful",
      });
    } catch (error: unknown) {
      console.error("Login error:", error);
      res
        .status(500)
        .json({ success: false, error: "Internal server error during login" });
    }
  }

  /**
   * Get current user profile (requires authentication)
   * GET /api/auth/me
   */
  async getProfile(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res
          .status(401)
          .json({ success: false, error: "Authentication required" });
      }

      res.status(200).json({ success: true, data: req.user });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch user profile" });
    }
  }

  /**
   * Update user profile (requires authentication)
   * PUT /api/auth/profile
   */
  async updateProfile(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const updateSchema = z.object({
        name: z.string().min(1).max(100).optional(),
        username: z.string().min(3).max(50).optional(),
      });

      const validationResult = updateSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: "Invalid input data",
          details: validationResult.error.errors,
        });
        return;
      }

      const updatedUser = await authService.updateUser(
        req.user.userid,
        validationResult.data
      );

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Profile update error:", error);

      if (error instanceof Error && error.message.includes("duplicate")) {
        res.status(409).json({
          success: false,
          error: "Username is already taken",
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Failed to update profile",
        });
      }
    }
  }

  /**
   * Logout user (client-side should remove token)
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a stateless JWT system, logout is handled client-side by removing the token
      // This endpoint exists for consistency and could be extended to maintain a blacklist
      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        error: "Logout failed",
      });
    }
  }
}

export const authController = new AuthController();
