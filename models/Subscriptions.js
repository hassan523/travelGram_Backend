import mongoose from 'mongoose';
const { Schema } = mongoose;

const SubscriptionSchema = new Schema({
    packageName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discounted_Price: {
        type: Number,
        default:0
    },
    description: {
        type: String,
        required: true
    },
    no_Pins: {
        type: Number,
        required: true
    },
    no_locations: {
        type: Number,
        required: true
    },
    no_travelogue: {
        type: Number,
        required: true
    },
    no_Activity: {
        type: Number,
        required: true
    },
}, { timestamps: true });

export default mongoose.model("Subscription", SubscriptionSchema);