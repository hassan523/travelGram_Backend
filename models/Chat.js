import mongoose from 'mongoose';
const { Schema } = mongoose;

const ChatSchema = new Schema({

    connectionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "connections"
    },

    recieverID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },

    senderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    message: {
        type: String,
    },
    sharedRealtimeID: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: "realtime"
    }

}, { timestamps: true });

export default mongoose.model("chat", ChatSchema);