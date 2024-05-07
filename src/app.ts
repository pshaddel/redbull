import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "../config";
import { userRouter } from "./modules/user/user.route";
import { connect } from "./connections/db";
import cookieParser from "cookie-parser";
import { contentRouter } from "./modules/content/content.route";
import {
  authenticate,
  ddos
} from "./modules/authentication/authentication.service";
import { getRedisClient } from "./connections/redis";
import fs from "fs";
import { logger } from "./modules/log/logger";
import { sendError } from "./helpers/response_handler";
import { StandardError } from "./modules/error_handler/error.service";

const app = express();

connect();
getRedisClient();

if (!config.jwt.privateKey && !config.isTestEnvironment) {
  // read it from file
  fs.existsSync("private.key");
  fs.existsSync("public.key");
  const privateKey = fs.readFileSync("private.key", "utf8");
  const publicKey = fs.readFileSync("public.key", "utf8");
  config.jwt.privateKey = privateKey;
  config.jwt.publicKey = publicKey;
}

app.use(ddos); // general rate limiter to prevent DDOS
app.use(
  cors({
    credentials: true
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/ping", (_req: Request, res: Response) => {
  res.send("pong");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/contents", authenticate, contentRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  sendError(res, new StandardError("INTERNAL_SERVER_ERROR"));
});

app.use((_, res) => {
  sendError(res, new StandardError("NOT_FOUND"));
});

if (!config.isTestEnvironment) {
  app.listen(config.port);
  logger.info("App is listening on port: " + config.port);
}

export { app };
