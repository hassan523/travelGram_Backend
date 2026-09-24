import express from "express";
import { Create_Locations, delete_locations, get_Locations, getLocationLength, getSingleLocation, UpdateLocation } from "../controllers/LocationsController.js";

const router = express.Router();


router.post("/create_locations/:userId/:RealtimeId", Create_Locations);

router.delete("/delete_locations/:userId/:realTimeId/:locationId", delete_locations);

router.get("/all_locations/:userId/:realTimeId/:type", get_Locations);

router.get("/get_single_location/:userId/:locationID", getSingleLocation);

// for User SubscriptionBar In locations
router.get("/getlocationslenght/:userId", getLocationLength);

router.patch("/update-location/:userId/:LocationId", UpdateLocation);





export default router;