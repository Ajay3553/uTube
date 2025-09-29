import mongoose, {Schema} from 'mongoose'

const subscriptionSchema = new Schema({
    subscriber: {
        type : Schema.Types.ObjectId, // person subscribing to channel
        ref: "User"
    },
    channel : {
        type: Schema.Types.ObjectId, //person gain new subscriber
        ref: "User"
    }

}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)