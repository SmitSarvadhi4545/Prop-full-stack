import { z } from 'zod';

/**
 * Common validation utilities and schemas
 */

// MongoDB ObjectId validation
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

// Search query validation
export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20)
});

// Email validation with common patterns
export const emailSchema = z.string()
  .email('Invalid email format')
  .min(5, 'Email too short')
  .max(254, 'Email too long')
  .transform(email => email.toLowerCase().trim());

// Password validation with strength requirements
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/^(?=.*\d)/, 'Password must contain at least one number')
  .regex(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character');

// Username validation
export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .transform(username => username.toLowerCase().trim());

// Spotify ID validation
export const spotifyIdSchema = z.string()
  .min(22, 'Invalid Spotify ID')
  .max(22, 'Invalid Spotify ID')
  .regex(/^[a-zA-Z0-9]+$/, 'Spotify ID contains invalid characters');

// Duration validation (milliseconds)
export const durationSchema = z.number()
  .int('Duration must be an integer')
  .min(1000, 'Duration must be at least 1 second')
  .max(3600000, 'Duration cannot exceed 1 hour');

// URL validation
export const urlSchema = z.string()
  .url('Invalid URL format')
  .max(2048, 'URL too long');

// Playlist name validation
export const playlistNameSchema = z.string()
  .min(1, 'Playlist name is required')
  .max(100, 'Playlist name too long')
  .trim();

// Song name validation
export const songNameSchema = z.string()
  .min(1, 'Song name is required')
  .max(200, 'Song name too long')
  .trim();

// Artist name validation
export const artistNameSchema = z.string()
  .min(1, 'Artist name is required')
  .max(200, 'Artist name too long')
  .trim();

// Album name validation
export const albumNameSchema = z.string()
  .min(1, 'Album name is required')
  .max(200, 'Album name too long')
  .trim();

/**
 * Validation middleware factory
 */
export function validateSchema(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const validationResult = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors
        });
      }

      // Replace req data with validated data
      req.body = validationResult.data.body || req.body;
      req.query = validationResult.data.query || req.query;
      req.params = validationResult.data.params || req.params;

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Validation error'
      });
    }
  };
}

/**
 * Common validation schemas for API endpoints
 */
export const apiValidationSchemas = {
  // Authentication
  register: z.object({
    body: z.object({
      username: usernameSchema,
      email: emailSchema,
      password: passwordSchema,
      name: z.string().min(1).max(100).trim()
    })
  }),

  login: z.object({
    body: z.object({
      email: emailSchema,
      password: z.string().min(1)
    })
  }),

  // Playlists
  createPlaylist: z.object({
    body: z.object({
      name: playlistNameSchema,
      description: z.string().max(500).optional()
    })
  }),

  updatePlaylist: z.object({
    params: z.object({
      id: objectIdSchema
    }),
    body: z.object({
      name: playlistNameSchema.optional(),
      description: z.string().max(500).optional()
    }).refine(data => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update'
    })
  }),

  // Songs
  createSong: z.object({
    body: z.object({
      spotifyId: spotifyIdSchema,
      name: songNameSchema,
      artist: artistNameSchema,
      album: albumNameSchema,
      duration: durationSchema,
      imageUrl: urlSchema.optional(),
      previewUrl: urlSchema.optional()
    })
  }),

  // Search and pagination
  searchQuery: z.object({
    query: z.object({
      q: z.string().min(1).max(200),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20)
    })
  }),

  pagination: z.object({
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      search: z.string().max(200).optional()
    })
  })
};

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate and sanitize search queries
 */
export function sanitizeSearchQuery(query: string): string {
  return sanitizeInput(query)
    .replace(/[^\w\s-_.]/g, '') // Keep only alphanumeric, spaces, hyphens, underscores, and dots
    .slice(0, 200); // Limit length
}
