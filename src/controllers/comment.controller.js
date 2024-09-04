import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "Please provide video id");
    }

    // Find comments and populate the owner field with the corresponding username from the User model
    const comments = await Comment.find({ video: videoId })
        .populate('owner', 'username') // Populates the owner field with the username
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    if (!comments || comments.length === 0) {
        throw new ApiError(404, "No comments found for this video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "All comments fetched successfully"));
});


const addComment = asyncHandler(async (req, res) => {
    // get videoId and content
    const {videoId} = req.params
    const {content} = req.body
    if(!videoId || !content){
        throw new ApiError(400, "Please provide video id and content")
    }

    // save comment in DB
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })
    if(!comment){
        throw new ApiError(500, "Error creating comment")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, "Comment created successfully", comment))

})

const updateComment = asyncHandler(async (req, res) => {
    // get comment id and content from url
    const {commentId} = req.params
    const {content} = req.body
    if(!commentId || !content){
        throw new ApiError(400, "Please provide comment id and content")
    }

    // update comment in DB
    const comment = await Comment.findByIdAndUpdate(commentId,
        {
            $set:{
                content
            }
        },
        {
            new: true
        }
    )
    if(!comment){
        throw new ApiError(500, "Error updating comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Comment updated successfully", comment))
})

const deleteComment = asyncHandler(async (req, res) => {
    // get comment id from rul
    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(400, "Please provide comment id")
    }

    // delete comment from DB
    const comment = await Comment.findByIdAndDelete(commentId)
    if(!comment){
        throw new ApiError(500, "Error deleting comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }