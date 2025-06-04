/**
 * TypeScript type definitions for the Music Playlist Management System
 */

export interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Song {
  _id: string;
  spotifyId: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  imageUrl?: string;
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  _id: string;
  name: string;
  description?: string;
  owner: User | string;
  songs: Song[];
  createdAt: string;
  updatedAt: string;
}

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

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface CreatePlaylistFormData {
  name: string;
  description?: string;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
}

// Component prop types
export interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
}

export interface PlaylistCardProps {
  playlist: Playlist;
  onDeleted: () => void;
}

export interface SearchResultsProps {
  query: string;
  onClose: () => void;
  targetPlaylistId?: string;
  onPlaylistCreated: () => void;
}

export interface SidebarProps {
  onCreatePlaylist: () => void;
}

export interface TopBarProps {
  onSearch: (query: string) => void;
  onCreatePlaylist?: () => void;
}

// API error types
export interface ApiError {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface SearchParams extends PaginationParams {
  q: string;
}

// Theme types
export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
}

// Toast types
export interface ToastMessage {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export interface EditModalProps extends ModalProps {
  playlist?: Playlist;
  isEdit?: boolean;
}

// Route types
export interface RouteParams {
  id?: string;
}

// Query key types
export type QueryKey = string | (string | number | undefined)[];

// Component state types
export interface ComponentState {
  isLoading: boolean;
  error: Error | null;
  data: any;
}

// Audio player types (for future implementation)
export interface PlayerState {
  isPlaying: boolean;
  currentSong: Song | null;
  currentPlaylist: Playlist | null;
  volume: number;
  progress: number;
  duration: number;
}

export interface PlayerContextType extends PlayerState {
  play: (song: Song, playlist?: Playlist) => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  seek: (position: number) => void;
}
