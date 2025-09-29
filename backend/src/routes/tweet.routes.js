import {Router} from 'express'
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { createTweet, deleteTweet, getUserTweet, updateTweet } from '../controllers/tweets.controller.js';

const router = Router();

router.route("/user/:userId").get(getUserTweet);

router.route("/").post(verifyJWT, createTweet);
router.route("/:tweetId")
    .patch(verifyJWT, updateTweet)
    .delete(verifyJWT, deleteTweet);

export default router;
