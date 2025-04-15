import express from "express";
import {
  newArticle,
  deleteArticle,
  updateArticle,
  getAllArticle,
  getArticle,
} from "../controllers/article";
import { adminOnly } from "../middlewares/auth";
import upload, { handleMulterError } from "../middlewares/multer";

const articleRouter = express.Router();

// Use multer middleware for file uploads
articleRouter.post("/create", adminOnly, upload.single('articleImage'), handleMulterError, newArticle);
articleRouter.get("/get-all-article/:topicId", getAllArticle);
articleRouter.get("/get-article/:articleId", getArticle);
articleRouter.delete("/delete/:articleId", adminOnly, deleteArticle);
articleRouter.patch("/update/:articleId", adminOnly, upload.single('articleImage'), handleMulterError, updateArticle);

export { articleRouter };
