import { Application } from "express";
import { userRouter } from "./user";
import { questionRouter } from "./question-answer";
import topicRouter from "./topic";
import { articleRouter } from "./article";
import { categoryRouter } from "./course-category";
import courseRouter from "./course";
import { sectionRouter } from "./section";
import subSectionRouter from "./subsection";
import { quizRouter } from "./quiz";
import { likeCommentRouter } from "./likes-comments";

export const Routes = (app: Application): Application => {
  app.use("/api/user", userRouter);
  app.use("/api/question", questionRouter);
  app.use("/api/topic", topicRouter);
  app.use("/api/article", articleRouter);
  app.use("/api/category", categoryRouter);
  app.use("/api/course", courseRouter);
  app.use("/api/section", sectionRouter);
  app.use("/api/subsection", subSectionRouter);
  app.use("/api/quiz", quizRouter);
  app.use("/api", likeCommentRouter);
  return app;
};
