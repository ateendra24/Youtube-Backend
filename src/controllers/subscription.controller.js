import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {

    const { channelId } = req.params;
    if (!channelId) {
        throw new ApiError(400, "Channel Id is required");
    }

    const subscriptionExist = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    if (subscriptionExist) {
        await Subscription.findOneAndDelete({ subscriber: req.user._id });

        const totalSubscribers = await Subscription.countDocuments({ channel: channelId });
        req.io.emit("subscriberCountUpdated", { channelId, totalSubscribers });
    } else {
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        });

        const totalSubscribers = await Subscription.countDocuments({ channel: channelId });
        req.io.emit("subscriberCountUpdated", { channelId, totalSubscribers });
    }

    return res.status(200).json(new ApiResponse(200, "Subscription toggled successfully"));
});



// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { userid } = req.params
    if (!userid) {
        throw new ApiError(400, "User Id is required")
    }

    const subscribers = await Subscription.find({
        channel: userid
    })
        .populate("subscriber", "fullname")


    return res
        .status(200)
        .json(new ApiResponse(200, "Subscribers found", subscribers))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

    const channels = await Subscription.find({
        subscriber: req.user._id
    })
        .populate("channel", "fullname avatar username")
    if (!channels) {
        throw new ApiError(404, "No subscribed channels found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Subscribed channels found", channels))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}