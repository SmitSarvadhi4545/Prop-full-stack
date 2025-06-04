import { Request, Response } from 'express';
import { spotifyService } from '../services/spotifyService';
import { songService } from '../services/songService';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Spotify controller handling integration with Spotify Web API
 */
export class SpotifyController {
  /**
   * Search for tracks on Spotify
   * GET /api/spotify/search?q=query&page=1&limit=20
   */
  async searchTracks(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
        return;
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      const searchResults = await spotifyService.searchTracks(query, limit, offset);

      res.status(200).json({
        success: true,
        data: searchResults.tracks.items,
        pagination: {
          page,
          limit,
          total: searchResults.tracks.total,
          totalPages: Math.ceil(searchResults.tracks.total / limit),
          offset: searchResults.tracks.offset
        }
      });
    } catch (error) {
      console.error('Spotify search error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Spotify')) {
          res.status(503).json({
            success: false,
            error: 'Spotify service unavailable. Please try again later.'
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Search failed. Please try again.'
          });
        }
      } else {
        res.status(500).json({
          success: false,
          error: 'An unexpected error occurred'
        });
      }
    }
  }

  /**
   * Get detailed track information from Spotify
   * GET /api/spotify/track/:id
   */
  async getTrackDetails(req: Request, res: Response): Promise<void> {
    try {
      const trackId = req.params.id;

      if (!trackId) {
        res.status(400).json({
          success: false,
          error: 'Track ID is required'
        });
        return;
      }

      const track = await spotifyService.getTrack(trackId);

      res.status(200).json({
        success: true,
        data: track
      });
    } catch (error) {
      console.error('Get track details error:', error);
      
      if (error instanceof Error && error.message.includes('404')) {
        res.status(404).json({
          success: false,
          error: 'Track not found on Spotify'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch track details'
        });
      }
    }
  }

  /**
   * Add a track from Spotify to our database and return the song ID
   * POST /api/spotify/add-track
   */
  async addTrackToDatabase(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { spotifyId } = req.body;

      if (!spotifyId) {
        res.status(400).json({
          success: false,
          error: 'Spotify track ID is required'
        });
        return;
      }

      // Check if song already exists in our database
      let song = await songService.getSongBySpotifyId(spotifyId);

      if (song) {
        res.status(200).json({
          success: true,
          data: song,
          message: 'Song already exists in database'
        });
        return;
      }

      // Get track details from Spotify
      const spotifyTrack = await spotifyService.getTrack(spotifyId);

      // Convert Spotify track to our song format
      const songData = {
        spotifyId: spotifyTrack.id,
        name: spotifyTrack.name,
        artist: spotifyTrack.artists.map(artist => artist.name).join(', '),
        album: spotifyTrack.album.name,
        duration: spotifyTrack.duration_ms,
        imageUrl: spotifyTrack.album.images[0]?.url,
        previewUrl: spotifyTrack.preview_url
      };

      // Create song in our database
      song = await songService.createSong(songData);

      res.status(201).json({
        success: true,
        data: song,
        message: 'Song added to database successfully'
      });
    } catch (error) {
      console.error('Add track to database error:', error);
      
      if (error instanceof Error && error.message.includes('404')) {
        res.status(404).json({
          success: false,
          error: 'Track not found on Spotify'
        });
      } else if (error instanceof Error && error.message.includes('duplicate')) {
        res.status(409).json({
          success: false,
          error: 'Song already exists in database'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to add song to database'
        });
      }
    }
  }

  /**
   * Get multiple tracks from Spotify
   * GET /api/spotify/tracks?ids=id1,id2,id3
   */
  async getMultipleTracks(req: Request, res: Response): Promise<void> {
    try {
      const ids = req.query.ids as string;

      if (!ids) {
        res.status(400).json({
          success: false,
          error: 'Track IDs are required'
        });
        return;
      }

      const trackIds = ids.split(',').map(id => id.trim()).slice(0, 50); // Spotify allows max 50 tracks

      const tracks = await spotifyService.getMultipleTracks(trackIds);

      res.status(200).json({
        success: true,
        data: tracks
      });
    } catch (error) {
      console.error('Get multiple tracks error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tracks'
      });
    }
  }

  /**
   * Get Spotify configuration status (for debugging)
   * GET /api/spotify/status
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await spotifyService.getConfigurationStatus();

      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Get Spotify status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get Spotify status'
      });
    }
  }

  /**
   * Get featured playlists from Spotify (for inspiration)
   * GET /api/spotify/featured?limit=20
   */
  async getFeaturedPlaylists(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      
      const playlists = await spotifyService.getFeaturedPlaylists(limit);

      res.status(200).json({
        success: true,
        data: playlists
      });
    } catch (error) {
      console.error('Get featured playlists error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch featured playlists'
      });
    }
  }
}

export const spotifyController = new SpotifyController();
