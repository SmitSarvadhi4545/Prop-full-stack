import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";
import { InsertUser } from "@shared/schema";

/**
 * Authentication service handling user management and JWT operations
 */
export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret =
      process.env.JWT_SECRET || "your-secret-key-change-in-production";
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hashed password
   */
  private async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate JWT token for user
   */
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string) {
    return await UserModel.findOne({ email }).exec();
  }

  /**
   * Find user by username
   */
  async findUserByUsername(username: string) {
    return await UserModel.findOne({ username }).exec();
  }

  /**
   * Create a new user account
   */
  async createUser(userData: InsertUser) {
    // Hash the password
    const hashedPassword = await this.hashPassword(userData.password);

    // Create user in database
    const user = new UserModel({
      ...userData,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT token
    const token = this.generateToken(user.userid);

    // Return user without password and token
    const userResponse = user.toJSON();

    return {
      user: userResponse,
      token,
    };
  }

  /**
   * Authenticate user and return user data with token
   */
  async authenticateUser(email: string, password: string) {
    // Find user by email
    const user = await UserModel.findOne({ email }).exec();

    if (!user) {
      return null;
    }

    // Check password
    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // Generate JWT token
    const token = this.generateToken(user.userid);

    // Return user without password and token
    const userResponse = user.toJSON();

    return {
      user: userResponse,
      token,
    };
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updateData: Partial<InsertUser>) {
    // Remove password from update data for security
    const { password, ...safeUpdateData } = updateData;

    const user = await UserModel.findByIdAndUpdate(userId, safeUpdateData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .exec();

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    // Get user with password
    const user = await UserModel.findById(userId).exec();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await this.comparePassword(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword);

    // Update password
    await UserModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    }).exec();

    return { message: "Password changed successfully" };
  }

  /**
   * Verify JWT token and return user ID
   */
  async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      const secret = process.env.JWT_SECRET || "your-secret-key";
      console.log(`Verifying token with secret: ${secret}`); // Log the secret key being used

      const decoded = jwt.verify(token, secret) as { userId: string };
      console.log(`Token successfully verified: ${JSON.stringify(decoded)}`); // Log the decoded token

      return decoded;
    } catch (error) {
      console.error("Token verification error:", error); // Log the error for debugging
      return null;
    }
  }

  /**
   * Get user by ID (without password)
   */
  async getUserById(userId: string) {
    return await UserModel.findById(userId).select("-password").exec();
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string) {
    return await UserModel.findByIdAndDelete(userId).exec();
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    // This could be extended to include playlist count, song count, etc.
    const user = await UserModel.findById(userId).select("-password").exec();

    if (!user) {
      throw new Error("User not found");
    }

    // You can add more statistics here by aggregating from other collections
    return {
      user,
      joinedDate: user.createdAt,
      // Add more stats as needed
    };
  }
}

export const authService = new AuthService();
