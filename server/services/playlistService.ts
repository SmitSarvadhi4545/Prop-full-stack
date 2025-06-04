import { PlaylistModel } from '../models/Playlist';
import { SongModel } from '../models/Song';
import { InsertPlaylist, UpdatePlaylist, PaginatedResponse, Playlist } from '@shared/schema';

/**
 * Playlist service handling business logic for playlist operations
 */
export class PlaylistService {
  /**
   * Get all playlists for a user with pagination and search
   */
  async getUserPlaylists(
    userId: string,
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<PaginatedResponse<Playlist>> {
    const offset = (page - 1) * limit;
    
    // Build search query
    const searchQuery: any = { owner: userId };
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await PlaylistModel.countDocuments(searchQuery);
    
    // Get playlists with populated songs
    const playlists = await PlaylistModel.find(searchQuery)
      .populate({
        path: 'songs',
        select: 'name artist album duration imageUrl spotifyId'
      })
      .populate({
        path: 'owner',
        select: 'name username'
      })
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return {
      data: playlists.map(playlist => playlist.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a specific playlist by ID with populated songs
   */
  async getPlaylistById(playlistId: string, userId: string): Promise<Playlist | null> {
    const playlist = await PlaylistModel.findOne({
      _id: playlistId,
      owner: userId
    })
    .populate({
      path: 'songs',
      select: 'name artist album duration imageUrl spotifyId previewUrl'
    })
    .populate({
      path: 'owner',
      select: 'name username'
    })
    .exec();

    return playlist ? playlist.toJSON() : null;
  }

  /**
   * Create a new playlist
   */
  async createPlaylist(playlistData: InsertPlaylist & { owner: string }): Promise<Playlist> {
    const playlist = new PlaylistModel({
      ...playlistData,
      songs: []
    });

    await playlist.save();

    // Populate the created playlist
    await playlist.populate({
      path: 'owner',
      select: 'name username'
    });

    return playlist.toJSON();
  }

  /**
   * Update an existing playlist
   */
  async updatePlaylist(
    playlistId: string,
    userId: string,
    updateData: UpdatePlaylist
  ): Promise<Playlist | null> {
    const playlist = await PlaylistModel.findOneAndUpdate(
      { _id: playlistId, owner: userId },
      updateData,
      { new: true, runValidators: true }
    )
    .populate({
      path: 'songs',
      select: 'name artist album duration imageUrl spotifyId'
    })
    .populate({
      path: 'owner',
      select: 'name username'
    })
    .exec();

    return playlist ? playlist.toJSON() : null;
  }

  /**
   * Delete a playlist
   */
  async deletePlaylist(playlistId: string, userId: string): Promise<boolean> {
    const result = await PlaylistModel.findOneAndDelete({
      _id: playlistId,
      owner: userId
    }).exec();

    return !!result;
  }

  /**
   * Add a song to a playlist
   */
  async addSongToPlaylist(
    playlistId: string,
    songId: string,
    userId: string
  ): Promise<Playlist | null> {
    // First, verify the song exists
    const song = await SongModel.findById(songId).exec();
    if (!song) {
      throw new Error('Song not found');
    }

    // Check if playlist exists and user owns it
    const playlist = await PlaylistModel.findOne({
      _id: playlistId,
      owner: userId
    }).exec();

    if (!playlist) {
      return null;
    }

    // Check if song is already in playlist
    if (playlist.songs.includes(songId as any)) {
      throw new Error('Song already exists in playlist');
    }

    // Add song to playlist
    const updatedPlaylist = await PlaylistModel.findByIdAndUpdate(
      playlistId,
      { $push: { songs: songId } },
      { new: true }
    )
    .populate({
      path: 'songs',
      select: 'name artist album duration imageUrl spotifyId'
    })
    .populate({
      path: 'owner',
      select: 'name username'
    })
    .exec();

    return updatedPlaylist ? updatedPlaylist.toJSON() : null;
  }

  /**
   * Remove a song from a playlist
   */
  async removeSongFromPlaylist(
    playlistId: string,
    songId: string,
    userId: string
  ): Promise<Playlist | null> {
    const updatedPlaylist = await PlaylistModel.findOneAndUpdate(
      { _id: playlistId, owner: userId },
      { $pull: { songs: songId } },
      { new: true }
    )
    .populate({
      path: 'songs',
      select: 'name artist album duration imageUrl spotifyId'
    })
    .populate({
      path: 'owner',
      select: 'name username'
    })
    .exec();

    return updatedPlaylist ? updatedPlaylist.toJSON() : null;
  }

  /**
   * Get playlist statistics
   */
  async getPlaylistStats(playlistId: string, userId: string) {
    const playlist = await PlaylistModel.findOne({
      _id: playlistId,
      owner: userId
    })
    .populate('songs')
    .exec();

    if (!playlist) {
      return null;
    }

    const songCount = playlist.songs.length;
    const totalDuration = playlist.songs.reduce((total: number, song: any) => {
      return total + (song.duration || 0);
    }, 0);

    return {
      songCount,
      totalDuration,
      totalDurationFormatted: this.formatDuration(totalDuration),
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt
    };
  }

  /**
   * Search playlists across all users (public search)
   */
  async searchPublicPlaylists(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Playlist>> {
    const offset = (page - 1) * limit;
    
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };

    const total = await PlaylistModel.countDocuments(searchQuery);
    
    const playlists = await PlaylistModel.find(searchQuery)
      .populate({
        path: 'owner',
        select: 'name username'
      })
      .select('name description owner createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return {
      data: playlists.map(playlist => playlist.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get popular playlists (most songs)
   */
  async getPopularPlaylists(limit: number = 10) {
    const playlists = await PlaylistModel.aggregate([
      {
        $addFields: {
          songCount: { $size: '$songs' }
        }
      },
      {
        $match: {
          songCount: { $gt: 0 }
        }
      },
      {
        $sort: { songCount: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
          pipeline: [{ $project: { name: 1, username: 1 } }]
        }
      },
      {
        $unwind: '$owner'
      }
    ]);

    return playlists;
  }

  /**
   * Duplicate a playlist for the current user
   */
  async duplicatePlaylist(
    originalPlaylistId: string,
    userId: string,
    newName?: string
  ): Promise<Playlist | null> {
    const originalPlaylist = await PlaylistModel.findById(originalPlaylistId)
      .populate('songs')
      .exec();

    if (!originalPlaylist) {
      return null;
    }

    const duplicatedPlaylist = new PlaylistModel({
      name: newName || `${originalPlaylist.name} (Copy)`,
      description: originalPlaylist.description,
      owner: userId,
      songs: originalPlaylist.songs
    });

    await duplicatedPlaylist.save();

    // Populate the created playlist
    await duplicatedPlaylist.populate([
      {
        path: 'songs',
        select: 'name artist album duration imageUrl spotifyId'
      },
      {
        path: 'owner',
        select: 'name username'
      }
    ]);

    return duplicatedPlaylist.toJSON();
  }

  /**
   * Helper function to format duration from milliseconds to readable format
   */
  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m ${seconds % 60}s`;
    }
  }
}

export const playlistService = new PlaylistService();
