import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error";
import { createSectionRequestBody } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { prisma } from "../prisma/index";

export const createSection = TryCatch(
  async (
    req: Request<{}, {}, createSectionRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const courseId = req.query.courseId?.toString();
    const { title, duration, durationType } = req.body;

    if (!title || !duration || !durationType) {
      return next(new ErrorHandler("Please add all fields", 400));
    }

    if (!courseId) {
      return next(new ErrorHandler("Please provide course id", 400));
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return next(new ErrorHandler("Course not found", 400));
    }

    const newSection = await prisma.section.create({
      data: {
        title,
        durationTime: `${duration} ${durationType}`,
        courseId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Successfully created Section",
      data: newSection,
    });
  }
);

export const updateSection = TryCatch(async (req, res, next) => {
  const id = req.params.sectionId.toString();
  const { title, duration, durationType } = req.body;
  const existingSection = await prisma.section.findUnique({
    where: { id: id },
  });

  if (!existingSection) {
    return next(new ErrorHandler(`Section with ID ${id} not found`, 404));
  }

  // Update the section
  const updatedSection = await prisma.section.update({
    where: { id: id },
    data: {
      title: title || existingSection.title,
      durationTime:
        duration && durationType
          ? `${duration} ${durationType}`
          : existingSection.durationTime,
    },
  });

  return res.status(200).json({
    success: true,
    message: `Section updated successfully`,
    data: updatedSection,
  });
});

export const deleteSection = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.sectionId.toString();

    const existingSection = await prisma.section.findUnique({
      where: { id: id },
    });

    if (!existingSection) {
      return next(new ErrorHandler(`Section with ID ${id} not found`, 404));
    }

    // Delete the section
    await prisma.section.delete({
      where: { id: id },
    });

    return res.status(200).json({
      success: true,
      message: `Section with ID ${id} deleted successfully`,
    });
  }
);
