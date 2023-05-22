import express from "express";
import {signup, login, logout, checkVerified, checkVerificationCode, getUserID} from "../controllers/auth.js";


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
// router.post("/verifyEmail", verifyEmail);
router.post("/checkVerified", checkVerified);
router.post("/checkVerificationCode", checkVerificationCode);
router.get("/get-uid", getUserID);



export default router;