import UserSchema from "../models/User.js"

const HandleAddPoints = async ({ userId, points, type }) => {
    try {
        const findUser = await UserSchema.findById(userId);
        if (!findUser) {
            throw new Error("cannot add Points")
        } else {
            if (type === "add") {
                const update = await UserSchema.findByIdAndUpdate(findUser._id, {
                    $inc: { points: points }
                })
                if (!update) {
                    throw new Error("User Not Found")
                }
                console.log("Add Points")
                return update
            } else {
                const update = await UserSchema.findByIdAndUpdate(findUser._id, {
                    $inc: { points: - points }
                })
                if (!update) {
                    throw new Error("User Not Found")
                }
                console.log("Sub Points")
            }
        }
    } catch (error) {
        console.log(error)
    }
}




export default HandleAddPoints