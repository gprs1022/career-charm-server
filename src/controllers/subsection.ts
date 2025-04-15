import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error";
import { createSubSectionRequestBody } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { prisma } from "../prisma/index";
import { uploadToFirebase } from "../utils/firebase-upload";

export const createSubSection = TryCatch(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const sectionId = req.query.sectionId?.toString();
    const { title, duration, durationType } = req.body;
    const video = req.file;

    if (!title || !video || !duration || !durationType) {
      return next(new ErrorHandler("Please add all fields", 400));
    }

    if (!sectionId) {
      return next(new ErrorHandler("Please provide section id", 400));
    }

    const section = await prisma.section.findUnique({
      where: {
        id: sectionId,
      },
    });

    if (!section) {
      return next(new ErrorHandler("Section not found", 400));
    }
    
    // Upload video to Firebase Storage
    const { url, key } = await uploadToFirebase(video, 'videos');

    const newSubSection = await prisma.subSection.create({
      data: {
        title,
        videoUrl: url,
        videoKey: key,
        durationTime: `${duration} ${durationType}`,
        sectionId,
      },
    });

    return res.status(201).json({
      message: "Successfully created SubSection",
      data: newSubSection,
    });
  }
);

export const updateSubSection = TryCatch(async (req, res, next) => {
  const id = req.params.subSectionId;
  const { title, duration, durationType } = req.body;
  const video = req.file;

  // Check if the SubSection exists
  const existingSubSection = await prisma.subSection.findUnique({
    where: { id },
  });

  if (!existingSubSection) {
    return next(new ErrorHandler(`SubSection with ID ${id} not found`, 404));
  }

  // If a new video is uploaded, update with Firebase Storage
  let videoUrl = existingSubSection.videoUrl;
  let videoKey = existingSubSection.videoKey;

  if (video) {
    // Upload video to Firebase Storage
    const { url, key } = await uploadToFirebase(video, 'videos');
    videoUrl = url;
    videoKey = key;
  }

  // Update SubSection
  const updatedSubSection = await prisma.subSection.update({
    where: { id },
    data: {
      title: title || existingSubSection.title,
      videoUrl,
      videoKey,
      durationTime:
        duration && durationType
          ? `${duration} ${durationType}`
          : existingSubSection.durationTime,
    },
  });

  return res.status(200).json({
    success: true,
    message: `SubSection updated successfully`,
    data: updatedSubSection,
  });
});

export const deleteSubSection = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.subSectionId;

    const existingSubSection = await prisma.subSection.findUnique({
      where: { id },
    });

    if (!existingSubSection) {
      return next(new ErrorHandler(`SubSection with ID ${id} not found`, 404));
    }

    // Delete the sub-section
    await prisma.subSection.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: `SubSection with ID ${id} deleted successfully`,
    });
  }
);
