import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import { User } from "../models/user.model.js"

const getAllVideos = asyncHandler(async (req, res) => {

    const filter = {}
    const Videos = await Video.find(filter)
    const populatedVideos = await Video.find(filter).populate('owner', 'username avatar _id');


    if (!Videos) {
        throw new ApiError(404, "No videos found")
    }

    res
        .status(200)
        .json(new ApiResponse(200, "All videos fetched", populatedVideos))
});

const getVideoByChannelId = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId) {
        throw new ApiError(400, "Please provide channel id")
    }

    const videos = await Video.find({ owner: channelId }).populate('owner', 'username avatar _id')
    if (!videos) {
        throw new ApiError(404, "No videos found for this channel")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Videos found", videos))
})

const incViews = asyncHandler(async (req, res) => {
    // const {videoId} = req.params
    // if(!videoId){
    //     throw new ApiError(400, "Please provide video id")
    // }

    // // increment views by 1
    // const video = await Video.findByIdAndUpdate(videoId, {$inc: {views: 1}}, {new: true})
    // if(!video){
    //     throw new ApiError(500, "Error incrementing views")
    // }

    // return res
    // .status(200)
    // .json(new ApiResponse(200, "Videos found", video))


    const { videoId } = req.params; // Assuming videoId is passed as a route parameter
    const userId = req.user._id; // Assuming user info is available through authentication middleware

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if the video is in the user's watch history
    const hasWatched = user.watchHistory.includes(videoId);

    if (!hasWatched) {
        // Find the video and increment the view count
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Increment the view count and add the video to the user's watch history
        video.views += 1;
        user.watchHistory.push(videoId);

        await video.save();
        await user.save();

        return res.status(200).json({ message: 'View added', video });
    } else {
        // If the user has already watched the video, do nothing
        return res.status(200).json({ message: 'User has already watched this video' });
    }


})

const publishAVideo = asyncHandler(async (req, res) => {
    // get title and description from frontend
    const { title, description } = req.body

    // get the video and thumbnail
    const vieoLoalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if (!vieoLoalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Please provide video and thumbnail local path")
    }

    // upload to cloudinary
    const video = await uploadOnCloudinary(vieoLoalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!video || !thumbnail) {
        throw new ApiError(500, "Error uploading video or thumbnail on cloudinary")
    }

    // save video details in DB
    const VideoSent = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        owner: req.user._id,
    })

    if (!VideoSent) {
        throw new ApiError(500, "Error creating video on DB")
    }


    return res
        .status(200)
        .json(new ApiResponse(200, "Video published successfully", VideoSent))


})

const getVideoById = asyncHandler(async (req, res) => {
    // get video id from url
    const { videoId } = req.params;

    if (!videoId?.trim()) {
        throw new ApiError(400, "Please provide video id")
    }

    // get video details from DB
    const video = await Video.findById(videoId).populate('owner', 'username avatar _id')

    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Video found", video))
})

const updateVideo = asyncHandler(async (req, res) => {
    // Get videoId from the URL
    const { videoId } = req.params;
    if (!videoId?.trim()) {
        throw new ApiError(400, "Please provide video ID");
    }

    // Get title and description from the request body
    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "Please provide title and description");
    }

    // Find the video in the database
    const videoData = await Video.findById(videoId);
    if (!videoData) {
        throw new ApiError(404, "Video not found");
    }

    // Optional: Check if thumbnail is provided
    const thumbnailLocalPath = req.file?.path;
    let thumbnailUrl = videoData.thumbnail; // Default to the current thumbnail

    // If a new thumbnail is provided, delete the old one and upload the new one
    if (thumbnailLocalPath) {
        const oldThumbnailUrl = videoData.thumbnail;

        // Delete the old thumbnail from Cloudinary
        const deleteThumbnail = await deleteFromCloudinary(oldThumbnailUrl, 'image');
        if (!deleteThumbnail) {
            throw new ApiError(500, "Error deleting old thumbnail from Cloudinary");
        }

        // Upload the new thumbnail to Cloudinary
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail) {
            throw new ApiError(500, "Error uploading new thumbnail to Cloudinary");
        }

        thumbnailUrl = thumbnail.url; // Set the new thumbnail URL
    }

    // Update video details in the database
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnailUrl, // Use the new or existing thumbnail URL
            }
        },
        { new: true }
    );

    if (!video) {
        throw new ApiError(500, "Error updating video details");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { video }, "Video details updated"));
});


const deleteVideo = asyncHandler(async (req, res) => {
    // get videoid from url
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Please provide video id")
    }

    // get video and thumbnail url
    const videoData = await Video.findById(videoId)
    const videoUrl = await videoData.videoFile
    const thumbnailUrl = await videoData.thumbnail

    // delete video from DB
    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new ApiError(404, "Video not deleted")
    }

    // delete video and thumbnail from cloudinary
    const deleteVideo = await deleteFromCloudinary(videoUrl, 'video')
    const deleteThumbnail = await deleteFromCloudinary(thumbnailUrl, 'image')
    if (!deleteVideo || !deleteThumbnail) {
        throw new ApiError(500, "Error deleting video or thumbnail from cloudinary")
    }


    return res
        .status(200)
        .json(new ApiResponse(200, { video }, "Video was deleted Successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    // get videoid from url
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Please provide video id")
    }

    // get video details from DB
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // toggle publish status
    const newPublishStatus = !video.isPublished
    const updatedVideo = await Video.findByIdAndUpdate
        (videoId, { isPublished: newPublishStatus }, { new: true })
    if (!updatedVideo) {
        throw new ApiError(500, "Error updating video publish status")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { updatedVideo }, "Video publish status updated successfully"))


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getVideoByChannelId,
    incViews
}