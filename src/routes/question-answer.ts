import express from "express";
import {
  createQuestion,
  getAllQuestion,
  updateQuestion,
  deleteQuestion,
  verifyAnswer,
} from "../controllers/question-answer";
import { adminOnly } from "../middlewares/auth";
const questionRouter = express.Router();
questionRouter.post("/create", adminOnly, createQuestion);
questionRouter.get("/get-all", getAllQuestion);
questionRouter.put("/update-question/:id", adminOnly, updateQuestion);
questionRouter.delete("/delete-question/:id", adminOnly, deleteQuestion);
questionRouter.post("/verify-answer/:id", verifyAnswer);
export { questionRouter };
