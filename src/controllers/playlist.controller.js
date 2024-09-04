import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    // get name and description from frontend
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400, "Please provide name and description")
    }

    // save playlist details in DB
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })
    if(!playlist){
        throw new ApiError(500, "Error creating playlist")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, "Playlist created successfully", playlist))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    // get user id from url
    const {userId} = req.params
    if(!userId){
        throw new ApiError(400, "Please provide user id")
    }

    // get all playlists for the user
    const userPlaylist = await Playlist.find({ owner: userId });
    if(userPlaylist.length === 0){
        throw new ApiError(404, "No playlist found for the user")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, userPlaylist, "User playlists found" ))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    // get playlist id from url
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(400, "Please provide playlist id")
    }

    // get playlist details
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist found"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // get playlist and video id from url
    const {playlistId, videoId} = req.params
    if(!playlistId || !videoId){
        throw new ApiError(400, "Please provide correct playlist id and video id")
    }

    // add videoID to Playlist
    const playlist= await Playlist.findByIdAndUpdate(playlistId,
        {
            $push:{
                videos: videoId
            }
        },
        {
            new: true
        }
    )
    if(!playlist){
        throw new ApiError(500, "Error adding video to playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist successfully" ))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // get playlist and video id from
    const {playlistId, videoId} = req.params
    if(!playlistId || !videoId){
        throw new ApiError(400, "Please provide correct playlist id and video id")
    }

    // remove videoID to Playlist
    const playlist= await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull:{
                videos: videoId
            }
        },
        {
            new: true
        }
    )
    if(!playlist){
        throw new ApiError(500, "Error adding video to playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist successfully" ))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // get playlist id from
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(400, "Please provide playlist id")
    }

    // delete playlist
    const playlist= await Playlist.findByIdAndDelete(playlistId)
    if(!playlist){
        throw new ApiError(500, "Error deleting playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist deleted successfully" ))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    // get playlistid, name, desc
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!playlistId){
        throw new ApiError(400, "Please provide playlist id")
    }

    if(!name || !description){
        throw new ApiError(400, "Please provide name and description")
    }

    // update playlist
    const playlist= await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }
        },
        {
            new: true
        }
    )
    if(!playlist){
        throw new ApiError(500, "Error updating playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully" ))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}