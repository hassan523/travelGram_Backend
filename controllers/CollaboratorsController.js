import RealTimeSchema from "../models/Realtime.js";
import UserSchema from "../models/User.js"
import HandlePostNotification from "../utils/Notify.js";
import HandleAddPoints from "../utils/PointsHandler.js";



const AddCollaborator = async (req, res) => {
    try {
        const { userId, realtimeID } = req.params;
        const { collaboratorsId } = req.body;

        const findUser = await UserSchema.findById(userId);
        const findRealTime = await RealTimeSchema.findById(realtimeID);

        if (!findRealTime) {
            return res.status(404).json({ message: "Invalid RealTime" });
        }

        if (!findUser) {
            return res.status(400).json({ message: "User Not Found!" });
        } else {
            if (!Array.isArray(collaboratorsId)) {
                return res.status(400).json({ message: "Invalid Format" });
            }

            let validatedIds = [];
            let notifications = [];

            await Promise.all(collaboratorsId.map(async (item) => {
                const checkCollaboratorValidation = await UserSchema.findById(item._id);
                if (!checkCollaboratorValidation) {
                    return res.status(400).json({ message: `${item.name} is an invalid User` });
                }

                // Check if the collaborator is already added
                if (findRealTime.collaboratorsId.includes(item._id)) {
                    return res.status(400).json({ message: `${item.name} is already a collaborator` });
                }

                validatedIds.push(item._id);

                notifications.push({
                    userId: findUser._id,
                    message: `You have added ${item.name} as a collaborator of this post ${findRealTime.name}`,
                    notiftype: 'collaboration'
                });
            }));

            if (validatedIds.length === 0) {
                return res.status(400).json({ message: "No Valid User Collaborators Found" });
            }

            // Combine existing collaborators with the new ones
            findRealTime.collaboratorsId = [...new Set([...findRealTime.collaboratorsId, ...validatedIds])];
            await findRealTime.save();

            await Promise.all(notifications.map(notification => HandlePostNotification(notification)));

            await HandleAddPoints({
                points: 15,
                type: "add",
                userId: findUser._id,
            });

            return res.status(200).json({ message: "Collaborator(s) Added Successfully" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const RemoveCollaborator = async (req, res) => {
    try {
        const { realtimeID } = req.params;
        const { removeCollaborators } = req.body;

        const findRealTime = await RealTimeSchema.findById(realtimeID);
        if (!findRealTime) {
            return res.status(404).json({ message: "Real Time Not Found" });
        }

        if (!Array.isArray(removeCollaborators)) {
            return res.status(400).json({ message: "Invalid Format" });
        }

        // Remove matching collaborator objects
        findRealTime.collaboratorsId = findRealTime.collaboratorsId.filter(collaborator =>
            !removeCollaborators.some(removeCollab => removeCollab._id === collaborator._id)
        );

        await findRealTime.save();

        return res.status(200).json({ message: "Collaborators Removed Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const GetCollaborationsRealtime = async (req, res) => {
    try {
        const { userId } = req.params;

        const findUser = await UserSchema.findById(userId);

        if (!findUser) {
            return res.status(404).json({ message: "User Not Found!" })
        } else {
            const find_Colaboration_realtime = (await RealTimeSchema.find({ collaboratorsId: { $in: userId } }))

            const getPinsData = find_Colaboration_realtime?.filter(item => item.type[0] === "pins")

            const getTravelogueData = find_Colaboration_realtime?.filter(item => item.type[0] === "travelogue")

            return res.status(200).json({ message: "Colaborators data", pins: getPinsData, travelogue: getTravelogueData })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })

    }
};

const GetCollaborationssingleRealtime = async (req, res) => {
    try {
        const { userId, realtimeID } = req.params;
        const findUser = await UserSchema.findById(userId);
        const findRealtime = await RealTimeSchema.findById(realtimeID)?.populate({
            path: 'collaboratorsId',
            model: 'user',
            select: '',
        });
        if (!findUser) {
            return res.status(404).json({ message: "User Not Found!" })
        } else {
            if (!findRealtime) {
                return res.status(404).json({ message: "Reatime Not found!" })
            } else {
                const realtimecollaborators = findRealtime.collaboratorsId;
                return res.status(200).json({ message: "Realtime Collaborators", realtimecollaborators });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })

    }
};

const GetFriends = async (req, res) => {
    try {
        const { userId, realtimeID } = req.params;
        const findUser = await UserSchema.findById(userId);
        const findRealtime = await RealTimeSchema.findById(realtimeID);

        if (!findUser) {
            return res.status(404).json({ message: "User Not Found!" })
        } else {
            if (!findRealtime) {
                return res.status(404).json({ message: "Reatime Not found!" })
            } else {
                const realtimecollaborators = findRealtime.collaboratorsId;
                return res.status(200).json({ message: "Realtime Collaborators", realtimecollaborators });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })

    }
};



export {
    AddCollaborator,
    RemoveCollaborator,
    GetCollaborationssingleRealtime,
    GetCollaborationsRealtime,
    GetFriends
}






