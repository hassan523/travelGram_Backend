import express from "express";
import { HandleChat, HandleGetChats } from "../controllers/ChatController.js";



const router = express.Router();


router.post("/:senderID/send-message/", HandleChat);

router.get("/get-chats/:connectionID", HandleGetChats);


export default router
