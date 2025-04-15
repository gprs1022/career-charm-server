import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error";
import { CreateArticleRequestBody } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { prisma } from "../prisma/index";
import { uploadToFirebase } from "../utils/firebase-upload";

export const newArticle = TryCatch(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("req.body", req.body);
      const { title, content, topicId, tag } = req.body;
      const articleImage = req.file;

      if (!title || !content || !topicId || !tag)
        return next(new ErrorHandler("Please add all fields", 400));

      if (!articleImage)
        return next(new ErrorHandler("Please upload an image", 400));

      const numericTopicId = parseInt(topicId);
      if (isNaN(numericTopicId) || numericTopicId <= 0)
        return next(new ErrorHandler("Invalid topicId provided", 400));

      const topic = await prisma.topic.findUnique({
        where: {
          id: numericTopicId,
        },
      });

      if (!topic) {
        return next(new ErrorHandler("topic doesn't exist in db", 404));
      }

      // Upload image to Firebase Storage
      const { url, key } = await uploadToFirebase(articleImage, 'articles') as { url: string; key: string };

      const newArticle = await prisma.article.create({
        data: {
          title,
          content,
          topicId: numericTopicId,
          imageUrl: url,
          key,
          tag,
        },
      });

      return res.status(201).json({
        message: "Successfully created Article",
        data: newArticle,
      });
    } catch (error) {
      console.log("error in new article", error);
      return next(new ErrorHandler("Failed to create article", 500));
    }
  }
);

export const getAllArticle = TryCatch(async (req, res, next) => {
  const topicId = parseInt(req.params.topicId);

  const allArticles = await prisma.article.findMany({
    where: {
      topicId,
    },
    include: {
      likes: true,
      comments: true,
    },
  });

  // Map over the articles to include totalLikes and totalComments
  // Firebase URLs are already public, so we don't need to generate signed URLs
  const articlesWithDetails = allArticles.map((article: any) => {
    return {
      ...article,
      totalLikes: article.likes.length,
      totalComments: article.comments.length,
      // imageUrl is already stored in the database from Firebase upload
    };
  });

  return res.status(200).json({
    success: true,
    articles: articlesWithDetails,
  });
});

export const getArticle = TryCatch(async (req, res, next) => {
  const articleId = parseInt(req.params.articleId);
  const Article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
    include: {
      likes: true,
      comments: true,
    },
  });

  // Firebase URLs are already public, so we don't need to generate a signed URL
  // The imageUrl field already contains the Firebase public URL

  return res.status(200).json({
    totalLike: Article?.likes.length,
    totalComment: Article?.comments.length,
    Article,
  });
});

export const updateArticle = TryCatch(async (req, res, next) => {
  const articleId = parseInt(req.params.articleId);

  // Check if article exists
  const existingArticle = await prisma.article.findUnique({
    where: {
      id: articleId
    }
  });

  if (!existingArticle) {
    return next(new ErrorHandler(`Article with ID ${articleId} not found`, 404));
  }

  // Extract fields to update
  const { title, content, topicId, tag } = req.body;
  const articleImage = req.file;

  // Build update data
  const updateData: any = {};

  if (title) updateData.title = title;
  if (content) updateData.content = content;
  if (tag) updateData.tag = tag;

  if (topicId) {
    const numericTopicId = parseInt(topicId);
    if (isNaN(numericTopicId) || numericTopicId <= 0) {
      return next(new ErrorHandler("Invalid topicId provided", 400));
    }

    // Check if topic exists
    const topic = await prisma.topic.findUnique({
      where: {
        id: numericTopicId,
      },
    });

    if (!topic) {
      return next(new ErrorHandler("Topic doesn't exist in db", 404));
    }

    updateData.topicId = numericTopicId;
  }

  // Handle image upload if provided
  if (articleImage) {
    // Upload new image to Firebase Storage
    const { url, key } = await uploadToFirebase(articleImage, 'articles') as { url: string; key: string };
    updateData.imageUrl = url;
    updateData.key = key;
  }

  // Update article in database
  const updatedArticle = await prisma.article.update({
    where: {
      id: articleId
    },
    data: updateData
  });

  return res.status(200).json({
    success: true,
    message: "Article updated successfully",
    data: updatedArticle
  });
});

export const deleteArticle = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const articleIdInt = parseInt(req.params.articleId);

    const existingArticle = await prisma.article.findUnique({
      where: { id: articleIdInt },
    });

    if (!existingArticle) {
      return next(new ErrorHandler(`Article with ID ${articleIdInt} not found`, 404));
    }

    // Delete the question
    await prisma.article.delete({
      where: { id: articleIdInt },
    });

    return res.status(200).json({
      success: true,
      message: `article with ID ${articleIdInt} deleted successfully`,
    });
  }
);
