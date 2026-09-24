import express from "express";
import { get_subscription, handleCreateSubscription, handleDeleteSubscription, updateSubscription } from "../controllers/SubscriptionController.js";



const router = express.Router();


router.post("/create_subscription", handleCreateSubscription);
router.delete("/delete_subscription/:adminId/:subscriptionId", handleDeleteSubscription);
router.patch("/update_subscription/:adminId/:subscriptionId", updateSubscription);
router.get("/getsubscription", get_subscription);



export default router;