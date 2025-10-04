import { Router } from 'express';
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels} from '../controllers/subscription.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.route("/c/:channelId/subscribers").get(getUserChannelSubscribers);
router.route("/u/:subscriberId").get(getSubscribedChannels);

// Protected routes
router.route("/c/:channelId").post(verifyJWT, toggleSubscription);

export default router;
