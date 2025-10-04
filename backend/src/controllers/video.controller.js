import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler( async (req, res) => {
    const {page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId} = req.query;
    let matchStage = {isPublished : true}; // only show published Video
    if(query){
        matchStage.$or = [
            {title: {$regex: query, $options: 'i'}},
            {description : {$regex: query, $options: 'i'}}
        ];
    }
    if(userId){
        if(!mongoose.isValidObjectId(userId)){
            throw new apiError(400, "Invalid User ID")
        }
        matchStage.author = new mongoose.Types.ObjectId(userId);
    }
    const sortOrder = sortType === 'desc' ? -1 : 1;
    const sortStage = {[sortBy] : sortOrder};

    const skip = (page - 1)*limit;
    const video = await Video.aggregate([
        {$match : matchStage},
        {
            $lookup: {
                from : 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
                pipeline: [
                    {$project : {username: 1, fullName : 1, avatar : 1}}
                ]
            }
        },
        {$unwind : '$author'},
        {$sort: sortStage},
        {$skip : skip},
        {$limit: parseInt(limit)}
    ])

    const totalVideos = await Video.countDocuments(matchStage);
    const totalPage = Math.ceil(totalVideos/limit);
    return res.status(200).json(
        new apiResponse(
            200,
            {
                video,
                pagination : {
                    currPage: parseInt(page),
                    totalPage,
                    totalVideos,
                    hasNextPage: page<totalPage,
                    hasPrevPage: page>1
                }
            },
            "Video fetched Successfully"
        )
    )
});

const publishAVideo = asyncHandler( async (req, res) =>{
    const {title, description} = req.body;
    if(!title || !title.trim()){
        throw new apiError(400, "Title is required");
    }
    if(!req.user){
        throw new apiError(401, "Authentication required");
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoFileLocalPath){
        throw new apiError(400, "Video file is required");
    }
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if(!videoFile){
        throw new apiError(400, "Failed to upload video");
    }

    let thumbnail = null;
    if(thumbnailLocalPath){
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    }

    const video = await Video.create({
        title: title.trim(),
        description: description?.trim() || "",
        videoFile : videoFile.url,
        thumbnail: thumbnail?.url || "",
        duration : videoFile.duration || 0,
        author : req.user._id,
        isPublished : true
    });

    await video.populate('author', 'username fullName avatar')
    return res.status(200).json(
        new apiResponse(
            200,
            video,
            "Video published Successfully"
        )
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    if(!mongoose.isValidObjectId(videoId)){
        throw new apiError(400, "Invalid Video ID");
    }
    const video = await Video.findById(videoId).populate('author', 'username fullName avatar subscribers').exec();
    if(!video){
        throw new apiError(404, "Video not found");
    }
    if(!video.isPublished && (!req.user || video.author._id.toString() !== req.user._id.toString())){
        throw new apiError(404, "Video not found");
    }

    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    
    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video fetched successfully"
        )
    );
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    
    if (video.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own videos");
    }
    const updateFields = {};
    
    if (title && title.trim()) {
        updateFields.title = title.trim();
    }
    
    if (description !== undefined) {
        updateFields.description = description.trim();
    }
    
    const thumbnailLocalPath = req.file?.path;
    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (thumbnail) {
            updateFields.thumbnail = thumbnail.url;
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        updateFields,
        { new: true, runValidators: true }
    ).populate('author', 'username fullName avatar');
    
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video updated successfully"
        )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    
    if (video.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own videos");
    }
    
    await Video.findByIdAndDelete(videoId);
    
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Video deleted successfully"
        )
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only modify your own videos");
    }
    
    video.isPublished = !video.isPublished;
    await video.save();
    
    await video.populate('author', 'username fullName avatar');
    
    const message = video.isPublished ? "Video published successfully" : "Video unpublished successfully";
    
    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            message
        )
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}