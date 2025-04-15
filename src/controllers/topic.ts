import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error";
import { CreateTopicRequestBody } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { prisma } from "../prisma/index";
import { uploadToFirebase } from "../utils/firebase-upload";

export const newTopic = TryCatch(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { name } = req.body;
    const topicImage = req.file;
    if (!name || !topicImage)
      return next(new ErrorHandler("Please add all fields", 400));

    // Upload image to Firebase Storage
    const { url, key } = await uploadToFirebase(topicImage, 'topics');

    const topic = await prisma.topic.findUnique({
      where: {
        name,
      },
    });

    if (topic) {
      return next(new ErrorHandler("topic already exist in db", 409));
    }
    const newTopic = await prisma.topic.create({
      data: {
        name: name,
        topicImage: url,
        imageKey: key,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Successfully created topic",
      data: newTopic,
    });
  }
);

export const getAllTopic = TryCatch(async (req, res, next) => {
  const allTopics = await prisma.topic.findMany();

  // No need to fetch URLs for Firebase Storage as they are already public URLs
  // Just return the topics as they are
  return res.status(200).json({
    topics: allTopics,
  });
});

export const updateTopic = TryCatch(async (req, res, next) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  const topicImage = req.file;

  // Find the existing topic
  const existingTopic = await prisma.topic.findUnique({
    where: { id },
  });

  if (!existingTopic) {
    return next(new ErrorHandler(`Topic with ID ${id} not found`, 404));
  }

  let updatedImageUrl = existingTopic.topicImage;
  let updatedImageKey = existingTopic.imageKey;

  // If a new image is provided, upload it to Firebase Storage
  if (topicImage) {
    const { url, key } = await uploadToFirebase(topicImage, 'topics');
    updatedImageUrl = url;
    updatedImageKey = key;
  }

  // Update the topic in the database
  const updatedTopic = await prisma.topic.update({
    where: { id },
    data: {
      name: name || existingTopic.name,
      topicImage: updatedImageUrl,
      imageKey: updatedImageKey,
    },
  });

  return res.status(200).json({
    success: true,
    message: `Topic updated successfully`,
    data: updatedTopic,
  });
});

export const deleteTopic = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);

    const existingTopic = await prisma.topic.findUnique({
      where: { id },
    });

    if (!existingTopic) {
      return next(new ErrorHandler(`topic with ID ${id} not found`, 404));
    }

    // Delete the topic
    await prisma.topic.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: `topic with ID ${id} deleted successfully`,
    });
  }
);
