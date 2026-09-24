import mongoose, { Schema } from 'mongoose';


const NotificationsSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
         ref:"user"
    },
    message: {
        type: String,
        required: true
    },
    notiftype: {
        type: [String],
        enum: ['Auth','realtime','locations', 'activity' , 'chat', 'collaboration', 'friend', 'subscription'],
        default: ['none']
    },
}, { timestamps: true });

export default mongoose.model("notifications", NotificationsSchema);