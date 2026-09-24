import express from "express";
import {
    HandleUserRegister,
    handleLoginUser,
    handleForgotPassword,
    handleVerifyOtp,
    handleResetPassword,
    handleResendOtp,
    update_User_profile,
    get_user_profile, deleteUser,
    get_all_users,
    get_single_user,
    Admin_Status_change,
    search_users,
    TaggedPostPrivateOrPublic
} from "../controllers/UserController.js";
import { get_Notifications } from "../controllers/GlobalController.js";


const router = express.Router();


router.post("/register", HandleUserRegister);
router.post("/Login", handleLoginUser);
router.post("/forgot-password", handleForgotPassword);
router.post("/verifyOtp", handleVerifyOtp);
router.post("/resetPassword", handleResetPassword);
router.post("/resendOtp", handleResendOtp);
router.patch("/update_User_profile/:userId", update_User_profile);
router.get("/get_user_profile/:userId", get_user_profile);
router.delete("/deleteuser/:userId", deleteUser);
router.get("/getalluser/:adminId", get_all_users);
router.get("/search_user/:userID", search_users);
router.get("/getsingleuser/:userId", get_single_user);
router.patch("/changestatus/:adminId/:userId", Admin_Status_change);

router.patch("/changetaggedrealtimestatus/:userId/:userId", TaggedPostPrivateOrPublic);


// Notifications 
router.get("/get_notifications/:userId", get_Notifications);


export default router;