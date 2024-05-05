import express from "express";
import { z } from "zod";
import {
  addContentToFavorite,
  contentValidator,
  getFavoriteContent,
  removeContentFromFavorite,
  searchContent
} from "./content.service";
import { pixabay } from "../external_api/pixabay";
import { StandardError, ZodErrorHandler } from "../error_handler/error.service";
import { memoize } from "../../helpers/memoize";
import { sendData, sendError } from "../../helpers/response_handler";

export const contentRouter = express.Router();

const contentSearchValidator = z.object({
  query: z.string(),
  page: z.string().optional().default("1")
});

contentRouter.get("/image", async (req, res) => {
  const result = contentSearchValidator.safeParse(req.query);
  if (!result.success) {
    const error = ZodErrorHandler(result.error);
    return sendError(res, new StandardError("BAD_REQUEST", error));
  }

  const searchResults = await memoize({
    key: `image_${result.data.query}_${result.data.page}`,
    // 24h
    ttl: 60 * 60 * 24,
    getResult: searchContent.bind(null, pixabay.getImage, {
      query: result.data.query,
      page: parseInt(result.data.page),
      pageSize: 10,
      contentType: "image"
    })
  });
  if (searchResults.error) {
    return sendError(res, new StandardError("INTERNAL_SERVER_ERROR"));
  }
  // handle rate limit error
  return sendData(res, {
    contents: searchResults.contents,
    total: searchResults.total
  });
});

contentRouter.get("/video", async (req, res) => {
  const result = contentSearchValidator.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: "BAD_REQUEST" });
  }

  const searchResults = await memoize({
    key: `video_${result.data.query}_${result.data.page}`,
    // 24h
    ttl: 60 * 60 * 24,
    getResult: searchContent.bind(null, pixabay.getVideo, {
      query: result.data.query,
      page: parseInt(result.data.page),
      pageSize: 10,
      contentType: "video"
    })
  });

  if (searchResults.error) {
    return res.status(500).json({ error: searchResults.error });
  }
  // handle rate limit error

  return res.json({
    contents: searchResults.contents,
    total: searchResults.total
  });
});

contentRouter.post("/favorite", async (req, res) => {
  const username = req.user?.username;
  const result = contentValidator.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "BAD_REQUEST" });
  }
  const { error } = await addContentToFavorite(username as string, result.data);
  if (error) {
    return res.status(500).json({ error });
  }
  return res.json({ success: true });
});

contentRouter.delete("/favorite/:id", async (req, res) => {
  const username = req.user?.username;
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "BAD_REQUEST" });
  }
  const { error } = await removeContentFromFavorite(username as string, id);
  if (error) {
    return res.status(500).json({ error });
  }
  return res.json({ success: true });
});

contentRouter.get("/favorite", async (req, res) => {
  const username = req.user?.username;
  const { error, contents } = await getFavoriteContent(username as string);
  if (error) {
    return res.status(500).json({ error });
  }
  return res.json({ contents });
});
