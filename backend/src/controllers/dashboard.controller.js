import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    if(!req.user){
        throw new ApiError(401, "Authentication required");
    }

    const channelId = req.user._id;

    const videoStats = await Video.aggregate([
        {
            $match:{
                author: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group:{
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                videoIds: { $push: "$_id" }
            }
        }
    ]);

    const subscriberStats = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group:{
                _id: null,
                totalSubscribers: { $sum: 1 }
            }
        }
    ]);

    let totalLikes = 0;
    if(videoStats.length > 0 && videoStats[0].videoIds.length > 0){
        const likeStats = await Like.aggregate([
            {
                $match:{
                    video: { $in: videoStats[0].videoIds }
                }
            },
            {
                $group:{
                    _id: null,
                    totalLikes: { $sum: 1 }
                }
            }
        ]);
        totalLikes = likeStats.length > 0 ? likeStats[0].totalLikes : 0;
    }

    const subscriptionCount = await Subscription.countDocuments({
        subscriber: channelId
    });

    const channelStats = {
        totalVideos: videoStats.length > 0 ? videoStats[0].totalVideos : 0,
        totalViews: videoStats.length > 0 ? videoStats[0].totalViews : 0,
        totalSubscribers: subscriberStats.length > 0 ? subscriberStats[0].totalSubscribers : 0,
        totalLikes: totalLikes,
        totalSubscriptions: subscriptionCount
    };

    return res.status(200).json(
        new ApiResponse(
            200,
            channelStats,
            "Channel stats fetched successfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    if(!req.user){
        throw new ApiError(401, "Authentication required");
    }

    const { page = 1, limit = 10, sortBy = 'createdAt', sortType = 'desc' } = req.query;
    const channelId = req.user._id;

    if(page < 1 || limit < 1 || limit > 50){
        throw new ApiError(400, "Invalid pagination parameters");
    }

    const skip = (page - 1) * limit;
    const sortOrder = sortType === 'desc' ? -1 : 1;

    const videos = await Video.aggregate([
        {
            $match:{
                author: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from: 'likes',
                let: { videoId: '$_id' },
                pipeline:[
                    { $match: { $expr: { $eq: ['$video', '$$videoId'] } } },
                    { $count: 'count' }
                ],
                as: 'likesData'
            }
        },
        {
            $lookup:{
                from: 'comments',
                let: { videoId: '$_id' },
                pipeline:[
                    { $match: { $expr: { $eq: ['$video', '$$videoId'] } } },
                    { $count: 'count' }
                ],
                as: 'commentsData'
            }
        },
        {
            $addFields:{
                likesCount:{
                    $ifNull:[
                        { $arrayElemAt: ['$likesData.count', 0] },
                        0
                    ]
                },
                commentsCount:{
                    $ifNull:[
                        { $arrayElemAt: ['$commentsData.count', 0] },
                        0
                    ]
                }
            }
        },
        {
            $project:{
                _id: 1,
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
                likesCount: 1,
                commentsCount: 1
            }
        },
        {
            $sort: { [sortBy]: sortOrder }
        },
        {
            $skip: skip
        },
        {
            $limit: parseInt(limit)
        }
    ]);

    const totalVideos = await Video.countDocuments({
        author: channelId
    });

    const totalPages = Math.ceil(totalVideos / limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalVideos,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    limit: parseInt(limit)
                }
            },
            "Channel videos fetched successfully"
        )
    );
});

export {
    getChannelStats,
    getChannelVideos
}
