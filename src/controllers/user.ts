import { NextFunction, Request, Response } from "express";
import {
  NewUserRequestBody,
  logInRequestBody,
  updatePasswordRequestBody,
} from "../types/types";
import { TryCatch } from "../middlewares/error";
import ErrorHandler from "../utils/utility-class";
import bcrypt from "bcrypt";
import { prisma } from "../prisma/index";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Role } from "../types/enum";
import { sendMail } from "../utils/Nodemailer";
dotenv.config();

const saltRounds = 10;

export const newRegistration = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      fullName,
      userName,
      countryCode,
      phoneNo,
      email,
      dob,
      gender,
      password,
    } = req.body;

    if (
      fullName === undefined ||
      userName === undefined ||
      countryCode === undefined ||
      phoneNo === undefined ||
      email === undefined ||
      dob === undefined ||
      gender === undefined ||
      password === undefined
    ) {
      return next(new ErrorHandler(`All fields are required`, 400));
    }
    // Check if the userName already exists
    let userData = await prisma.user.findUnique({
      where: {
        userName: userName,
      },
    });
    if (userData) {
      return next(
        new ErrorHandler(
          `User already registered with this username: ${userName}`,
          409
        )
      );
    }
    // Check if the email already exists
    const userExistWithEmail = await prisma.user.findUnique({
      where: { email },
    });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (userExistWithEmail) {
      if (userExistWithEmail.isEmailVerified) {
        return next(
          new ErrorHandler(
            `User already registered with this email: ${email}`,
            409
          )
        );
      }
      else {
        await prisma.user.update({
          where: { email },
          data: { fullName: fullName, userName: userName, countryCode: countryCode, phoneNo: phoneNo, isPhoneNoVerified: false, email: email, isEmailVerified: false, dob: new Date(dob), gender: gender, password: hashedPassword, verificationCode: verifyCode },
        });
        const EmailResponse = await sendMail({ verifyCode, fullName, email });
        return res.status(200).json({
          success: true,
          message: `Welcome Back, ${userExistWithEmail.fullName}`,
        });
      }
    }

    // Check if the phoneNo already exists
    userData = await prisma.user.findUnique({
      where: { phoneNo },
    });
    if (userData) {
      return next(
        new ErrorHandler(
          `User already registered with this phone number: ${phoneNo}`,
          409
        )
      );
    }

    if (
      !fullName ||
      !userName ||
      !countryCode ||
      !phoneNo ||
      !email ||
      !dob ||
      gender === undefined ||
      !password
    )
      return next(new ErrorHandler("Please add all fields", 400));

    const newUser = await prisma.user.create({
      data: {
        fullName: fullName,
        userName: userName,
        countryCode: countryCode,
        phoneNo: phoneNo,
        isPhoneNoVerified: false,
        email: email,
        isEmailVerified: false,
        dob: new Date(dob),
        gender: gender,
        password: hashedPassword,
        verificationCode: verifyCode,
      },
    });
    const EmailResponse = await sendMail({ verifyCode, fullName, email });
    return res.status(201).json({
      success: true,
      message: `Welcome, ${newUser.fullName}`,
    });
  }
);

export const logIn = TryCatch(
  async (
    req: Request<{}, {}, logInRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;
    console.log('email:', email);
    console.log('password:', password);
    let userData = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!userData) {
      return next(
        new ErrorHandler(`No user registered with this email: ${email}`, 409)
      );
    }
    const isPasswordValid = await bcrypt.compare(password, userData?.password!);

    if (!isPasswordValid) {
      return next(new ErrorHandler("Invalid password", 401));
    }
    const expiryTime = new Date();
    expiryTime.setMonth(expiryTime.getMonth() + 1);
    const exp = Math.floor(expiryTime.getTime() / 1000);
    const token = jwt.sign(
      {
        userId: userData.id,
        email: userData.email,
        userName: userData.userName,
        phoneNo: userData.phoneNo,
        exp,
      },
      process.env.JWT_SECRET || ""
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${userData.fullName}`,
      token,
    });
  }
);

export const getAllUsers = TryCatch(async (req, res, next) => {
  const allUser = await prisma.user.findMany();
  return res.status(200).json({
    success: true,
    allUser,
  });
});

export const getUser = TryCatch(async (req, res, next) => {
  const id = parseInt(req.params.id as string);
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) return next(new ErrorHandler("Invalid Id", 400));

  return res.status(200).json({
    success: true,
    user,
  });
});

export const deleteUser = TryCatch(async (req, res, next) => {
  const id = parseInt(req.params.id as string);
  const user = await prisma.user.delete({
    where: {
      id,
    },
  });
  if (!user) return next(new ErrorHandler("Invalid Id", 400));

  return res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});

export const adminLogIn = TryCatch(
  async (
    req: Request<{}, {}, logInRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;
    let adminData = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!adminData) {
      return next(
        new ErrorHandler(`No user registered with this email: ${email}`, 409)
      );
    }
    if (adminData.role !== Role.ADMIN) {
      return next(new ErrorHandler(`this is not admin email: ${email}`, 409));
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      adminData?.password!
    );

    if (!isPasswordValid) {
      return next(new ErrorHandler("Invalid password", 401));
    }
    const expiryTime = new Date();
    expiryTime.setMonth(expiryTime.getMonth() + 1);
    const exp = Math.floor(expiryTime.getTime() / 1000);
    const token = jwt.sign(
      {
        userId: adminData.id,
        email: adminData.email,
        userName: adminData.userName,
        phoneNo: adminData.phoneNo,
        exp,
      },
      process.env.JWT_SECRET || ""
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${adminData.fullName}`,
      token,
    });
  }
);

export const updatePassword = TryCatch(
  async (
    req: Request<{}, {}, updatePasswordRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { oldPassword, newPassword } = req.body;
    const email = req.user?.email;
    let userData = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!userData) {
      return next(
        new ErrorHandler(`No user registered with this email: ${email}`, 409)
      );
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      userData?.password!
    );

    if (!isPasswordValid) {
      return next(new ErrorHandler("Invalid old password", 401));
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: hashedPassword,
      },
    });
    return res.status(200).json({
      success: true,
      message: `password updated successfully, ${userData.fullName}`,
    });
  }
);

export const verifyEmail = TryCatch(async (req, res, next) => {
  const { verifyCode, userName } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      userName: userName,
      verificationCode: verifyCode,
    },
  });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid verification code",
    });
  }
  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: "Email already verified",
    });
  }

  await prisma.user.update({
    where: { userName: userName },
    data: { isEmailVerified: true },
  });
  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});
