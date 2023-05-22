

import express from "express";
import {getAllMessages,forwardMessage, sendMessage} from "../controllers/messages.js";

const router = express.Router();

router.post("/get-all-messages", getAllMessages);
router.post("/send-message", sendMessage);
router.post("/forward-message", forwardMessage);








export default router;