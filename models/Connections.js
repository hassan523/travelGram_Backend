import mongoose from 'mongoose';
const { Schema } = mongoose;

const ConnectionsSchema = new Schema({
    senderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    recieverID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    status: {
        type: [String],
        enum: ['Rejected', 'Accepted', "Pending"],
        default: ['Pending']
    }
}, { timestamps: true });

export default mongoose.model("connections", ConnectionsSchema);