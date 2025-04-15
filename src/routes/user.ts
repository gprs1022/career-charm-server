import express from "express";
import {
  getAllUsers,
  getUser,
  newRegistration,
  deleteUser,
  logIn,
  adminLogIn,
  updatePassword,
  verifyEmail,
} from "../controllers/user";
import { adminOnly } from "../middlewares/auth";
const userRouter = express.Router();
userRouter.get("/get-all-user", adminOnly, getAllUsers);
userRouter.get("/get-user/:id", adminOnly, getUser);
userRouter.delete("/delete/:id", adminOnly, deleteUser);
userRouter.post("/register", newRegistration);
userRouter.post("/login", logIn);
userRouter.post("/admin-login", adminLogIn);
userRouter.put("/update-password", updatePassword);
userRouter.post("/verify-email", verifyEmail);
export { userRouter };
