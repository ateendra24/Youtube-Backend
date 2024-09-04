import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const videos = await Video.find({owner: req.user._id})
    const totalVideos = videos.length
    let totalViews = 0
    let totalLikes = 0
    for(const video of videos){
        totalViews += video.views
        const likes = await Like.find({video: video._id})
        totalLikes += likes.length
    }
    const subscribers = await Subscription.find({channel: req.user._id})
    const totalSubscribers = subscribers.length
    return res
    .status(200)
    .json(new ApiResponse(200, {totalVideos, totalViews, totalLikes, totalSubscribers}, "Channel stats fetched successfully"))
    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const videos = await Video.find({owner: req.user._id})
    .sort({createdAt: -1})
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select("-videoFile")
    if(!videos || videos.length === 0){
        throw new ApiError(404, "No videos found for this channel")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, videos, "All videos fetched successfully"))

})

export {
    getChannelStats, 
    getChannelVideos
    }