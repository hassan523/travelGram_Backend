
import mongoose from 'mongoose';
const { Schema } = mongoose;

const RealTimeSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    collaboratorsId: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "user"
    },
    realtime_name: {
        type: String,
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
    Likes: [
        {
            userID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
        },
    ],
    type: {
        type: [String],
        enum: ['pins', 'travelogue'],
    },
}, { timestamps: true });


export default mongoose.model("realtime", RealTimeSchema);