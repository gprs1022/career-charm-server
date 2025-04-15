import { NextFunction, Request, Response } from "express";

export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export interface JwtPayload {
  userId: number;
  email: string;
  userName: string;
  phoneNo: string;
  exp: number;
  role: number;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

export interface NewUserRequestBody {
  fullName: string;
  userName: string;
  countryCode: string;
  phoneNo: string;
  isPhoneNoVerified: boolean;
  email: string;
  isEmailVerified: boolean;
  dob: Date;
  gender: number;
  password: string;
}

export interface logInRequestBody {
  email: string;
  password: string;
}

export interface NewQuestionRequestBody {
  title: string;
  correctOptionId: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
}

export interface CreateTopicRequestBody {
  name: string;
  topicImage: string;
}

export interface CreateArticleRequestBody {
  title: string;
  content: string;
  topicId: number;
  articleImage: string;
  tag: string;
}

export interface createCategoryRequestBody {
  name: string;
}

export interface createCourseRequestBody {
  title: string;
  description: string;
  thumbnail: string;
  price: string;
  duration: string;
  durationType: string;
}

export interface createSectionRequestBody {
  title: string;
  duration: number;
  durationType: string;
}

export interface createSubSectionRequestBody {
  title: string;
  duration: number;
  durationType: string;
}

export interface createQuizRequestBody {
  title: string;
  correctOptionId: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  duration: number;
  topicId: number;
}

export interface updatePasswordRequestBody {
  oldPassword: string;
  newPassword: string;
}
