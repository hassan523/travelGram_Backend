import SubscriptionSchema from "../models/Subscriptions.js";
import UserSchema from "../models/User.js";
import HandlePostNotification from "../utils/Notify.js";


const handleCreateSubscription = async (req, res) => {
    try {
        const { packageName, price, discounted_Price, description, no_Pins, no_locations, no_travelogue, no_Activity, userId } = req.body;

        const checkAdmin = await UserSchema.findById(userId);
        if (!checkAdmin) {
            return res.status(400).json({ message: "User Not Existed!" });
        }
        if (!checkAdmin.role.includes("Admin")) {
            return res.status(400).json({message:"You are not an Admin"})
        }
        else {
            const getsubscriptions = await SubscriptionSchema.findOne({packageName:packageName});
            if(getsubscriptions){
               return res.status(400).json({message:"Subscription already exists!"}) 
            }else{
                const create_package = SubscriptionSchema({
                    packageName: packageName,
                    price: price,
                    discounted_Price: discounted_Price,
                    description: description,
                    no_Pins:no_Pins,
                    no_locations:no_locations,
                    no_travelogue:no_travelogue,
                    no_Activity:no_Activity
                });
           
                const save = await create_package.save();
                res.status(200).json({ message: "Admin has created Package!", save });

                const Notification = HandlePostNotification({
                    userId: checkAdmin._id,
                    message: `${checkAdmin.name} Has created subscription Successfully`,
                    notiftype:'subscription'
                })
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server Error!" });
    }
};

const handleDeleteSubscription = async (req, res) => {
    try {
        const { adminId, subscriptionId } = req.params;
        const findAdmin = await UserSchema.findById(adminId);
        console.log(findAdmin, "here is admin")
        if (!findAdmin || !findAdmin.role.includes("Admin")) {
            return res.status(400).json({ message: "User is not an admin!" });
        }

        const findSubscription = await SubscriptionSchema.findByIdAndDelete(subscriptionId);
        if (!findSubscription) {
            return res.status(404).json({ message: "Subscription Not Found!" });
        }

        await HandlePostNotification({
            userId: findAdmin._id,
            message: `${findAdmin.name} has deleted this subscription successfully`,
            notiftype:'subscription'
        });

      res.status(200).json({ message: "Subscription has been deleted successfully!" });

    } catch (error) {
     res.status(500).json({ message: "Internal Server Error!" });
    }
}

const updateSubscription = async (req, res) => {
    try {
        const {adminId ,subscriptionId } = req.params;

        const {packageName, price, discounted_Price, description, no_Pins, no_locations, no_travelogue, no_Activity } = req.body;

        const findAdmin = await UserSchema.findById(adminId);
        const findsubscription = await SubscriptionSchema.findById(subscriptionId)

        if(!findAdmin.role.includes("Admin")){
            return res.status.json({message:"Invalid User!"})
        }else{

            if(!findsubscription){
                return res.status.json({message:"Subscription not found"})
            }else{

                findsubscription.packageName = packageName || findsubscription.packageName,
                findsubscription.price = price || findsubscription.price,
                findsubscription.discounted_Price = discounted_Price || findsubscription.discounted_Price,
                findsubscription.description = description || findsubscription.description,
                findsubscription.no_Pins = no_Pins || findsubscription.no_Pins,
                findsubscription.no_locations = no_locations || findsubscription.no_locations,
                findsubscription.no_travelogue = no_travelogue || findsubscription.no_travelogue,
                findsubscription.no_Activity = no_Activity || findsubscription.no_Activity
               
                await findsubscription.save();
                res.status(200).json({ message: "Subscription updated succesfully", findsubscription })
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server Error!"})

    }
}


const get_subscription = async (req, res) => {
    try {
        const getsubscriptions = await SubscriptionSchema.find();
        return res.status(200).json({message:"all subscriptions", getsubscriptions})
        
    } catch (error) {
        return res.status(500).json({message:"Internal server Error!"})
    }
}

const handlePurchaseSubscription = async (req, res) => {
    try {
        const { userId, SubscriptionId} = req.params;
    } catch (error) {
        return res.status(500).json({message:"Internal server Error!"});
    }
}




export {
    handleCreateSubscription,
    handleDeleteSubscription,
    updateSubscription,
    get_subscription
 };