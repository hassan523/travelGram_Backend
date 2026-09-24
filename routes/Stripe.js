import express from "express";
import { HandleGetPaymentIntent } from "../controllers/StripeController.js";

const router = express.Router();


router.post("/get-intent", HandleGetPaymentIntent)


export default router;