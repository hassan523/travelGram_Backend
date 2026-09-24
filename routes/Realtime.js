import express from "express";
import { getRealTime, getRealtimeLength, GetSingleRealtime, HandleCreateRealtime, handledeleteRealTime, LikeRealtime, updateRealtime } from "../controllers/RealtimeController.js";
import { AddCollaborator, RemoveCollaborator, GetCollaborationsRealtime, GetCollaborationssingleRealtime, GetFriends } from "../controllers/CollaboratorsController.js";

const router = express.Router();

router.post("/create_realtime/:userId", HandleCreateRealtime);
router.delete("/delete_realtime/:userId/:realTimeId", handledeleteRealTime);
router.get("/getRealTime/:userId/:type", getRealTime);
router.get("/singlerealtime/:userId/:RealTimeId", GetSingleRealtime);
router.patch("/likerealtime/:userId/:RealTimeId", LikeRealtime);

router.patch("/updaterealtime/:userId/:RealTimeId", updateRealtime);
// for realtime subscription bar APi
router.get("/getrealtimelength/:type/:userId", getRealtimeLength);


// Realtime Collaborators 
router.patch("/add-collaborators/:userId/:realtimeID", AddCollaborator)
router.patch("/remove-collaborators/:realtimeID", RemoveCollaborator)
router.get("/GetCollaborationsRealtime/:userId", GetCollaborationsRealtime)
router.get("/getCollaborations-single-Realtime/:userId/:realtimeID", GetCollaborationssingleRealtime)
router.get("/get-friends/:userId/:realtimeID", GetFriends)

export default router;