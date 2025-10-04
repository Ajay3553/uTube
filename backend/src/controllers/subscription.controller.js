import mongoose from "mongoose"
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    
    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }
    
    // Validate channel ID
    if (!mongoose.isValidObjectId(channelId)) {
        throw new apiError(400, "Invalid channel ID");
    }
    
    // Check if channel (user) exists
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new apiError(404, "Channel not found");
    }
    
    // Prevent self-subscription
    if (channelId === req.user._id.toString()) {
        throw new apiError(400, "You cannot subscribe to your own channel");
    }
    
    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });
    
    if (existingSubscription) {
        // Unsubscribe - remove the subscription
        await Subscription.findByIdAndDelete(existingSubscription._id);
        
        return res.status(200).json(
            new apiResponse(
                200,
                { isSubscribed: false },
                "Unsubscribed successfully"
            )
        );
    } else {
        // Subscribe - create new subscription
        const subscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        });
        
        return res.status(200).json(
            new apiResponse(
                200,
                { isSubscribed: true },
                "Subscribed successfully"
            )
        );
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    
    // Validate channel ID
    if (!mongoose.isValidObjectId(channelId)) {
        throw new apiError(400, "Invalid channel ID");
    }
    
    // Check if channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new apiError(404, "Channel not found");
    }
    
    // Get all subscribers of this channel using aggregation
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriberDetails',
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
            $unwind: '$subscriberDetails'
        },
        {
            $project: {
                _id: '$subscriberDetails._id',
                username: '$subscriberDetails.username',
                fullName: '$subscriberDetails.fullName',
                avatar: '$subscriberDetails.avatar',
                subscribedAt: '$createdAt'
            }
        },
        {
            $sort: { subscribedAt: -1 }
        }
    ]);
    
    // Get total subscriber count
    const subscriberCount = await Subscription.countDocuments({
        channel: channelId
    });
    
    return res.status(200).json(
        new apiResponse(
            200,
            {
                subscribers,
                subscriberCount
            },
            "Subscribers fetched successfully"
        )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params;
    
    // Validate subscriber ID
    if (!mongoose.isValidObjectId(subscriberId)) {
        throw new apiError(400, "Invalid subscriber ID");
    }
    
    // Check if user exists
    const user = await User.findById(subscriberId);
    if (!user) {
        throw new apiError(404, "User not found");
    }
    
    // Get all channels this user has subscribed to using aggregation
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'channel',
                foreignField: '_id',
                as: 'channelDetails',
                pipeline: [
                    {
                        $lookup: {
                            from: 'subscriptions',
                            localField: '_id',
                            foreignField: 'channel',
                            as: 'subscribers'
                        }
                    },
                    {
                        $addFields: {
                            subscriberCount: { $size: '$subscribers' }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            subscriberCount: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$channelDetails'
        },
        {
            $project: {
                _id: '$channelDetails._id',
                username: '$channelDetails.username',
                fullName: '$channelDetails.fullName',
                avatar: '$channelDetails.avatar',
                subscriberCount: '$channelDetails.subscriberCount',
                subscribedAt: '$createdAt'
            }
        },
        {
            $sort: { subscribedAt: -1 }
        }
    ]);
    
    // Get total subscribed channels count
    const subscribedChannelCount = await Subscription.countDocuments({
        subscriber: subscriberId
    });
    
    return res.status(200).json(
        new apiResponse(
            200,
            {
                subscribedChannels,
                subscribedChannelCount
            },
            "Subscribed channels fetched successfully"
        )
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
