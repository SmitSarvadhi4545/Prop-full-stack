import { Request, Response } from "express";
import { playlistService } from "../services/playlistService";
import { insertPlaylistSchema, updatePlaylistSchema } from "@shared/schema";
import { z } from "zod";
import { PlaylistModel } from "../models/Playlist";

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Playlist controller handling CRUD operations for playlists
 */
export class PlaylistController {
  /**
   * Get all playlists for the authenticated user with pagination
   * GET /api/playlists?page=1&limit=20
   */
  async getUserPlaylists(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const result = await playlistService.getUserPlaylists(
        req.user.userid,
        page,
        limit,
        search
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get playlists error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch playlists",
      });
    }
  }

  /**
   * Get a specific playlist by ID with populated songs
   * GET /api/playlists/:id
   */
  async getPlaylistById(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res
          .status(401)
          .json({ success: false, error: "Authentication required" });
      }

      const playlist = await PlaylistModel.findOne({
        _id: req.params.id,
        owner: req.user.userid,
      }).populate("songs");
      if (!playlist) {
        res.status(404).json({ success: false, error: "Playlist not found" });
      }

      res.status(200).json({ success: true, data: playlist });
    } catch (error) {
      console.error("Get playlist error:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch playlist" });
    }
  }

  /**
   * Create a new playlist
   * POST /api/playlists
   */
  async createPlaylist(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res
          .status(401)
          .json({ success: false, error: "Authentication required" });
        return;
      }

      console.log(req.user);

      const { name, description } = req.body;

      if (!name) {
        res
          .status(400)
          .json({ success: false, error: "Playlist name is required" });
        return;
      }

      console.log("Playlist data before saving:", {
        name,
        description,
        owner: req.user.userId,
      });

      const playlist = new PlaylistModel({
        name,
        description,
        owner: req.user.userId, // Set the owner field using the authenticated user's ID
      });

      await playlist.save();
      console.log("Playlist saved successfully:", playlist);

      res.status(201).json({
        success: true,
        data: playlist,
        message: "Playlist created successfully",
      });
    } catch (error) {
      console.error("Create playlist error:", error);

      if (
        error instanceof Error &&
        error.message.includes("Playlist validation failed")
      ) {
        res.status(400).json({
          success: false,
          error: "Invalid playlist data",
          details: error.message,
        });
      } else {
        res
          .status(500)
          .json({ success: false, error: "Failed to create playlist" });
      }
    }
  }

  /**
   * Update an existing playlist
   * PUT /api/playlists/:id
   */
  async updatePlaylist(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const playlistId = req.params.id;

      if (!playlistId) {
        res.status(400).json({
          success: false,
          error: "Playlist ID is required",
        });
        return;
      }

      // Validate request body
      const validationResult = updatePlaylistSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: "Invalid input data",
          details: validationResult.error.errors,
        });
        return;
      }

      const updatedPlaylist = await playlistService.updatePlaylist(
        playlistId,
        req.user.userid,
        validationResult.data
      );

      if (!updatedPlaylist) {
        res.status(404).json({
          success: false,
          error:
            "Playlist not found or you do not have permission to update it",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedPlaylist,
        message: "Playlist updated successfully",
      });
    } catch (error) {
      console.error("Update playlist error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update playlist",
      });
    }
  }

  /**
   * Delete a playlist
   * DELETE /api/playlists/:id
   */
  async deletePlaylist(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const playlistId = req.params.id;

      if (!playlistId) {
        res.status(400).json({
          success: false,
          error: "Playlist ID is required",
        });
        return;
      }

      const deleted = await playlistService.deletePlaylist(
        playlistId,
        req.user.userid
      );

      if (!deleted) {
        res.status(404).json({
          success: false,
          error:
            "Playlist not found or you do not have permission to delete it",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Playlist deleted successfully",
      });
    } catch (error) {
      console.error("Delete playlist error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete playlist",
      });
    }
  }

  /**
   * Add a song to a playlist
   * POST /api/playlists/:id/songs
   */
  async addSongToPlaylist(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const playlistId = req.params.id;
      const { songId } = req.body;

      if (!playlistId || !songId) {
        res.status(400).json({
          success: false,
          error: "Playlist ID and song ID are required",
        });
        return;
      }

      const updatedPlaylist = await playlistService.addSongToPlaylist(
        playlistId,
        songId,
        req.user.userid
      );

      if (!updatedPlaylist) {
        res.status(404).json({
          success: false,
          error:
            "Playlist not found or you do not have permission to modify it",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedPlaylist,
        message: "Song added to playlist successfully",
      });
    } catch (error) {
      console.error("Add song to playlist error:", error);

      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({
          success: false,
          error: "Song is already in the playlist",
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Failed to add song to playlist",
        });
      }
    }
  }

  /**
   * Remove a song from a playlist
   * DELETE /api/playlists/:id/songs/:songId
   */
  async removeSongFromPlaylist(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const playlistId = req.params.id;
      const songId = req.params.songId;

      if (!playlistId || !songId) {
        res.status(400).json({
          success: false,
          error: "Playlist ID and song ID are required",
        });
        return;
      }

      const updatedPlaylist = await playlistService.removeSongFromPlaylist(
        playlistId,
        songId,
        req.user.userid
      );

      if (!updatedPlaylist) {
        res.status(404).json({
          success: false,
          error:
            "Playlist not found or you do not have permission to modify it",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedPlaylist,
        message: "Song removed from playlist successfully",
      });
    } catch (error) {
      console.error("Remove song from playlist error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove song from playlist",
      });
    }
  }
}

export const playlistController = new PlaylistController();
