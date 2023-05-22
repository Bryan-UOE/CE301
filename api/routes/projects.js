import express from "express";
import { getProjects, getTotalProjectCount, getTotalTaskCount, getWorkload, getTimeSpent, getOverallProgress, getTasks, getAllProjects, getAssignedUsers, getDetailsComments, newComment, getProjectUpdates, newProject, getUnassignedUsers, assignUsers } from "../controllers/projects.js";

const router = express.Router();

router.post("/projects", getProjects);
router.post("/project-count", getTotalProjectCount);
router.post("/task-count", getTotalTaskCount);
router.post("/workload", getWorkload);
router.post("/time-spent", getTimeSpent);
router.post("/project-overall", getOverallProgress);
router.post("/tasks", getTasks);
router.get("/get-all-projects", getAllProjects);
router.post("/get-assigned-users", getAssignedUsers);
router.post("/get-details-comments", getDetailsComments);
router.post("/new-comment", newComment);
router.post("/get-project-updates", getProjectUpdates);
router.post("/new-project", newProject);
router.post("/get-unassigned-users", getUnassignedUsers);
router.post("/assign-users", assignUsers);



export default router;