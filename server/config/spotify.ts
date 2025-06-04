/**
 * Spotify Web API configuration and client setup
 * Handles authentication and token management for Spotify API calls
 */

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class SpotifyConfig {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || process.env.VITE_SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('⚠️ Spotify credentials not found. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.');
    }
  }

  /**
   * Get client credentials access token from Spotify
   * This token is used for searching tracks and accessing public data
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Spotify client credentials not configured');
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`Spotify token request failed: ${response.status} ${response.statusText}`);
      }

      const data: SpotifyTokenResponse = await response.json();
      
      this.accessToken = data.access_token;
      // Set expiration time with 5 minute buffer
      this.tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
      
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to get Spotify access token:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  /**
   * Make authenticated request to Spotify API
   */
  async makeSpotifyRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Spotify API error: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Spotify API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  /**
   * Check if Spotify is properly configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus() {
    return {
      hasClientId: !!this.clientId,
      hasClientSecret: !!this.clientSecret,
      hasAccessToken: !!this.accessToken,
      tokenExpiresAt: this.tokenExpiresAt,
      isTokenValid: this.accessToken && Date.now() < this.tokenExpiresAt,
    };
  }
}

export const spotifyConfig = new SpotifyConfig();
