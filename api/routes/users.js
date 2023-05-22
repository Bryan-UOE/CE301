// import express from "express";
// import multer from 'multer';
// import { getUsers, updateUser, getDepartments } from "../controllers/users.js";

// const upload = multer({ dest: 'uploads/' });
// const router = express.Router();

// router.get("/get-users", getUsers);
// router.put("/update-user/:id", upload.single('image'), updateUser);
// router.get("/get-departments/", getDepartments);



// export default router;

import express from "express";
import multer from 'multer';
import { getAllUsers,getUsers, updateUser, getDepartments, deleteUser } from "../controllers/users.js";

const upload = multer({ dest: '../uploads' });
const router = express.Router();

router.get("/get-all-users", getAllUsers);
router.get("/get-users", getUsers);
router.put("/update-user/:id", upload.single('image'), updateUser);
router.get("/get-departments", getDepartments);
router.post("/delete-user", deleteUser)


export default router;
