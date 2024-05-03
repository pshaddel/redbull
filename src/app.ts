import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "../config";
import { userRouter } from "./modules/user/user.route";
import "@total-typescript/ts-reset";
import dotenv from "dotenv";
import { connect } from "./connections/db";

dotenv.config({ path: "../.env" });

const app = express();

connect();
app.use(cors());
app.use(helmet());
app.use(express.json());

if (process.env.NODE_ENV === "dev")
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, AUTHORIZATION"
    );
    next();
  });

app.get("/ping", (_req: Request, res: Response) => {
  res.send("pong");
});

app.use("/api/v1/users", userRouter);

app.use((_, res) => {
  res.status(404).send("Not found");
});

if (!config.isTestEnvironment) {
  app.listen(config.port);
  console.info("App is listening on port:", config.port);
}

export { app };
