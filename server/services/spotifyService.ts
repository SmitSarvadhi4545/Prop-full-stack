import { spotifyConfig } from '../config/spotify';
import { SpotifySearchResult, SpotifyTrack } from '@shared/schema';

/**
 * Spotify service handling all interactions with Spotify Web API
 */
export class SpotifyService {
  /**
   * Search for tracks on Spotify
   */
  async searchTracks(query: string, limit: number = 20, offset: number = 0): Promise<SpotifySearchResult> {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const endpoint = `/search?q=${encodedQuery}&type=track&limit=${limit}&offset=${offset}`;
      
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Spotify search error:', error);
      throw new Error('Failed to search tracks on Spotify');
    }
  }

  /**
   * Get a specific track by ID from Spotify
   */
  async getTrack(trackId: string): Promise<SpotifyTrack> {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      const endpoint = `/tracks/${trackId}`;
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Get track error:', error);
      throw new Error('Failed to get track from Spotify');
    }
  }

  /**
   * Get multiple tracks by IDs from Spotify
   */
  async getMultipleTracks(trackIds: string[]): Promise<{ tracks: SpotifyTrack[] }> {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      // Spotify allows max 50 tracks per request
      const ids = trackIds.slice(0, 50).join(',');
      const endpoint = `/tracks?ids=${ids}`;
      
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Get multiple tracks error:', error);
      throw new Error('Failed to get tracks from Spotify');
    }
  }

  /**
   * Search for artists on Spotify
   */
  async searchArtists(query: string, limit: number = 20, offset: number = 0) {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const endpoint = `/search?q=${encodedQuery}&type=artist&limit=${limit}&offset=${offset}`;
      
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Spotify artist search error:', error);
      throw new Error('Failed to search artists on Spotify');
    }
  }

  /**
   * Search for albums on Spotify
   */
  async searchAlbums(query: string, limit: number = 20, offset: number = 0) {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const endpoint = `/search?q=${encodedQuery}&type=album&limit=${limit}&offset=${offset}`;
      
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Spotify album search error:', error);
      throw new Error('Failed to search albums on Spotify');
    }
  }

  /**
   * Get an artist's top tracks
   */
  async getArtistTopTracks(artistId: string, country: string = 'US') {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      const endpoint = `/artists/${artistId}/top-tracks?country=${country}`;
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Get artist top tracks error:', error);
      throw new Error('Failed to get artist top tracks from Spotify');
    }
  }

  /**
   * Get an artist's albums
   */
  async getArtistAlbums(artistId: string, limit: number = 20, offset: number = 0) {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      const endpoint = `/artists/${artistId}/albums?limit=${limit}&offset=${offset}&include_groups=album,single`;
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Get artist albums error:', error);
      throw new Error('Failed to get artist albums from Spotify');
    }
  }

  /**
   * Get an album's tracks
   */
  async getAlbumTracks(albumId: string, limit: number = 50, offset: number = 0) {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      const endpoint = `/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`;
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Get album tracks error:', error);
      throw new Error('Failed to get album tracks from Spotify');
    }
  }

  /**
   * Get featured playlists from Spotify
   */
  async getFeaturedPlaylists(limit: number = 20, offset: number = 0, country: string = 'US') {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      const endpoint = `/browse/featured-playlists?limit=${limit}&offset=${offset}&country=${country}`;
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Get featured playlists error:', error);
      throw new Error('Failed to get featured playlists from Spotify');
    }
  }

  /**
   * Get new releases from Spotify
   */
  async getNewReleases(limit: number = 20, offset: number = 0, country: string = 'US') {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      const endpoint = `/browse/new-releases?limit=${limit}&offset=${offset}&country=${country}`;
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Get new releases error:', error);
      throw new Error('Failed to get new releases from Spotify');
    }
  }

  /**
   * Get available genre seeds for recommendations
   */
  async getGenreSeeds() {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      const endpoint = '/recommendations/available-genre-seeds';
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Get genre seeds error:', error);
      throw new Error('Failed to get genre seeds from Spotify');
    }
  }

  /**
   * Get track recommendations based on seed tracks, artists, or genres
   */
  async getRecommendations(options: {
    seedTracks?: string[];
    seedArtists?: string[];
    seedGenres?: string[];
    limit?: number;
    targetEnergy?: number;
    targetDanceability?: number;
    targetValence?: number;
  }) {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      const params = new URLSearchParams();
      
      if (options.seedTracks?.length) {
        params.append('seed_tracks', options.seedTracks.slice(0, 5).join(','));
      }
      
      if (options.seedArtists?.length) {
        params.append('seed_artists', options.seedArtists.slice(0, 5).join(','));
      }
      
      if (options.seedGenres?.length) {
        params.append('seed_genres', options.seedGenres.slice(0, 5).join(','));
      }
      
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }
      
      if (options.targetEnergy !== undefined) {
        params.append('target_energy', options.targetEnergy.toString());
      }
      
      if (options.targetDanceability !== undefined) {
        params.append('target_danceability', options.targetDanceability.toString());
      }
      
      if (options.targetValence !== undefined) {
        params.append('target_valence', options.targetValence.toString());
      }

      const endpoint = `/recommendations?${params.toString()}`;
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Get recommendations error:', error);
      throw new Error('Failed to get recommendations from Spotify');
    }
  }

  /**
   * Get audio features for tracks
   */
  async getAudioFeatures(trackIds: string[]) {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      const ids = trackIds.slice(0, 100).join(',');
      const endpoint = `/audio-features?ids=${ids}`;
      
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Get audio features error:', error);
      throw new Error('Failed to get audio features from Spotify');
    }
  }

  /**
   * Convert Spotify track to our internal song format
   */
  convertSpotifyTrackToSong(spotifyTrack: SpotifyTrack) {
    return {
      spotifyId: spotifyTrack.id,
      name: spotifyTrack.name,
      artist: spotifyTrack.artists.map(artist => artist.name).join(', '),
      album: spotifyTrack.album.name,
      duration: spotifyTrack.duration_ms,
      imageUrl: spotifyTrack.album.images[0]?.url || undefined,
      previewUrl: spotifyTrack.preview_url || undefined
    };
  }

  /**
   * Get Spotify configuration status for debugging
   */
  async getConfigurationStatus() {
    const status = spotifyConfig.getConfigStatus();
    
    return {
      ...status,
      isConfigured: spotifyConfig.isConfigured(),
      apiAccessible: await this.testApiAccess()
    };
  }

  /**
   * Test if Spotify API is accessible
   */
  private async testApiAccess(): Promise<boolean> {
    try {
      if (!spotifyConfig.isConfigured()) {
        return false;
      }
      
      await spotifyConfig.getAccessToken();
      return true;
    } catch (error) {
      console.error('Spotify API access test failed:', error);
      return false;
    }
  }

  /**
   * Search with advanced filtering options
   */
  async advancedSearch(options: {
    query: string;
    type?: 'track' | 'artist' | 'album' | 'playlist';
    year?: string;
    genre?: string;
    limit?: number;
    offset?: number;
  }) {
    if (!spotifyConfig.isConfigured()) {
      throw new Error('Spotify is not properly configured. Please check your credentials.');
    }

    try {
      let searchQuery = options.query;
      
      // Add filters to search query
      if (options.year) {
        searchQuery += ` year:${options.year}`;
      }
      
      if (options.genre) {
        searchQuery += ` genre:${options.genre}`;
      }

      const encodedQuery = encodeURIComponent(searchQuery);
      const type = options.type || 'track';
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      
      const endpoint = `/search?q=${encodedQuery}&type=${type}&limit=${limit}&offset=${offset}`;
      
      const response = await spotifyConfig.makeSpotifyRequest(endpoint);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Spotify advanced search error:', error);
      throw new Error('Failed to perform advanced search on Spotify');
    }
  }
}

export const spotifyService = new SpotifyService();
