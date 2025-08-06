import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const {userId} = req.user._id
    let Tviews=0

    const data= {
        totalVideos: 0,
        totalLikes: 0,
        totalViews: 0,
        totalSubscribers: 0
    }
    data.totalSubscribers= await Subscription.countDocuments({channel: req.user._id})
    data.totalVideos= await Video.countDocuments({owner: req.user._id})
    data.totalLikes= await Like.countDocuments({likedBy: req.user._id})
    const allViews= await Video.find({owner: req.user._id})
    for(let i in allViews){
        Tviews+= allViews[i].views
    }   

    data.totalViews= Tviews

    return res
    .status(200)
    .json(new ApiResponse(200, data, "Channel stats fetched successfully"))

});

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