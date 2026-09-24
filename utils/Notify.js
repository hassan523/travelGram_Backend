import Notifications from "../models/Notifications.js";

const HandlePostNotification = async ({ userId, message, notiftype }) => {
    try {
        const createNofif = new Notifications({
            userId: userId,
            message: message,
            notiftype: notiftype
        })
        await createNofif.save()

        return createNofif
    } catch (error) {
        console.log(error)
    }
}



export default HandlePostNotification