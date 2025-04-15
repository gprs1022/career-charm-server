import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { unless } from "express-unless";
import { JwtPayload } from "../types/types";
import ErrorHandler from "../utils/utility-class";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ErrorHandler("No token provided", 403));
  }

  jwt.verify(token, process.env.JWT_SECRET || "", (err, decoded) => {
    if (err) {
      return next(new ErrorHandler("Failed to authenticate token", 401));
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

authenticateJWT.unless = unless;
