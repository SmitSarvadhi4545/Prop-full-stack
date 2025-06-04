import { SongModel } from '../models/Song';
import { PlaylistModel } from '../models/Playlist';
import { InsertSong, PaginatedResponse, Song } from '@shared/schema';

/**
 * Song service handling business logic for song operations
 */
export class SongService {
  /**
   * Get all songs with pagination and search
   */
  async getSongs(
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<PaginatedResponse<Song>> {
    const offset = (page - 1) * limit;
    
    // Build search query
    let searchQuery = {};
    
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { artist: { $regex: search, $options: 'i' } },
          { album: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get total count for pagination
    const total = await SongModel.countDocuments(searchQuery);
    
    // Get songs
    const songs = await SongModel.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return {
      data: songs.map(song => song.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a specific song by ID
   */
  async getSongById(songId: string): Promise<Song | null> {
    const song = await SongModel.findById(songId).exec();
    return song ? song.toJSON() : null;
  }

  /**
   * Get a song by Spotify ID
   */
  async getSongBySpotifyId(spotifyId: string): Promise<Song | null> {
    const song = await SongModel.findOne({ spotifyId }).exec();
    return song ? song.toJSON() : null;
  }

  /**
   * Create a new song
   */
  async createSong(songData: InsertSong): Promise<Song> {
    // Check if song with this Spotify ID already exists
    const existingSong = await SongModel.findOne({ spotifyId: songData.spotifyId }).exec();
    
    if (existingSong) {
      return existingSong.toJSON();
    }

    const song = new SongModel(songData);
    await song.save();
    
    return song.toJSON();
  }

  /**
   * Update an existing song
   */
  async updateSong(songId: string, updateData: Partial<InsertSong>): Promise<Song | null> {
    const song = await SongModel.findByIdAndUpdate(
      songId,
      updateData,
      { new: true, runValidators: true }
    ).exec();

    return song ? song.toJSON() : null;
  }

  /**
   * Delete a song
   * Note: This will also remove the song from all playlists
   */
  async deleteSong(songId: string): Promise<boolean> {
    // Remove song from all playlists first
    await PlaylistModel.updateMany(
      { songs: songId },
      { $pull: { songs: songId } }
    ).exec();

    // Delete the song
    const result = await SongModel.findByIdAndDelete(songId).exec();
    return !!result;
  }

  /**
   * Get songs that are most popular (used in most playlists)
   */
  async getPopularSongs(limit: number = 20): Promise<any[]> {
    const popularSongs = await PlaylistModel.aggregate([
      // Unwind songs array to get individual song documents
      { $unwind: '$songs' },
      
      // Group by song ID and count occurrences
      {
        $group: {
          _id: '$songs',
          playlistCount: { $sum: 1 }
        }
      },
      
      // Sort by playlist count (most popular first)
      { $sort: { playlistCount: -1 } },
      
      // Limit results
      { $limit: limit },
      
      // Lookup song details
      {
        $lookup: {
          from: 'songs',
          localField: '_id',
          foreignField: '_id',
          as: 'songDetails'
        }
      },
      
      // Unwind song details
      { $unwind: '$songDetails' },
      
      // Project final structure
      {
        $project: {
          _id: '$songDetails._id',
          spotifyId: '$songDetails.spotifyId',
          name: '$songDetails.name',
          artist: '$songDetails.artist',
          album: '$songDetails.album',
          duration: '$songDetails.duration',
          imageUrl: '$songDetails.imageUrl',
          previewUrl: '$songDetails.previewUrl',
          playlistCount: 1,
          createdAt: '$songDetails.createdAt',
          updatedAt: '$songDetails.updatedAt'
        }
      }
    ]);

    return popularSongs;
  }

  /**
   * Get recently added songs
   */
  async getRecentSongs(limit: number = 20): Promise<Song[]> {
    const songs = await SongModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return songs.map(song => song.toJSON());
  }

  /**
   * Get songs by artist
   */
  async getSongsByArtist(
    artist: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Song>> {
    const offset = (page - 1) * limit;
    
    const searchQuery = {
      artist: { $regex: artist, $options: 'i' }
    };

    const total = await SongModel.countDocuments(searchQuery);
    
    const songs = await SongModel.find(searchQuery)
      .sort({ name: 1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return {
      data: songs.map(song => song.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get songs by album
   */
  async getSongsByAlbum(
    album: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Song>> {
    const offset = (page - 1) * limit;
    
    const searchQuery = {
      album: { $regex: album, $options: 'i' }
    };

    const total = await SongModel.countDocuments(searchQuery);
    
    const songs = await SongModel.find(searchQuery)
      .sort({ name: 1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return {
      data: songs.map(song => song.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get song statistics
   */
  async getSongStats(songId: string) {
    const song = await SongModel.findById(songId).exec();
    
    if (!song) {
      return null;
    }

    // Count how many playlists contain this song
    const playlistCount = await PlaylistModel.countDocuments({
      songs: songId
    });

    // Get playlists that contain this song
    const playlists = await PlaylistModel.find({
      songs: songId
    })
    .select('name owner')
    .populate({
      path: 'owner',
      select: 'name username'
    })
    .exec();

    return {
      song: song.toJSON(),
      playlistCount,
      playlists: playlists.map(playlist => playlist.toJSON()),
      createdAt: song.createdAt,
      updatedAt: song.updatedAt
    };
  }

  /**
   * Batch create songs from Spotify data
   */
  async batchCreateSongs(songsData: InsertSong[]): Promise<Song[]> {
    const createdSongs: Song[] = [];
    
    for (const songData of songsData) {
      try {
        const song = await this.createSong(songData);
        createdSongs.push(song);
      } catch (error) {
        console.error(`Failed to create song ${songData.name}:`, error);
        // Continue with other songs even if one fails
      }
    }

    return createdSongs;
  }

  /**
   * Search songs with advanced filters
   */
  async advancedSearch(filters: {
    query?: string;
    artist?: string;
    album?: string;
    minDuration?: number;
    maxDuration?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Song>> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    
    const searchQuery: any = {};
    
    // Text search across name, artist, album
    if (filters.query) {
      searchQuery.$or = [
        { name: { $regex: filters.query, $options: 'i' } },
        { artist: { $regex: filters.query, $options: 'i' } },
        { album: { $regex: filters.query, $options: 'i' } }
      ];
    }

    // Specific artist filter
    if (filters.artist) {
      searchQuery.artist = { $regex: filters.artist, $options: 'i' };
    }

    // Specific album filter
    if (filters.album) {
      searchQuery.album = { $regex: filters.album, $options: 'i' };
    }

    // Duration filters
    if (filters.minDuration || filters.maxDuration) {
      searchQuery.duration = {};
      if (filters.minDuration) {
        searchQuery.duration.$gte = filters.minDuration;
      }
      if (filters.maxDuration) {
        searchQuery.duration.$lte = filters.maxDuration;
      }
    }

    const total = await SongModel.countDocuments(searchQuery);
    
    const songs = await SongModel.find(searchQuery)
      .sort({ name: 1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return {
      data: songs.map(song => song.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export const songService = new SongService();
