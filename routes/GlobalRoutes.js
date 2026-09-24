import express from "express";
import { getCurrency, PostCurrency } from "../controllers/GlobalController.js";




const router = express.Router();


router.post("/post-currency", PostCurrency);
router.get("/get-currency", getCurrency);



export default router;