import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    dateofbirth: {
        type: String,
    },
    address: {
        type: String,
        required: true
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Currency"
    },
    points: {
        type: Number,
        default: 0
    },
    profileImg: {
        type: String,
        default: 'https://res.cloudinary.com/dhuhpslek/image/upload/fl_preserve_transparency/v1712595866/profile_demo_image_g57r6t.jpg?_s=public-apps'
    },
    no_Pins: {
        type: Number,
        default: 3
    },
    no_locations: {
        type: Number,
        default: 3
    },
    no_travelogue: {
        type: Number,
        default: 3
    },
    no_Activity: {
        type: Number,
        default: 3
    },
    OtpCode: {
        type: Number
    },
    OtpExp: {
        type: Number
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    role: {
        type: [String],
        enum: ['User', 'Admin'],
        default: ['User']
    },
    status: {
        type: [String],
        enum: ['Active', 'Blocked'],
        default: ['Active']
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    taggedRealtimeSetting: {
        type: [String],
        enum: ['Private', 'Public'],
        default: ['Public']
    }

}, { timestamps: true });

export default mongoose.model("user", UserSchema);