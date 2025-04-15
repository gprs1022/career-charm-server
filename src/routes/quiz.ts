import express from "express";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizzesByTopicId,
} from "../controllers/quiz";
import { adminOnly } from "../middlewares/auth";
const quizRouter = express.Router();
quizRouter.post("/create", adminOnly, createQuiz);
quizRouter.delete("/delete/:quizId", adminOnly, deleteQuiz);
quizRouter.put("/update/:quizId", adminOnly, updateQuiz);
quizRouter.get("/get-quiz/:topicId", getQuizzesByTopicId);
export { quizRouter };
