import express from "express";
import multer from 'multer';
import {getPost, newPost, getComments, getLikes, getLikesById, postComments, likePost} from "../controllers/feed.js";


const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Set the destination folder for uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Use the original file name
    }
  });

  const upload = multer({ storage });

router.get("/get-post", getPost);
router.post("/new-post", upload.single('image'), newPost);
router.get("/get-comments", getComments);
router.get("/get-likes", getLikes);
router.post("/add-comment", postComments);
router.post("/like-post", likePost);
router.post("/post-likes", getLikesById);





export default router;