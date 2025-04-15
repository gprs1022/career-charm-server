import express from "express";
import {
  createSubSection,
  deleteSubSection,
  updateSubSection,
} from "../controllers/subsection";
import { adminOnly } from "../middlewares/auth";
import { videoUpload, handleMulterError } from "../middlewares/multer";

const subSectionRouter = express.Router();

subSectionRouter.post("/create", videoUpload.single("video"), handleMulterError, adminOnly, createSubSection);
subSectionRouter.delete("/delete/:subSectionId", adminOnly, deleteSubSection);
subSectionRouter.put("/update/:subSectionId", videoUpload.single("video"), handleMulterError, adminOnly, updateSubSection);

export default subSectionRouter;
