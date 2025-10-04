import { Router } from 'express';
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos } from '../controllers/like.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply authentication to all routes
router.use(verifyJWT);

// Like toggle routes
router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

// Get liked videos
router.route("/videos").get(getLikedVideos);

export default router;
