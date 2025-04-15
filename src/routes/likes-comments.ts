import express from "express";
import {
  toggleLikeArticle,
  createComment,
  deleteComment,
  updateComment,
  getAllCommentsByUser,
} from "../controllers/likes-comments";
import { adminOnly } from "../middlewares/auth";
const likeCommentRouter = express.Router();
likeCommentRouter.post("/like-dislike/:articleId", toggleLikeArticle);
likeCommentRouter.post("/create-comment", createComment);
likeCommentRouter.get("/get-all/:userId", adminOnly, getAllCommentsByUser);
likeCommentRouter.put("/update-comment/:commentId", updateComment);
likeCommentRouter.delete("/delete-comment/:commentId", deleteComment);
export { likeCommentRouter };
