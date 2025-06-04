import { Router } from 'express';
import { songController } from '../controllers/songController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * Song routes
 * All routes are prefixed with /api/songs
 */

// Public routes (no authentication required)
router.get('/', songController.getSongs.bind(songController));
router.get('/popular', songController.getPopularSongs.bind(songController));
router.get('/:id', songController.getSongById.bind(songController));
router.get('/spotify/:spotifyId', songController.getSongBySpotifyId.bind(songController));

// Protected routes (authentication required)
router.post('/', authenticateToken, songController.createSong.bind(songController));
router.put('/:id', authenticateToken, songController.updateSong.bind(songController));
router.delete('/:id', authenticateToken, songController.deleteSong.bind(songController));

export const songRoutes = router;
