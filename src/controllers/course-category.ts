import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error";
import { createCategoryRequestBody } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { prisma } from "../prisma/index";

export const createCategory = TryCatch(
  async (
    req: Request<{}, {}, createCategoryRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name } = req.body;
    if (!name) return next(new ErrorHandler("Please add all fields", 400));
    const Category = await prisma.courseCategory.findUnique({
      where: {
        name,
      },
    });

    if (Category) {
      return next(new ErrorHandler("Category already exist in db", 409));
    }
    const newCategory = await prisma.courseCategory.create({
      data: {
        name: name,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Successfully created Category",
      data: newCategory,
    });
  }
);

export const getAllCategory = TryCatch(async (req, res, next) => {
  const allCategory = await prisma.courseCategory.findMany();
  return res.status(200).json({
    success: true,
    allCategory,
  });
});

export const updateCategory = TryCatch(async (req, res, next) => {
  const id = req.params.categoryId;
  const { name } = req.body;

  // Find the existing question
  const existingCategory = await prisma.courseCategory.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    return next(new ErrorHandler(`Category with ID ${id} not found`, 404));
  }

  // Update the question
  const updatedCategory = await prisma.courseCategory.update({
    where: { id },
    data: {
      name: name || existingCategory.name,
    },
  });

  return res.status(200).json({
    success: true,
    message: `Category updated successfully`,
    data: updatedCategory,
  });
});

export const deleteCategory = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.categoryId;

    const existingCategory = await prisma.courseCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return next(new ErrorHandler(`Category with ID ${id} not found`, 404));
    }

    // Delete the question
    await prisma.courseCategory.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: `Category with ID ${id} deleted successfully`,
    });
  }
);
