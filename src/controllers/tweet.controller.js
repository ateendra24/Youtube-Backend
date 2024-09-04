import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //get content from frontend
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Please provide content and owner")
    }

    //save tweet details in DB
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })
    if (!tweet) {
        throw new ApiError(500, "Error creating tweet")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, "Tweet created successfully", tweet))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // get user id from url
    const { userId } = req.params
    if (!userId) {
        throw new ApiError(400, "Please provide user id")
    }

    // get all tweets for the user
    const userTweets = await Tweet.find({
        owner: userId
    })
    if (userTweets.length === 0) {
        throw new ApiError(404, "No tweet found for the user")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, userTweets, "User tweets found"))
})

const updateTweet = asyncHandler(async (req, res) => {
    // get tweet id from params
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(400, "Please provide tweet id");
    }

    // get content from body
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Please provide content");
    }

    // find the tweet by id
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // update the tweet content
    tweet.content = content;
    await tweet.save();

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully", tweet));

})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId}= req.params
    if(!tweetId){
        throw new ApiError(400, "Please provide tweet id")
    }

    // delete tweet
    const tweet= await Tweet.findByIdAndDelete(tweetId)
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully", tweet))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}