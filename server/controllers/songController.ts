import { Request, Response } from 'express';
import { songService } from '../services/songService';
import { insertSongSchema } from '@shared/schema';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Song controller handling song-related operations
 */
export class SongController {
  /**
   * Get all songs with pagination and search
   * GET /api/songs?page=1&limit=20&search=query
   */
  async getSongs(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const result = await songService.getSongs(page, limit, search);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get songs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch songs'
      });
    }
  }

  /**
   * Get a specific song by ID
   * GET /api/songs/:id
   */
  async getSongById(req: Request, res: Response): Promise<void> {
    try {
      const songId = req.params.id;

      if (!songId) {
        res.status(400).json({
          success: false,
          error: 'Song ID is required'
        });
        return;
      }

      const song = await songService.getSongById(songId);

      if (!song) {
        res.status(404).json({
          success: false,
          error: 'Song not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: song
      });
    } catch (error) {
      console.error('Get song error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch song'
      });
    }
  }

  /**
   * Get song by Spotify ID (or create if doesn't exist)
   * GET /api/songs/spotify/:spotifyId
   */
  async getSongBySpotifyId(req: Request, res: Response): Promise<void> {
    try {
      const spotifyId = req.params.spotifyId;

      if (!spotifyId) {
        res.status(400).json({
          success: false,
          error: 'Spotify ID is required'
        });
        return;
      }

      const song = await songService.getSongBySpotifyId(spotifyId);

      if (!song) {
        res.status(404).json({
          success: false,
          error: 'Song not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: song
      });
    } catch (error) {
      console.error('Get song by Spotify ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch song'
      });
    }
  }

  /**
   * Create a new song (typically called when adding from Spotify)
   * POST /api/songs
   */
  async createSong(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Validate request body
      const validationResult = insertSongSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validationResult.error.errors
        });
        return;
      }

      const songData = validationResult.data;

      // Check if song already exists by Spotify ID
      const existingSong = await songService.getSongBySpotifyId(songData.spotifyId);
      
      if (existingSong) {
        res.status(200).json({
          success: true,
          data: existingSong,
          message: 'Song already exists'
        });
        return;
      }

      const song = await songService.createSong(songData);

      res.status(201).json({
        success: true,
        data: song,
        message: 'Song created successfully'
      });
    } catch (error) {
      console.error('Create song error:', error);
      
      if (error instanceof Error && error.message.includes('duplicate')) {
        res.status(409).json({
          success: false,
          error: 'Song with this Spotify ID already exists'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to create song'
        });
      }
    }
  }

  /**
   * Update song information
   * PUT /api/songs/:id
   */
  async updateSong(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const songId = req.params.id;

      if (!songId) {
        res.status(400).json({
          success: false,
          error: 'Song ID is required'
        });
        return;
      }

      // Create a partial update schema
      const updateSchema = insertSongSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validationResult.error.errors
        });
        return;
      }

      const updatedSong = await songService.updateSong(songId, validationResult.data);

      if (!updatedSong) {
        res.status(404).json({
          success: false,
          error: 'Song not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedSong,
        message: 'Song updated successfully'
      });
    } catch (error) {
      console.error('Update song error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update song'
      });
    }
  }

  /**
   * Delete a song
   * DELETE /api/songs/:id
   */
  async deleteSong(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const songId = req.params.id;

      if (!songId) {
        res.status(400).json({
          success: false,
          error: 'Song ID is required'
        });
        return;
      }

      const deleted = await songService.deleteSong(songId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Song not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Song deleted successfully'
      });
    } catch (error) {
      console.error('Delete song error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete song'
      });
    }
  }

  /**
   * Get songs that are most popular (used in most playlists)
   * GET /api/songs/popular?limit=20
   */
  async getPopularSongs(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      
      const songs = await songService.getPopularSongs(limit);

      res.status(200).json({
        success: true,
        data: songs
      });
    } catch (error) {
      console.error('Get popular songs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch popular songs'
      });
    }
  }
}

export const songController = new SongController();
