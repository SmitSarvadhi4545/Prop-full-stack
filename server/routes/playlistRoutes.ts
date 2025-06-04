import { Router } from 'express';
import { playlistController } from '../controllers/playlistController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * Playlist routes
 * All routes are prefixed with /api/playlists
 * All routes require authentication
 */

// Apply authentication middleware to all playlist routes
router.use(authenticateToken);

// Playlist CRUD operations
router.get('/', playlistController.getUserPlaylists.bind(playlistController));
router.get('/:id', playlistController.getPlaylistById.bind(playlistController));
router.post('/', playlistController.createPlaylist.bind(playlistController));
router.put('/:id', playlistController.updatePlaylist.bind(playlistController));
router.delete('/:id', playlistController.deletePlaylist.bind(playlistController));

// Song management within playlists
router.post('/:id/songs', playlistController.addSongToPlaylist.bind(playlistController));
router.delete('/:id/songs/:songId', playlistController.removeSongFromPlaylist.bind(playlistController));

export const playlistRoutes = router;
