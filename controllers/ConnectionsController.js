import ConnectionSchema from "../models/Connections.js";
import UserSchema from "../models/User.js";
import ChatSchema from "../models/Chat.js";
import HandlePostNotification from "../utils/Notify.js";

const HandleSendReq = async (req, res) => {
    try {
        const { senderID, recieverID } = req.params;
        const findSender = await UserSchema.findById(senderID);
        if (!findSender) {
            return res.status(404).json({ message: "User Not Found" })
        }
        const findReciever = await UserSchema.findById(recieverID);
        if (!findReciever) {
            return res.status(404).json({ message: "User Not Found" })
        }
        if (findReciever.role.includes("Admin") || findSender.role.includes("Admin")) {
            return res.status(403).json({ message: "Invalid Request" })
        }
        if (senderID === recieverID) {
            return res.status(400).json({ message: "Invalid request" })
        }
        const validateConnection = await ConnectionSchema.findOne({
            $or: [
                { senderID: senderID, recieverID: recieverID },
                { senderID: recieverID, recieverID: senderID },
            ]
        })
        if (validateConnection) {
            return res.status(400).json({ message: `Request Already ${validateConnection.status[0]}` })
        }
        const createConnection = new ConnectionSchema({
            senderID: senderID,
            recieverID: recieverID
        })

        await createConnection.save();

        const Notification = HandlePostNotification({
            userId: findSender._id,
            message: `You have Requested a Friend request to ${findReciever.name}`,
            notiftype: 'friend'
        })

        const Notification_for_Reciver = HandlePostNotification({
            userId: findReciever._id,
            message: `${findSender.name} has requested you to be a Friend! `,
            notiftype: 'friend'
        })
        res.status(200).json({ message: "Request Sent Successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })
    }

}

const HandleReqAction = async (req, res) => {
    try {

        const { connectionID } = req.params;
        const { status } = req.body;
        const findConnection = await ConnectionSchema.findOne({ _id: connectionID, status: ["Pending"] });
        if (!findConnection) {
            return res.status(404).json({ message: "Connection Not Found" })
        }
        if (!Array.isArray(status)) {
            return res.status(400).json({ message: "invalid Status Format" })
        }
        if (status.includes("Rejected") ) {
            const populateConnections = await ConnectionSchema.findById(findConnection._id).populate({
                path: "senderID",
                model: "user",
                select: "-password"
            }).populate({
                path: "recieverID",
                model: "user",
                select: "-password"
            })

            const Notification = HandlePostNotification({
                userId: populateConnections.senderID._id,
                message: `Your Frieend Request has been Rejected by ${populateConnections?.recieverID?.name}`,
                notiftype: 'friend'
            })
            const Notification_for_reciver = HandlePostNotification({
                userId: populateConnections.recieverID._id,
                message: `You have Rejected The Friend Request of ${populateConnections?.senderID?.name}`,
                notiftype: 'friend'
            })
            const data = await ConnectionSchema.findByIdAndDelete(connectionID);

            return res.status(200).json({ message: "Request Rejected Successfully" })
        } else if (status.includes("Accepted")) {
            findConnection.status = ["Accepted"]
            await findConnection.save();

            const populateConnections = await ConnectionSchema.findById(findConnection._id).populate({
                path: "senderID",
                model: "user",
                select: "-password"
            }).populate({
                path: "recieverID",
                model: "user",
                select: "-password"
            })

            const Notification = HandlePostNotification({
                userId: populateConnections.senderID._id,
                message: `${populateConnections?.recieverID?.name} has accepted your Friend Request`,
                notiftype: 'friend'
            })
            const Notification_for_reciver = HandlePostNotification({
                userId: populateConnections.recieverID._id,
                message: `You have accepted a Friend Request of ${populateConnections?.senderID?.name}`,
                notiftype: 'friend'
            })
            return res.status(200).json({ message: "Request Accepted Successfully" })

        } else {
            res.status(400).json({ message: "Invalid Request" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const HandleGetConnections = async (req, res) => {
    try {
        const { userID } = req.params;
        const { connectionType } = req.query;
        const query = [connectionType]
        if (!query || query.includes("Accepted")) {
            const getConnections = await ConnectionSchema.find({
                $or: [
                    { senderID: userID },
                    { recieverID: userID },
                ],
                status: query
            }).populate({
                path: 'senderID',
                model: 'user',
                select: '-password'
            }).populate({
                path: 'recieverID',
                model: 'user',
                select: '-password'
            })
            return res.status(200).json({ connections: getConnections })
        } else if (query.includes("")) {
            const getConnections = await ConnectionSchema.find({
                $or: [
                    { senderID: userID },
                    { recieverID: userID },
                ],
            }).populate({
                path: 'senderID',
                model: 'user',
                select: '-password'
            }).populate({
                path: 'recieverID',
                model: 'user',
                select: '-password'
            })
            return res.status(200).json({ connections: getConnections })
        } else {
            const getConnections = await ConnectionSchema.find({
                $or: [
                    { senderID: userID },
                    { recieverID: userID },
                ],
                status: ["Pending"]
            }).populate({
                path: 'senderID',
                model: 'user',
                select: '-password'
            }).populate({
                path: 'recieverID',
                model: 'user',
                select: '-password'
            })
            return res.status(200).json({ connections: getConnections })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const Validate_Friend = async (req, res) => {
    try {
        const { senderID, recieverID } = req.params;

        const findSender = await UserSchema.findById(senderID);
        if (!findSender) {
            return res.status(404).json({ message: "User Not Found" })
        }
        const findReciever = await UserSchema.findById(recieverID);
        if (!findReciever) {
            return res.status(404).json({ message: "User Not Found" })
        }

        const validateConnection = await ConnectionSchema.findOne({
            $or: [
                { senderID: senderID, recieverID: recieverID },
                { senderID: recieverID, recieverID: senderID },
            ]
        })
        if (validateConnection) {
            return res.status(200).json({message:"Sucessfully Validated" ,validateConnection});
        } else {
            res.status(200).json({ message: "No Connection" })
        }
    } catch (error) {
        
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })
    }
}

const remove_friend = async (req, res) => {
    try {

            const { senderID, recieverID } = req.params;
    
            const findSender = await UserSchema.findById(senderID);
            if (!findSender) {
                return res.status(404).json({ message: "User Not Found" })
            }
            const findReciever = await UserSchema.findById(recieverID);
            if (!findReciever) {
                return res.status(404).json({ message: "User Not Found" })
            }
    
            const validateConnection = await ConnectionSchema.findOne({
                $or: [
                    { senderID: senderID, recieverID: recieverID },
                    { senderID: recieverID, recieverID: senderID },
                ]
            })
            if (validateConnection) {

                const FriendIdToremove = validateConnection._id.toString();

                const findChats = await ChatSchema.deleteMany({connectionID: FriendIdToremove});

                const deleteFriend = await ConnectionSchema.findByIdAndDelete(FriendIdToremove);
                return res.status(200).json({message:"Friend Removed Succesfully!", FriendIdToremove});


            } else {
                res.status(200).json({ message: "You are Not a Friend!" })
            }
         
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Internal Server Error!"})
    }
}


export {
    HandleSendReq,
    HandleReqAction,
    HandleGetConnections,
    Validate_Friend,
    remove_friend
}