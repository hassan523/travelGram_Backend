import express from "express";
import { Create_Activity, delete_Activity, get_Activity, getActivityLength, getSingleActivity, UpdateActivity } from "../controllers/ActivityController.js";




const router = express.Router();


router.post("/create_activity/:userId/:RealtimeId/:locationId", Create_Activity);
router.delete("/delete_activity/:userId/:ActivityId", delete_Activity);
router.get("/get_activity/:userId/:type/:ActivityId", get_Activity);
router.get("/get_single_activity/:userId/:ActivityId", getSingleActivity);

// activity length for statusbar api calls
router.get("/getactivitylenght/:userId", getActivityLength);
router.patch("/update-activity/:userId/:activityId", UpdateActivity);



export default router;