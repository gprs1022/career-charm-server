import { NextFunction, Request, Response } from "express";
import { TryCatch, errorMiddleware } from "../middlewares/error";
import { NewQuestionRequestBody } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { prisma } from "../prisma/index";

export const createQuestion = TryCatch(
  async (
    req: Request<{}, {}, NewQuestionRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { title, correctOptionId, option1, option2, option3, option4 } =
      req.body;

    if (
      !title ||
      !correctOptionId ||
      !option1 ||
      !option2 ||
      !option3 ||
      !option4
    ) {
      return next(new ErrorHandler(`All fields are required`, 400));
    }
    const newQuestion = await prisma.question.create({
      data: {
        title,
        correctOptionId,
        option1,
        option2,
        option3,
        option4,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: newQuestion,
    });
  }
);

export const getAllQuestion = TryCatch(async (req, res, next) => {
  const allQuestion = await prisma.question.findMany();
  return res.status(200).json({
    success: true,
    allQuestion,
  });
});

export const updateQuestion = TryCatch(async (req, res, next) => {
  const id = parseInt(req.params.id);
  const { title, correctOptionId, option1, option2, option3, option4 } =
    req.body;

  // Find the existing question
  const existingQuestion = await prisma.question.findUnique({
    where: { id },
  });

  if (!existingQuestion) {
    return next(new ErrorHandler(`Question with ID ${id} not found`, 404));
  }

  // Update the question
  const updatedQuestion = await prisma.question.update({
    where: { id },
    data: {
      title: title || existingQuestion.title,
      correctOptionId: correctOptionId || existingQuestion.correctOptionId,
      option1: option1 || existingQuestion.option1,
      option2: option2 || existingQuestion.option2,
      option3: option3 || existingQuestion.option3,
      option4: option4 || existingQuestion.option4,
    },
  });

  return res.status(200).json({
    success: true,
    message: `Question updated successfully`,
    data: updatedQuestion,
  });
});

export const deleteQuestion = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id as string);

    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return next(new ErrorHandler(`Question with ID ${id} not found`, 404));
    }

    // Delete the question
    await prisma.question.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: `Question with ID ${id} deleted successfully`,
    });
  }
);

export const verifyAnswer = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return next(new ErrorHandler(`Question with ID ${id} not found`, 404));
    }
    const correctOptionId = req.body.correctOptionId;

    if (correctOptionId !== existingQuestion.correctOptionId) {
      return next(new ErrorHandler(`Incorrect answer `, 404));
    }
    return res.status(200).json({
      success: true,
      message: `correct answer`,
    });
  }
);
