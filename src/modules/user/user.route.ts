import express, { Request, Response } from "express";
import { userRegistrationValidator } from "./user.model";
import { registerUser } from "./user.service";
import { ZodErrorHandler } from "../error_handler/error.service";

const userRouter = express.Router();

userRouter.post("/register", async (req: Request, res: Response) => {
  const result = await userRegistrationValidator.safeParseAsync(req.body);

  if (!result.success) {
    const error = ZodErrorHandler(result.error);
    return res.status(400).json(error);
  }

  const user = result.data;
  const { error } = await registerUser({
    username: user.username,
    password: user.password
  });

  if (error) {
    return res.status(400).json({ error });
  } else {
    res.status(201).json({ message: "User created successfully" });
  }
});

export { userRouter };
