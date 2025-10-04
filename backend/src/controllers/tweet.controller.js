import mongoose from 'mongoose'
import {Tweet} from '../models/tweet.model.js'
import {User} from '../models/user.model.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import { apiError } from '../utils/ApiError.js'
import { apiResponse } from '../utils/ApiResponse.js'
const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;
    
    if(!content || !content.trim()){
        throw new apiError(400, "Content is Required")
    }
    if(!req.user){
        throw new apiError(401, "Authentication required")
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        author: req.user._id,
    });

    await tweet.populate('author', 'username fullName avatar')

    return res.status(201).json(
        new apiResponse(
            201,
            tweet,
            "Tweet Successfully Created"
        )
    )
})

const getUserTweet = asyncHandler(async (req, res) =>{
    const {userId} = req.params;
    const {page = 1, limit = 10} = req.query;
    
    const validUserId = mongoose.isValidObjectId(userId);
    if(!validUserId){
        throw new apiError(400, "Invalid user ID")
    }
    
    const user = await User.findById(userId).select("username fullName avatar");
    if(!user){
        throw new apiError(404, "User not found");
    }
    
    const skip = (page - 1)*limit;
    const tweets = await Tweet.aggregate([
        {
            $match:{
                author: new mongoose.Types.ObjectId(userId)
            },
        },
        {
            $lookup:{
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
                pipeline: [{
                    $project:{
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }]
            }
        },
        {$unwind: '$author'},
        {
            $addFields: {
                likesCount: {
                    $size:{
                        $ifNull:['$likes', []]
                    }
                },
                commentsCount: {
                    $size:{
                        $ifNull:['$comments', []]
                    }
                },
                isLikedByCurrentUser: req.user ? 
                    { $in: [new mongoose.Types.ObjectId(req.user._id), '$likes'] } : false
            }
        },
        {$sort: {createdAt: -1}},
        {$skip: skip},
        {$limit: parseInt(limit)}
    ]);
    
    const totalTweets = await Tweet.countDocuments({author: userId});

    return res.status(200).json(
        new apiResponse(
            200,
            {
                user,
                tweets,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalTweets / limit),
                    totalTweets
                }
            },
            "User tweets fetched successfully"
        )
    );
})

const updateTweet = asyncHandler(async (req, res) => {
    const {id: tweetId} = req.params;
    const {content} = req.body;

    const validTweetId = mongoose.isValidObjectId(tweetId);

    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }

    if(!validTweetId){
        throw new apiError(400, "Invalid tweet ID format");
    }

    if(!content || !content.trim()){
        throw new apiError(400, "Content is Required");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {content: content.trim()},
        {
            new: true,
            runValidators: true
        }
    ).populate('author', 'username fullName avatar')

    if(!tweet){
        throw new apiError(404, "Tweet not found");
    }

    return res.status(200).json(
        new apiResponse(
            200,
            tweet,
            "Tweet updated Successfully"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {id: tweetId} = req.params;
    
    const validTweetId = mongoose.isValidObjectId(tweetId);
    if(!validTweetId){
        throw new apiError(400, "Invalid Tweet");
    }

    if(!req.user){
        throw new apiError(401, "Authentication required");
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new apiError(404, "Tweet Not Found")
    }

    if(tweet.author.toString() !== req.user._id.toString()){
        throw new apiError(403, "You can only delete your own Tweets")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    
    return res.status(200).json(
        new apiResponse(
            200,
            {
                deletedTweet: {
                    _id: deletedTweet._id,
                    content: deletedTweet.content,
                    author: deletedTweet.author,
                    createdAt: deletedTweet.createdAt
                }
            },
            "Tweet deleted successfully"
        )
    );
})

export {
    createTweet,
    getUserTweet,
    updateTweet,
    deleteTweet
}
