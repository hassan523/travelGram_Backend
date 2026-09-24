import mongoose from 'mongoose';
const { Schema } = mongoose;

const ActivitySchema = new Schema({
    userId: {
        type:  mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"user"
    },
    RealtimeId:{
        type:  mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"realtime"
    },
    locationId:{
        type:  mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"realtime"
    },
    Activity_name: {
        type: String,
        required: true
    },
    Budget: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    featuredImage: {
        type: String,
        default: 'https://res.cloudinary.com/dhuhpslek/image/upload/fl_preserve_transparency/v1721946752/imageszzzz_sn7njl.jpg?_s=public-apps'
    },
    galleryImages: {
        type: [String],
        default: ['https://res.cloudinary.com/dhuhpslek/image/upload/fl_preserve_transparency/v1721946752/imageszzzz_sn7njl.jpg?_s=public-apps']
    },
    type: {
        type: [String],
        enum: ['pins','travelogue'],
    },
}, { timestamps: true });

export default mongoose.model("activity", ActivitySchema);