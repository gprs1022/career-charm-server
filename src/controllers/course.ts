import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error";
import { createCourseRequestBody } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { prisma } from "../prisma/index";
import { getObjectUrl } from "../utils/helper";
import { uploadToFirebase } from "../utils/firebase-upload";

export const createCourse = TryCatch(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const categoryId = req.query.categoryId?.toString();
    const { title, description, price, duration, durationType } = req.body;
    const thumbnail = req.file;
    if (
      !title ||
      !description ||
      price === undefined ||
      !thumbnail ||
      !duration ||
      !durationType
    )
      return next(new ErrorHandler("Please add all fields", 400));
    if (!categoryId) {
      return next(new ErrorHandler("Please provide category id", 400));
    }

    // Upload thumbnail to Firebase Storage
    const { url, key } = await uploadToFirebase(thumbnail, 'courses');

    const Category = await prisma.courseCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!Category) {
      return next(new ErrorHandler("category not found", 400));
    }
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail: url,
        thumbnailKey: key,
        price: parseInt(price),
        durationTime: `${duration} ${durationType}`,
        categoryId,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Successfully created Course",
      data: newCourse,
    });
  }
);

export const courseById = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.courseId;

    // Fetch the course by ID
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            subsections: true,
          },
        },
      },
    });

    // If the course doesn't exist, return an error
    if (!course) {
      return next(new ErrorHandler(`Course with ID ${id} not found`, 404));
    }

    // For Firebase Storage URLs, we don't need to generate signed URLs
    // as they are already public URLs when using makePublic()

    // Process subsection videos if needed
    await Promise.all(
      course.sections.map(async (section: any) => {
        await Promise.all(
          section.subsections.map(async (subsection: any) => {
            // If you need to do any processing for subsection videos
            // Add it here
          })
        );
      })
    );

    // Return the course details
    return res.status(200).json({
      success: true,
      data: course,
    });
  }
);

export const getAllCourse = TryCatch(async (req, res, next) => {
  const allCourse = await prisma.course.findMany({
    include: {
      sections: {
        include: {
          subsections: true,
        },
      },
    },
  });
  
  // For Firebase Storage, we don't need to generate signed URLs
  // as they are already public URLs when using makePublic()

  return res.status(200).json({
    data: allCourse,
  });
});

export const updateCourse = TryCatch(async (req, res, next) => {
  const id = req.params.courseId;
  const {
    title,
    description,
    price,
    duration,
    categoryId,
    durationType,
  } = req.body;
  const thumbnail = req.file;

  if (categoryId) {
    const Category = await prisma.courseCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!Category) {
      return next(new ErrorHandler("category not found", 400));
    }
  }

  // Find the existing course
  const existingCourse = await prisma.course.findUnique({
    where: { id },
  });

  if (!existingCourse) {
    return next(new ErrorHandler(`Course with ID ${id} not found`, 404));
  }

  // Upload new thumbnail if provided
  let thumbnailUrl = existingCourse.thumbnail;
  let thumbnailKey = existingCourse.thumbnailKey;

  if (thumbnail) {
    // Upload thumbnail to Firebase Storage
    const uploadResult = await uploadToFirebase(thumbnail, 'courses');
    thumbnailUrl = uploadResult.url;
    thumbnailKey = uploadResult.key;
  }

  // Update the course
  const updatedCourse = await prisma.course.update({
    where: { id },
    data: {
      title: title || existingCourse.title,
      description: description || existingCourse.description,
      thumbnail: thumbnailUrl,
      thumbnailKey: thumbnailKey,
      price: price ? parseInt(price) : existingCourse.price,
      durationTime:
        duration && durationType
          ? `${duration} ${durationType}`
          : existingCourse.durationTime,
      categoryId: categoryId || existingCourse.categoryId,
    },
  });

  return res.status(200).json({
    success: true,
    message: `Course updated successfully`,
    data: updatedCourse,
  });
});

export const deleteCourse = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.courseId;

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return next(new ErrorHandler(`Course with ID ${id} not found`, 404));
    }

    // Delete the question
    await prisma.course.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: `Course with ID ${id} deleted successfully`,
    });
  }
);
