import mongoose from 'mongoose';
const { Schema } = mongoose;

const LocationsSchema = new Schema({
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
    location_name: {
        type: String,
        required: true
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
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

export default mongoose.model("locations", LocationsSchema);