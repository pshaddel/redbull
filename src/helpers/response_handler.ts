import { Response } from "express";
import { StandardError } from "../modules/error_handler/error.service";

export function sendError(res: Response, error: StandardError) {
  res
    .status(error.httpStatusCode)
    .json({ error: error.extraInformation, data: null });
}

export function sendData(res: Response, data: unknown) {
  res.status(200).json(data);
}
