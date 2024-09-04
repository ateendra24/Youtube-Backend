import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import { User } from "../models/user.model.js"



// const getAllVideos = asyncHandler(async (req, res) => {
//     const {
//         page = 1,
//         limit = 10,
//         query,
//         sortBy = "views",
//         sortType = "desc",
//         userId,
//     } = req.query;

//     let searchQuery = {};
//     if (userId) {
//         const user = await User.findById(userId).select("-password");

//         if (!user) {
//             throw new ApiError(404, "User not found");
//         }

//         searchQuery.owner = userId;
//     }

//     if (query) {
//         searchQuery.title = { $regex: query, $options: "i" };
//     }

//     let sortOptions = {};
//     sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

//     const skip = (page - 1) * limit;

//     const videos = await Video.find(searchQuery)
//         .sort(sortOptions)
//         .skip(skip)
//         .limit(Number(limit));

//     if (videos.length === 0 && userId) {
//         throw new ApiError(404, "No videos found for this user");
//     }

//     const totalVideos = await Video.countDocuments(searchQuery);

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             {
//                 page: Number(page),
//                 limit: Number(limit),
//                 totalVideos,
//                 videos,
//             },
//             "All videos are fetched"
//         )
//     );
// });

const getAllVideos = asyncHandler(async (req, res) => {

    const filter ={}
    const Videos= await Video.find(filter)
    const populatedVideos = await Video.find(filter).populate('owner', 'username');


    if(!Videos){
        throw new ApiError(404, "No videos found")
    }

    res
    .status(200)
    .json(new ApiResponse(200, "All videos fetched", populatedVideos))
});

const publishAVideo = asyncHandler(async (req, res) => {
    // get title and description from frontend
    const { title, description} = req.body

    // get the video and thumbnail
    const vieoLoalPath= req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if(!vieoLoalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Please provide video and thumbnail local path")
    }

    // upload to cloudinary
    const video = await uploadOnCloudinary(vieoLoalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!video || !thumbnail){
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

    if(!VideoSent){
        throw new ApiError(500, "Error creating video on DB")
    }


    return res
    .status(200)
    .json(new ApiResponse(200, "Video published successfully", VideoSent))


})

const getVideoById = asyncHandler(async (req, res) => {
    // get video id from url
    const { videoId } = req.params
    if(!videoId?.trim()){
        throw new ApiError(400, "Please provide video id")
    }

    // get video details from DB
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, "Video found", video))
})

const updateVideo = asyncHandler(async (req, res) => {
    // get videoid from url
    const { videoId } = req.params
    if(!videoId?.trim()){
        throw new ApiError(400, "Please provide video id")
    }
    const thumbnailLocalPath= req.file?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Please provide thumbnail local path")
    }

    // get title and description from frontend
    const {title,description}= req.body
    if(!title || !description){
        throw new ApiError(400, "Please provide title and description")
    }
   
    const videoData= await Video.findById(videoId)
    const oldthumbnailUrl= await videoData.thumbnail
     // delete video and thumbnail from cloudinary
     const deleteThumbnail= await deleteFromCloudinary(oldthumbnailUrl, 'image')
    if(!deleteThumbnail){
        throw new ApiError(500, "Error deleting thumbnail from cloudinary")
    }


    // upload thumbnail to cloudinary
    const thumbnail= await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(500, "Error uploading thumbnail on cloudinary")
    }

    // update video details in DB
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                thumbnail: thumbnail.url,
            }
        },
        {new: true}
    )
    if(!video){
        throw new ApiError(500, "Error updating video details")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {video}, "Video details updated"))


})

const deleteVideo = asyncHandler(async (req, res) => {
    // get videoid from url
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "Please provide video id")
    }

    // get video and thumbnail url
    const videoData= await Video.findById(videoId)
    const videoUrl= await videoData.videoFile
    const thumbnailUrl= await videoData.thumbnail
    console.log("videoUrl: ",videoUrl, "thumbnailUrl: ",thumbnailUrl)

    // delete video from DB
    const video = await Video.findByIdAndDelete(videoId)
    if(!video){
        throw new ApiError(404, "Video not deleted")
    }

    // delete video and thumbnail from cloudinary
    const deleteVideo= await deleteFromCloudinary(videoUrl, 'video')
    const deleteThumbnail= await deleteFromCloudinary(thumbnailUrl, 'image')
    if(!deleteVideo || !deleteThumbnail){
        throw new ApiError(500, "Error deleting video or thumbnail from cloudinary")
    }


    return res
    .status(200)
    .json(new ApiResponse(200,{video},"Video was deleted Successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    // get videoid from url
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "Please provide video id")
    }

    // get video details from DB
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    // toggle publish status
    const newPublishStatus = !video.isPublished
    const updatedVideo = await Video.findByIdAndUpdate
    (videoId, {isPublished: newPublishStatus}, {new: true})
    if(!updatedVideo){
        throw new ApiError(500, "Error updating video publish status")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {updatedVideo}, "Video publish status updated successfully"))


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}