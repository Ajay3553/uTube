import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import { apiError } from "../utils/ApiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;
    
    // Validate video ID
    if (!mongoose.isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(404, "Video not found");
    }
    
    // Pagination setup
    const skip = (page - 1) * limit;
    
    // Get comments with user details using aggregation
    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
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
            $unwind: '$owner'
        },
        {
            $sort: { createdAt: -1 } // Newest first
        },
        {
            $skip: skip
        },
        {
            $limit: parseInt(limit)
        }
    ]);
    
    // Get total count for pagination
    const totalComments = await Comment.countDocuments({ video: videoId });
    const totalPages = Math.ceil(totalComments / limit);
    
    return res.status(200).json(
        new apiResponse(
            200,
            {
                comments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalComments,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            },
            "Comments fetched successfully"
        )
    );
});

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {content} = req.body;
    
    // Validate content
    if (!content || !content.trim()) {
        throw new apiError(400, "Comment content is required");
    }
    
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
    
    // Create comment
    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    });
    
    // Populate owner details
    await comment.populate('owner', 'username fullName avatar');
    
    return res.status(201).json(
        new apiResponse(201, comment, "Comment added successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;
    
    // Validate content
    if (!content || !content.trim()) {
        throw new apiError(400, "Comment content is required");
    }
    
    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }
    
    // Validate comment ID
    if (!mongoose.isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid comment ID");
    }
    
    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new apiError(404, "Comment not found");
    }
    
    // Check ownership
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You can only update your own comments");
    }
    
    // Update comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content: content.trim()
        },
        {
            new: true,
            runValidators: true
        }
    ).populate('owner', 'username fullName avatar');
    
    return res.status(200).json(
        new apiResponse(200, updatedComment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    
    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }
    
    // Validate comment ID
    if (!mongoose.isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid comment ID");
    }
    
    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new apiError(404, "Comment not found");
    }
    
    // Check ownership
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You can only delete your own comments");
    }
    
    // Delete comment
    await Comment.findByIdAndDelete(commentId);
    
    return res.status(200).json(
        new apiResponse(200, {}, "Comment deleted successfully")
    );
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
