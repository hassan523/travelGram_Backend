import CurrencySchema from "../models/CurrencySchema.js";
import Notifications from "../models/Notifications.js";




const get_Notifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const getNotifications = await Notifications.find({ userId: userId }).populate({
            path: "userId", // key defined in 
            model: "user", // where you have to get data 
            select: "-password" // data that you need 
        }).sort({
            createdAt: -1
        })

        return res.status(200).json({ message: "all Notifications", getNotifications })

    } catch (error) {
        return res.status(500).json({ message: "Internal server Error!" })
    }
}

const PostCurrency = async (req, res) => {
    try {
        const currencies = req.body;
        await CurrencySchema.insertMany(currencies);
        res.status(201).send({ message: 'Currencies added successfully!' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Internal Server Error!"})
    }
} 

const getCurrency = async (req, res) => {
try {
    const currencies = await CurrencySchema.find();
    return res.status(200).json({message:"All Currencies", currencies})
} catch (error) {
    console.log(error);
    return res.status(500).json({message:"Internal Server Error!"})
}
}

export {
    get_Notifications,
    PostCurrency,
    getCurrency
};