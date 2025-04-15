import express from "express";
import {
  createCourse,
  deleteCourse,
  updateCourse,
  courseById,
  getAllCourse,
} from "../controllers/course";
import { adminOnly } from "../middlewares/auth";
import upload from "../middlewares/multer";
const courseRouter = express.Router();

courseRouter.get("/get-all-Course", getAllCourse);
courseRouter.get("/:courseId", adminOnly, courseById);
courseRouter.post("/create", upload.single("thumbnail"), adminOnly, createCourse);
courseRouter.delete("/delete/:courseId", adminOnly, deleteCourse);
courseRouter.put("/update/:courseId", upload.single("thumbnail"), adminOnly, updateCourse);

export default courseRouter;
