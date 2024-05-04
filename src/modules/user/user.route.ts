import express, { Request, Response } from "express";
import { userLoginValidator, userRegistrationValidator } from "./user.model";
import { authenticateUser, registerUser } from "./user.service";
import { ZodErrorHandler } from "../error_handler/error.service";
import {
  createJWTToken,
  createRefreshToken
} from "../authentication/authentication.service";

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

userRouter.post("/login", async (req: Request, res: Response) => {
  const result = userLoginValidator.safeParse(req.body);

  if (!result.success) {
    const error = ZodErrorHandler(result.error);
    return res.status(400).json(error);
  }

  const { error, user } = await authenticateUser(
    result.data.username,
    result.data.password
  );
  if (error) {
    return res.status(401).json({ error }); // put this in error handler
  }
  if (!user) {
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
  const access_token = await createJWTToken({ username: user.username });
  const refresh_token = await createRefreshToken({ username: user.username });
  // standard jwt response
  res.status(200).json({ access_token, refresh_token, user });
});

export { userRouter };
