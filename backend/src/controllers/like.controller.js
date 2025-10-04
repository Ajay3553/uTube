import mongoose from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    
    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }
    
    // Validate video ID
    if (!mongoose.isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(404, "Video not found");
    }
    
    // Check if like already exists
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });
    
    if (existingLike) {
        // Unlike - remove the like
        await Like.findByIdAndDelete(existingLike._id);
        
        return res.status(200).json(
            new apiResponse(200, { isLiked: false }, "Video unliked successfully")
        );
    } else {
        // Like - add new like
        const like = await Like.create({
            video: videoId,
            likedBy: req.user._id
        });
        
        return res.status(200).json(
            new apiResponse(200, { isLiked: true }, "Video liked successfully")
        );
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    
    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }
    
    // Validate comment ID
    if (!mongoose.isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid comment ID");
    }
    
    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new apiError(404, "Comment not found");
    }
    
    // Check if like already exists
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });
    
    if (existingLike) {
        // Unlike - remove the like
        await Like.findByIdAndDelete(existingLike._id);
        
        return res.status(200).json(
            new apiResponse(200, { isLiked: false }, "Comment unliked successfully")
        );
    } else {
        // Like - add new like
        const like = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        });
        
        return res.status(200).json(
            new apiResponse(200, { isLiked: true }, "Comment liked successfully")
        );
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    
    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }
    
    // Validate tweet ID
    if (!mongoose.isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet ID");
    }
    
    // Check if tweet exists
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new apiError(404, "Tweet not found");
    }
    
    // Check if like already exists
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });
    
    if (existingLike) {
        // Unlike - remove the like
        await Like.findByIdAndDelete(existingLike._id);
        
        return res.status(200).json(
            new apiResponse(200, { isLiked: false }, "Tweet unliked successfully")
        );
    } else {
        // Like - add new like
        const like = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        });
        
        return res.status(200).json(
            new apiResponse(200, { isLiked: true }, "Tweet liked successfully")
        );
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }
    
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // Get all liked videos by the user using aggregation
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'videoDetails',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'author',
                            foreignField: '_id',
                            as: 'author',
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: '$author'
                    }
                ]
            }
        },
        {
            $unwind: '$videoDetails'
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: skip
        },
        {
            $limit: parseInt(limit)
        },
        {
            $project: {
                _id: 0,
                video: '$videoDetails',
                likedAt: '$createdAt'
            }
        }
    ]);
    
    // Get total count
    const totalLikedVideos = await Like.countDocuments({
        likedBy: req.user._id,
        video: { $exists: true }
    });
    
    const totalPages = Math.ceil(totalLikedVideos / limit);
    
    return res.status(200).json(
        new apiResponse(
            200,
            {
                likedVideos,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalLikedVideos,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            },
            "Liked videos fetched successfully"
        )
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
