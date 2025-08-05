import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id; // Assuming user information is available via authentication middleware

    // Check if the like already exists
    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        // If a like exists, remove it (unlike)
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(201).json({ message: 'Video unliked' });
    } else {
        // If no like exists, create a new one
        const newLike = new Like({
            video: videoId,
            likedBy: userId
        });
        await newLike.save();
        return res
            .status(200)
            .json(new ApiResponse(200, "Video liked successfully", newLike))

    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!commentId) {
        throw new ApiError(400, "Invalid comment id")
    }

    // toggle commentlike in db
    const like = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })
    if (!like) {
        throw new ApiError(500, "Error liking comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Comment liked successfully", like))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(400, "Invalid tweet id")
    }

    // toggle tweetlike in db
    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })
    if (!like) {
        throw new ApiError(500, "Error liking tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet liked successfully", like))

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const videos = await Like.find({ likedBy: req.user._id }).populate("video")
    if (!videos) {
        throw new ApiError(404, "No liked videos found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Liked videos found", videos))
})

const getNoOfLikesForVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Invalid video id");
    }

    const likeCount = await Like.countDocuments({ video: videoId });
    return res
        .status(200)
        .json(new ApiResponse(200, "Number of likes found", { likeCount }));
});

const checkIfVideoIsLiked = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Invalid video id");
    }

    const isLiked = await Like.exists({ video: videoId, likedBy: req.user._id });

    return res
        .status(200)
        .json(new ApiResponse(200, "Like status found", { isLiked }));

});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getNoOfLikesForVideo,
    checkIfVideoIsLiked
}