import express from "express";
import {
  newTopic,
  deleteTopic,
  updateTopic,
  getAllTopic,
} from "../controllers/topic";
import { adminOnly } from "../middlewares/auth";
import upload, { handleMulterError } from "../middlewares/multer";

const topicRouter = express.Router();

topicRouter.post("/create", upload.single("topicImage"), adminOnly, newTopic);
topicRouter.get("/get-all-topic", getAllTopic);
topicRouter.delete("/delete/:id", adminOnly, deleteTopic);
topicRouter.put("/update/:id", upload.single("topicImage"), adminOnly, updateTopic);

export default topicRouter;
