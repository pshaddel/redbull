import express, { Request, Response } from "express";
import { userLoginValidator, userRegistrationValidator } from "./user.model";
import {
  authenticateUser,
  findUserByUsername,
  registerUser
} from "./user.service";
import { ZodErrorHandler } from "../error_handler/error.service";
import {
  authenticate,
  createJWTToken,
  createRefreshToken,
  verifyJWTToken
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

  res.cookie("access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    domain: "/api/v1/users/refresh", // only send refresh token to this endpoint
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.status(200).json({ access_token, refresh_token, user });
});

userRouter.post("/refresh", async (req: Request, res: Response) => {
  const refresh_token = req.cookies.refresh_token;
  if (!refresh_token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // check if refresh token is valid
  const isValid = await verifyJWTToken(refresh_token);
  if (!isValid) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // check token type
  if (isValid.type !== "refresh_token") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // remove current refresh token and access token
  console.log("deleted");
  // get user from refresh token
  const username = isValid.username;
  const user = await findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const access_token = await createJWTToken({ username: user.username });
  const new_refresh_token = await createRefreshToken({
    username: user.username
  });

  res.cookie("access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.cookie("refresh_token", new_refresh_token, {
    httpOnly: true,
    domain: "/api/v1/users/refresh", // only send refresh token to this endpoint
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res
    .status(200)
    .json({ access_token, refresh_token: new_refresh_token, user });
});

userRouter.get("/me", authenticate, async (req: Request, res: Response) => {
  res.status(200).json({ user: req.user });
});

export { userRouter };
