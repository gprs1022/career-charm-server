import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error";
import { createQuizRequestBody } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { prisma } from "../prisma/index";

export const createQuiz = TryCatch(
  async (
    req: Request<{}, {}, createQuizRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      title,
      correctOptionId,
      option1,
      option2,
      option3,
      option4,
      duration,
      topicId,
    } = req.body;

    if (
      !title ||
      !correctOptionId ||
      !option1 ||
      !option2 ||
      !option3 ||
      !option4 ||
      !duration ||
      !topicId
    ) {
      return next(new ErrorHandler("Please add all fields", 400));
    }

    const topic = await prisma.topic.findUnique({
      where: {
        id: topicId,
      },
    });

    if (!topic) {
      return next(new ErrorHandler("Topic not found", 400));
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        correctOptionId,
        option1,
        option2,
        option3,
        option4,
        duration,
        topicId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Successfully created Quiz",
      data: newQuiz,
    });
  }
);

export const getQuizzesByTopicId = TryCatch(async (req, res, next) => {
  const topicId = req.params.topicId;

  const topic = await prisma.topic.findUnique({
    where: { id: parseInt(topicId) },
  });

  if (!topic) {
    return next(new ErrorHandler(`Topic with ID ${topicId} not found`, 404));
  }

  const quizzes = await prisma.quiz.findMany({
    where: { topicId: parseInt(topicId) },
  });

  return res.status(200).json({
    success: true,
    data: quizzes,
  });
});

export const updateQuiz = TryCatch(async (req, res, next) => {
  const id = req.params.quizId;
  const {
    title,
    correctOptionId,
    option1,
    option2,
    option3,
    option4,
    duration,
    topicId,
  } = req.body;

  // Find the existing quiz
  const existingQuiz = await prisma.quiz.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingQuiz) {
    return next(new ErrorHandler(`Quiz with ID ${id} not found`, 404));
  }

  if (topicId) {
    const topic = await prisma.topic.findUnique({
      where: {
        id: topicId,
      },
    });

    if (!topic) {
      return next(new ErrorHandler("Topic not found", 400));
    }
  }

  // Update the quiz
  const updatedQuiz = await prisma.quiz.update({
    where: { id: parseInt(id) },
    data: {
      title: title || existingQuiz.title,
      correctOptionId: correctOptionId || existingQuiz.correctOptionId,
      option1: option1 || existingQuiz.option1,
      option2: option2 || existingQuiz.option2,
      option3: option3 || existingQuiz.option3,
      option4: option4 || existingQuiz.option4,
      duration: duration || existingQuiz.duration,
      topicId: topicId || existingQuiz.topicId,
    },
  });

  return res.status(200).json({
    success: true,
    message: `Quiz updated successfully`,
    data: updatedQuiz,
  });
});

export const deleteQuiz = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.quizId;

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingQuiz) {
      return next(new ErrorHandler(`Quiz with ID ${id} not found`, 404));
    }

    // Delete the quiz
    await prisma.quiz.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: `Quiz with ID ${id} deleted successfully`,
    });
  }
);
