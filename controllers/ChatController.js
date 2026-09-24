import ChatSchema from "../models/Chat.js";
import ConnectionSchema from "../models/Connections.js";
import Realtime from "../models/Realtime.js";
import UserSchema from "../models/User.js"
import HandlePostNotification from "../utils/Notify.js";


const HandleChat = async (req, res) => {
    try {

        const { senderID } = req.params;
        const { recievers } = req.body;

        if (!Array.isArray(recievers)) {
            return res.status(400).json({ message: "Invalid Format " })
        }

        const findSender = await UserSchema.findById(senderID)
        if (!findSender) {
            return res.status(404).json({ message: "User Not Found" })
        }

        const map = recievers.map(async (item) => {

            if (item.sharedRealtimeID === null) {
                const createChat = new ChatSchema({
                    connectionID: item.connectionID,
                    senderID: senderID,
                    recieverID: item.reciverID,
                    message: item.message,
                    sharedRealtimeID: null
                })
                await createChat.save();
                return createChat;
            } else {
                const createChat = new ChatSchema({
                    connectionID: item.connectionID,
                    senderID: senderID,
                    recieverID: item.reciverID,
                    message: item.message,
                    sharedRealtimeID: item.sharedRealtimeID
                })
                await HandlePostNotification({
                    userId: findSender?._id,
                    message: `You have Shared realtime in chat successfully`,
                    notiftype: 'chat'
                });

                await HandlePostNotification({
                    userId: item.reciverID,
                    message: `${findSender?.name} shared realtime in chat!`,
                    notiftype: 'chat'
                });
                await createChat.save();

                const findChat = await ChatSchema.findById(createChat._id).populate({
                    path: 'sharedRealtimeID',
                    model: 'realtime',
                    select: 'realtime_name featuredImage',
                    populate: {
                        path: 'userId',
                        model: 'user',
                        select: 'name profileImg'
                    }
                });

                return findChat;
            }
        });
        const resolved = await Promise.all(map);
        return res.status(200).json({ message: "Message Sent Successfully", chat: resolved })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const HandleGetChats = async (req, res) => {
    try {
        const { connectionID } = req.params;
        const findConnections = await ConnectionSchema.findOne({
            _id: connectionID
        })
        if (!findConnections) {
            return res.status(404).json({ messsage: "Connection Not Found" })
        }
        const findChats = await ChatSchema.find({ connectionID: connectionID })
            .populate({
                path: 'sharedRealtimeID',
                model: 'realtime',
                select: '',
                populate: {
                    path: 'userId',
                    model: 'user',
                    select: '-password'
                }
            })

        res.status(200).json({ chats: findChats })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Server", error })
    }
};


export {
    HandleChat,
    HandleGetChats
}