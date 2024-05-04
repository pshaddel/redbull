import express from "express";
import { z } from "zod";
import { searchContent } from "./content.service";
import { pixabay } from "../external_api/pixabay";

export const contentRouter = express.Router();

const contentSearchValidator = z.object({
  query: z.string(),
  page: z.string().optional().default("1")
});

contentRouter.get("/image", async (req, res) => {
  const result = contentSearchValidator.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: "BAD_REQUEST" });
  }

  const searchResults = await searchContent(pixabay.getImage, {
    query: result.data.query,
    page: parseInt(result.data.page),
    pageSize: 10,
    contentType: "image"
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

contentRouter.get("/video", async (req, res) => {
  const result = contentSearchValidator.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: "BAD_REQUEST" });
  }

  const searchResults = await searchContent(pixabay.getVideo, {
    query: result.data.query,
    page: parseInt(result.data.page),
    pageSize: 10,
    contentType: "video"
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
