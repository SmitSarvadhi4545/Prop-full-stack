import { Router } from 'express';
import { spotifyController } from '../controllers/spotifyController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * Spotify integration routes
 * All routes are prefixed with /api/spotify
 */

// Public routes (no authentication required)
router.get('/search', spotifyController.searchTracks.bind(spotifyController));
router.get('/track/:id', spotifyController.getTrackDetails.bind(spotifyController));
router.get('/tracks', spotifyController.getMultipleTracks.bind(spotifyController));
router.get('/featured', spotifyController.getFeaturedPlaylists.bind(spotifyController));
router.get('/status', spotifyController.getStatus.bind(spotifyController));

// Protected routes (authentication required)
router.post('/add-track', authenticateToken, spotifyController.addTrackToDatabase.bind(spotifyController));

export const spotifyRoutes = router;
