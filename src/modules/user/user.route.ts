import express, { Request, Response } from "express";
import { userLoginValidator, userRegistrationValidator } from "./user.model";
import {
  authenticateUser,
  findUserByUsername,
  registerUser
} from "./user.service";
import { StandardError, ZodErrorHandler } from "../error_handler/error.service";
import {
  authenticate,
  bruteForce,
  createJWTToken,
  createRefreshToken,
  verifyJWTToken
} from "../authentication/authentication.service";
import { sendData, sendError } from "../../helpers/response_handler";
import { logger } from "../log/logger";

const userRouter = express.Router();

/** we have to limit this to prevent attacker from trying to create a user list */
userRouter.post(
  "/register",
  bruteForce,
  async (req: Request, res: Response) => {
    const result = await userRegistrationValidator.safeParseAsync(req.body);

    if (!result.success) {
      const error = ZodErrorHandler(result.error);
      return sendError(res, new StandardError("BAD_REQUEST", error.toString()));
    }

    const user = result.data;
    const { error } = await registerUser({
      username: user.username,
      password: user.password
    });

    if (error) {
      console.log(error.error, error.extraInformation);
      return sendError(res, error);
    } else {
      return sendData(res, null);
    }
  }
);

userRouter.post("/login", bruteForce, async (req: Request, res: Response) => {
  const result = userLoginValidator.safeParse(req.body);

  if (!result.success) {
    const error = ZodErrorHandler(result.error);
    return sendError(res, new StandardError("BAD_REQUEST", error));
  }

  const { error, user } = await authenticateUser(
    result.data.username,
    result.data.password
  );

  if (error) {
    return sendError(res, error);
  }

  if (!user) {
    logger.error("Not Error but User not found: " + result.data.username);
    return sendError(res, new StandardError("INTERNAL_SERVER_ERROR"));
  }

  const access_token = await createJWTToken({ username: user.username });
  const refresh_token = await createRefreshToken({ username: user.username });

  if (!access_token || !refresh_token) {
    return sendError(res, new StandardError("INTERNAL_SERVER_ERROR"));
  }

  res.cookie("access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    path: "/api/v1/users/refresh", // only send refresh token to this endpoint
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  sendData(res, { access_token, refresh_token, user });
});

userRouter.post("/refresh", async (req: Request, res: Response) => {
  const refresh_token = req.cookies.refresh_token;
  if (!refresh_token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  /** check if refresh token is valid */
  const isValid = await verifyJWTToken(refresh_token);
  if (!isValid) {
    return sendError(res, new StandardError("UNAUTHORIZED"));
  }

  /**  check token type */
  if (isValid.type !== "refresh_token") {
    return sendError(res, new StandardError("UNAUTHORIZED"));
  }
  // remove current refresh token and access token
  console.log("deleted");

  /**  get user from refresh token */
  const username = isValid.username;
  const user = await findUserByUsername(username);

  if (!user) {
    return sendError(res, new StandardError("UNAUTHORIZED"));
  }

  const access_token = await createJWTToken({ username: user.username });
  const new_refresh_token = await createRefreshToken({
    username: user.username
  });

  if (!access_token || !new_refresh_token) {
    return sendError(res, new StandardError("INTERNAL_SERVER_ERROR"));
  }

  res.cookie("access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.cookie("refresh_token", new_refresh_token, {
    httpOnly: true,
    path: "/api/v1/users/refresh", // only send refresh token to this endpoint
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  return sendData(res, {
    access_token,
    refresh_token: new_refresh_token,
    user
  });
});

userRouter.get("/me", authenticate, async (req: Request, res: Response) => {
  return sendData(res, { user: req.user });
});

export { userRouter };
