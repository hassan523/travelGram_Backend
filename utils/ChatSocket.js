import Chat from "../models/Chat.js";
import Realtime from "../models/Realtime.js";
import User from "../models/User.js";

const ChatSocket = (io) => {
    let connectedUsers = {};

    io.on("connection", (socket) => {
        const userID = socket.handshake.query.userID;
        console.log(userID)
        console.log("Connected to socket.io");

        socket.on("setup", async (userID) => {
            if (connectedUsers[userID] && connectedUsers[userID] !== socket.id) {
                console.log(`User already connected with a different socket ID. Replacing socket ID for ${userID}.`);
            }

            socket.join(userID);
            connectedUsers[userID] = socket.id;

            await User.findByIdAndUpdate(userID, { $set: { isOnline: true } })

            const allUser = Object.keys(connectedUsers).map((item) => item)

            console.log(allUser, "allUser")

            io.emit("online_users", Object.keys(connectedUsers).map((item) => item))


            socket.emit("disconnect_users", Object.keys(connectedUsers).map((item) => item));

            console.log(connectedUsers)

            console.log(Object.keys(connectedUsers).map((item) => item), "Connected to socket.io");

            socket.emit("connected", socket.id);
        });

        socket.on("join chat", (room) => {
            socket.join(room);
            console.log("User Joined Room: " + room);
            socket.to(room).emit("join chat", "Room Joined")
        });

        socket.on("leave chat", (room) => {
            socket.leave(room);
            console.log("User Left Room: " + room);
            socket.to(room).emit("leave chat", "Room Left")
        })

        socket.on("typing", (room) => socket.broadcast.to(room).emit("typing", true));




        socket.on("stop typing", (room) => socket.broadcast.to(room).emit("stop typing", false));


        socket.on("new message", async ({ room, newMessageRecieved }) => {

            if (!room) return console.log("chat.users not defined");
            console.log("room", room)
            console.log("newMessageRecieved", newMessageRecieved)
            // const findChat = await ChatModel.findOne({ _id: newMessageRecieved._id });
            // if (!findChat) {
            //     return console.log("chat not found");
            // }
            if (connectedUsers[newMessageRecieved.recieverID]) {
                // findChat.status = ['delivered']
                // await findChat.save();

                newMessageRecieved.map(async (item) => {

                    const findMessage = await Chat.findById(item._id)
                    .populate({
                        path: 'sharedRealtimeID',
                        model: 'realtime',
                        select: 'realtime_name featuredImage',
                        populate: { 
                            path: 'userId',
                            model: 'user', 
                            select: 'name profileImg'
                        }
                    });
                
                    // const findRealTime = await Realtime.findById()

                    socket.to(item.connectionID).emit("message recieved", findMessage);
                    io.to(connectedUsers[item.recieverID]).emit("latest message", findMessage);
                })

            } else {
                // findChat.status = ['sent']
                // await findChat.save();
                newMessageRecieved.map((item) => {
                    socket.to(item.connectionID).emit("message recieved", item);
                    io.to(connectedUsers[item.recieverID]).emit("latest message", item);
                })

            }
        });

        socket.on("message seen", async ({ room, chatID }) => {

            const findChat = await ChatModel.findOneAndUpdate({ _id: chatID }, {
                status: ['seen']
            })
            const getChat = await ChatModel.findById(findChat._id);

            socket.to(room).emit("message seen", getChat);
        });

        socket.on("seen all messages", async ({ room, recieverID, senderID }) => {

            console.log("room:", room)
            console.log("recieverID:", recieverID)
            console.log("senderID:", senderID)
            // Get Connection IDs From Front End Then Apply Condition To Update The Status Of The Message
            socket.to(room).emit("seen all messages", { connectionID: room, recieverID: recieverID, senderID: senderID });

        });

        socket.on("update to seen", async (currChat) => {
            await ChatModel.updateMany({
                connectionID: currChat.connectionID,
                $or: [
                    {
                        senderID: currChat.senderID,
                        recieverID: currChat.recieverID
                    },
                    {
                        senderID: currChat.recieverID,
                        recieverID: currChat.senderID
                    },
                ]

            }, {
                status: ['seen']
            });
            const chat = await ChatModel.find({
                connectionID: currChat.connectionID,
                $or: [
                    {
                        senderID: currChat.senderID,
                        recieverID: currChat.recieverID
                    },
                    {
                        senderID: currChat.recieverID,
                        recieverID: currChat.senderID
                    },
                ]
            })
            socket.emit("seened", chat)
        })

        socket.on("new notification", ({ userID, notifMessage }) => {

            console.log("notifMessage:", notifMessage)

            io.to(connectedUsers[userID]).emit("new notification", notifMessage);
        });

        socket.on('manual-disconnect', (id) => {
            if (connectedUsers[id]) {
                delete connectedUsers[id];
            } else {
                console.log('User not found:', id);
            }
        });

        socket.on('disconnect', async () => {
            if (connectedUsers[userID]) {
                delete connectedUsers[userID];
                console.log('User disconnected:', userID);
                await User.findByIdAndUpdate(userID, { $set: { isOnline: false } });
            } else {
                console.log('UserID not found in connectedUsers on disconnect:', userID);
            }

            const connectedUserIDs = Object.keys(connectedUsers);

            socket.emit("online_users", Object.keys(connectedUsers).map((item) => item))
            io.emit("disconnect_users", connectedUserIDs);

            console.log('Updated Connected Users after actual disconnect:', connectedUsers);
        });

    });
};

export default ChatSocket;


// socket.on('is typing', ({ userID, recieverID }) => io.to(connectedUsers[recieverID]).emit("is typing", {
//     userID,
//     recieverID,
//     typing: true
// }));

// socket.on('is not typing', ({ userID, recieverID }) => io.to(connectedUsers[recieverID]).emit("is not typing", {
//     userID,
//     recieverID,
//     typing: false
// }));
