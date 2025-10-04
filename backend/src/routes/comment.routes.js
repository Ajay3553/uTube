import { Router } from 'express';
import { getVideoComments, addComment, updateComment, deleteComment} from '../controllers/comments.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
//public
router.route("/:videoId").get(getVideoComments);

//private
router.route("/:videoId").post(verifyJWT, addComment);
router.route("/c/:commentId")
    .patch(verifyJWT, updateComment)
    .delete(verifyJWT, deleteComment);

export default router;
