import { TryCatch } from "../middlewares/error";
import { prisma } from "../prisma/index";
import ErrorHandler from "../utils/utility-class";

export const toggleLikeArticle = TryCatch(async (req, res, next) => {
  const articleId = parseInt(req.params.articleId);
  const userId = req.user?.userId;

  if (!userId) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!article) {
    return next(new ErrorHandler("Article not found", 404));
  }

  const existingLike = await prisma.like.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { userId_articleId: { userId, articleId } },
    });

    return res.status(200).json({
      success: true,
      message: "Article disliked",
    });
  } else {
    const like = await prisma.like.create({
      data: {
        userId,
        articleId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Article liked",
      data: like,
    });
  }
});

export const createComment = TryCatch(async (req, res, next) => {
  const { articleId, content } = req.body;
  const userId = req.user?.userId;
  const article = await prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!article || !content || !userId) {
    return next(new ErrorHandler("all field are required", 404));
  }

  // Create a new comment
  const comment = await prisma.comment.create({
    data: {
      userId,
      articleId,
      content,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Comment created",
    data: comment,
  });
});

export const updateComment = TryCatch(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return next(new ErrorHandler("User not authenticated", 401));
  }
  // Check if the comment exists
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId) },
  });

  if (!comment) {
    return next(new ErrorHandler("Comment not found", 404));
  }

  if (comment.userId !== userId) {
    return next(
      new ErrorHandler("You do not have permission to update this comment", 403)
    );
  }

  // Update the comment
  const updatedComment = await prisma.comment.update({
    where: { id: parseInt(commentId) },
    data: { content },
  });

  return res.status(200).json({
    success: true,
    message: "Comment updated",
    data: updatedComment,
  });
});

export const deleteComment = TryCatch(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  // Check if the comment exists
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId) },
  });

  if (!comment) {
    return next(new ErrorHandler("Comment not found", 404));
  }

  // Check if the authenticated user is the owner of the comment
  if (comment.userId !== userId) {
    return next(
      new ErrorHandler("You do not have permission to delete this comment", 403)
    );
  }

  // Delete the comment
  await prisma.comment.delete({
    where: { id: parseInt(commentId) },
  });

  return res.status(200).json({
    success: true,
    message: "Comment deleted",
  });
});

export const getAllCommentsByUser = TryCatch(async (req, res, next) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    return next(new ErrorHandler("Invalid user ID", 400));
  }

  const comments = await prisma.comment.findMany({
    where: { userId },
  });

  if (!comments || comments.length === 0) {
    return next(new ErrorHandler("No comments found for this user", 404));
  }

  return res.status(200).json({
    success: true,
    data: comments,
  });
});
