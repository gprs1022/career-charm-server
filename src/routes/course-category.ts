import express from "express";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  getAllCategory,
} from "../controllers/course-category";
import { adminOnly } from "../middlewares/auth";
const categoryRouter = express.Router();
categoryRouter.post("/create", adminOnly, createCategory);
categoryRouter.get("/get-all-category", getAllCategory);
categoryRouter.delete("/delete/:categoryId", adminOnly, deleteCategory);
categoryRouter.put("/update/:categoryId", adminOnly, updateCategory);
export { categoryRouter };
