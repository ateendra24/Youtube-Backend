import mongoose,{Schema} from "mongoose";

const SubscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // one who is Subscribing
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId, // one to who subscriber is Subscribing
        ref: "User"
    },
},{timestamps: true})

export const Subscription= mongoose.model("Subscription",SubscriptionSchema)