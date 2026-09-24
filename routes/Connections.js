import express from "express";
import { HandleGetConnections, HandleReqAction, HandleSendReq, remove_friend, Validate_Friend } from "../controllers/ConnectionsController.js";


const router = express.Router();



router.post("/:senderID/send-request/:recieverID", HandleSendReq)
router.patch("/request-action/:connectionID", HandleReqAction)
router.get("/get-connections/:userID", HandleGetConnections);
router.get("/:senderID/validate-friend/:recieverID", Validate_Friend);
router.delete("/:senderID/remove-friend/:recieverID", remove_friend);


export default router;