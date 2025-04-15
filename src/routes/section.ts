import express from "express";
import {
  createSection,
  deleteSection,
  updateSection,
} from "../controllers/section";
import { adminOnly } from "../middlewares/auth";
const sectionRouter = express.Router();
sectionRouter.post("/create", adminOnly, createSection);
sectionRouter.delete("/delete/:sectionId", adminOnly, deleteSection);
sectionRouter.put("/update/:sectionId", adminOnly, updateSection);
export { sectionRouter };
