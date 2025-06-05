import { z } from "zod";

// User schemas
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Playlist schemas
export const insertPlaylistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updatePlaylistSchema = insertPlaylistSchema.partial();

export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type UpdatePlaylist = z.infer<typeof updatePlaylistSchema>;

export interface Playlist {
  _id: string;
  name: string;
  description?: string;
  owner: string; // User ID
  songs: string[]; // Song IDs
  createdAt: Date;
  updatedAt: Date;
}

// Song schemas
export const insertSongSchema = z.object({
  spotifyId: z.string(),
  name: z.string(),
  artist: z.string(),
  album: z.string(),
  duration: z.number(),
  imageUrl: z.string().optional(),
  previewUrl: z.string().optional(),
});

export type InsertSong = z.infer<typeof insertSongSchema>;

export interface Song {
  _id: string;
  spotifyId: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  imageUrl?: string;
  previewUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Spotify search result schema
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  preview_url?: string;
}

export interface SpotifySearchResult {
  tracks: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
