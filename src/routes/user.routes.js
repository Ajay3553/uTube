import { Router } from 'express';
import { changeCurrentPassword, getCurrectUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, upadateUserCoverImage, updateAccountDetails, updateUserAvatar } from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)

// secured Routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrectUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)  //not using post bacuse if post is used then all data will be get changed that's why used patch only specific info will update
router.route("/avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
)
router.route("/cover-image").patch(
    verifyJWT,
    upload.single("/coverImage"),
    upadateUserCoverImage
)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile) // since data is coming from params now c/: username will display the username of user in URL
router.route("/watch-history").get(verifyJWT, getWatchHistory)

export default router