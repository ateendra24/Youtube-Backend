import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400,"Invalid video id")
    }

    // toggle videolike in db
    const like= await Like.create({
        video: videoId,
        likedBy: req.user._id
    })
    if(!like){
        throw new ApiError(500, "Error liking video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Video liked successfully", like))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(400,"Invalid comment id")
    }

    // toggle commentlike in db
    const like= await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })
    if(!like){
        throw new ApiError(500, "Error liking comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Comment liked successfully", like))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400,"Invalid tweet id")
    }

    // toggle tweetlike in db
    const like= await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })
    if(!like){
        throw new ApiError(500, "Error liking tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet liked successfully", like))

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const videos= await Like.find({likedBy: req.user._id}).populate("video")
    if(!videos){
        throw new ApiError(404, "No liked videos found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, "Liked videos found", videos))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}