import mongoose from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Video} from "../models/video.model.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
        throw new apiError(400, "Playlist name is required");
    }
    
    if (!description || !description.trim()) {
        throw new apiError(400, "Playlist description is required");
    }
    
    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }
    
    // Create playlist
    const playlist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: req.user._id,
        video: [] // Note: your model uses 'video' (singular), not 'videos'
    });
    
    // Populate owner details
    await playlist.populate('owner', 'username fullName avatar');
    
    return res.status(201).json(
        new apiResponse(201, playlist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    
    // Validate user ID
    if (!mongoose.isValidObjectId(userId)) {
        throw new apiError(400, "Invalid user ID");
    }
    
    // Get all playlists by user with aggregation
    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
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
            $addFields: {
                totalVideos: { $size: '$video' } // Note: using 'video' field
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);
    
    return res.status(200).json(
        new apiResponse(
            200,
            { playlists, totalPlaylists: playlists.length },
            "User playlists fetched successfully"
        )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    
    // Validate playlist ID
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }
    
    // Get playlist with video details using aggregation
    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
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
            $lookup: {
                from: 'videos',
                localField: 'video', // Note: using 'video' field
                foreignField: '_id',
                as: 'video', // Keep same name as in schema
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
            $unwind: '$owner'
        },
        {
            $addFields: {
                totalVideos: { $size: '$video' }
            }
        }
    ]);
    
    if (!playlist || playlist.length === 0) {
        throw new apiError(404, "Playlist not found");
    }
    
    return res.status(200).json(
        new apiResponse(200, playlist[0], "Playlist fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    
    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }
    
    // Validate IDs
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }
    if (!mongoose.isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }
    
    // Check if playlist exists
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }
    
    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You can only add videos to your own playlists");
    }
    
    // Check if video exists
    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
        throw new apiError(404, "Video not found");
    }
    
    // Check if video already in playlist
    if (playlist.video.includes(videoId)) {
        throw new apiError(400, "Video already exists in playlist");
    }
    
    // Add video to playlist
    playlist.video.push(videoId);
    await playlist.save();
    
    // Populate details
    await playlist.populate('owner', 'username fullName avatar');
    
    return res.status(200).json(
        new apiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    
    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }
    
    // Validate IDs
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }
    if (!mongoose.isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }
    
    // Check if playlist exists
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }
    
    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You can only remove videos from your own playlists");
    }
    
    // Check if video exists in playlist
    if (!playlist.video.includes(videoId)) {
        throw new apiError(400, "Video not found in playlist");
    }
    
    // Remove video from playlist
    playlist.video = playlist.video.filter(
        vid => vid.toString() !== videoId.toString()
    );
    await playlist.save();
    
    // Populate details
    await playlist.populate('owner', 'username fullName avatar');
    
    return res.status(200).json(
        new apiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    
    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }
    
    // Validate playlist ID
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }
    
    // Check if playlist exists
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }
    
    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You can only delete your own playlists");
    }
    
    // Delete playlist
    await Playlist.findByIdAndDelete(playlistId);
    
    return res.status(200).json(
        new apiResponse(200, {}, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    const {name, description} = req.body;
    
    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Authentication required");
    }
    
    // Validate playlist ID
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }
    
    // Validate at least one field to update
    if (!name && !description) {
        throw new apiError(400, "At least one field (name or description) is required");
    }
    
    // Check if playlist exists
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }
    
    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You can only update your own playlists");
    }
    
    // Prepare update fields
    const updateFields = {};
    if (name && name.trim()) {
        updateFields.name = name.trim();
    }
    if (description && description.trim()) {
        updateFields.description = description.trim();
    }
    
    // Update playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        updateFields,
        { new: true, runValidators: true }
    ).populate('owner', 'username fullName avatar');
    
    return res.status(200).json(
        new apiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
