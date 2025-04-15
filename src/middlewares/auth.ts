import ErrorHandler from "../utils/utility-class";
import { TryCatch } from "./error";
import { prisma } from "../prisma/index";
import { Role } from "../types/enum";

export const adminOnly = TryCatch(async (req, res, next) => {
  const id = req.user?.userId;

  if (!id) return next(new ErrorHandler("please log in first", 401));

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  if (!user) return next(new ErrorHandler("This is not valid id", 401));

  if (user.role !== Role.ADMIN)
    return next(new ErrorHandler("Only Admin Can Access this Route", 403));

  next();
});
