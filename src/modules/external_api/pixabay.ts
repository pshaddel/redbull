import {
  Content,
  SearchEngine,
  contentValidator
} from "../content/content.service";
import axios from "axios";
import { StandardError } from "../error_handler/error.service";
import { logger } from "../log/logger";
import { config } from "../../../config";

const imageURL = "https://pixabay.com/api/";
const videoURL = "https://pixabay.com/api/videos/";
const pageSize = "10";

const getImage: SearchEngine = async ({ query, page = 1 }) => {
  try {
    const response = await axios.get<PixbayImageResponse>(imageURL, {
      params: {
        key: config.pixabay.key,
        q: query,
        image_type: "photo",
        page: page.toString(),
        per_page: pageSize
      },
      timeout: 1000
    });
    const data = response.data;

    const total = data.totalHits;
    const contents: Content[] = [];
    data.hits.forEach((content) => {
      const newContent = {
        id: content.id.toString(),
        src: content.webformatURL,
        width: content.webformatWidth,
        height: content.webformatHeight,
        thumbnail: content.previewURL,
        thumbnailWidth: content.previewWidth,
        thumbnailHeight: content.previewHeight,
        type: "image" as const
      };
      if (contentValidator.safeParse(content)) {
        contents.push(newContent);
      } else {
        // write to logger
      }
    });
    return { contents, total, error: null };
  } catch (error: unknown) {
    // rate limit error
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        return {
          contents: [],
          total: 0,
          error: new StandardError("TOO_MANY_REQUESTS")
        };
      } else {
        logger.error(error);
        return {
          contents: [],
          total: 0,
          error: new StandardError("INTERNAL_SERVER_ERROR")
        };
      }
    } else {
      logger.error(error);
      return {
        contents: [],
        total: 0,
        error: new StandardError("INTERNAL_SERVER_ERROR")
      };
    }
  }
};

const getVideo: SearchEngine = async ({ query, page = 1 }) => {
  try {
    const response = await axios.get<PixbayVideoResponse>(videoURL, {
      params: {
        key: config.pixabay.key,
        q: query,
        page: page.toString(),
        per_page: pageSize
      },
      timeout: 1000
    });
    const data = response.data;
    const total = data.totalHits;
    const contents: Content[] = [];
    data.hits.forEach((content) => {
      const newContent = {
        id: content.id.toString(),
        src: content.videos.medium.url,
        width: content.videos.medium.width,
        height: content.videos.medium.height,
        thumbnail: content.videos.tiny.thumbnail,
        thumbnailWidth: content.videos.tiny.width,
        thumbnailHeight: content.videos.tiny.height,
        type: "image" as const
      };
      if (contentValidator.safeParse(content)) {
        contents.push(newContent);
      } else {
        // write to logger
        logger.error("Invalid content: " + JSON.stringify(content));
      }
    });
    return { contents, total, error: null };
  } catch (error: unknown) {
    // rate limit error
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        return {
          contents: [],
          total: 0,
          error: new StandardError("TOO_MANY_REQUESTS")
        };
      } else {
        return {
          contents: [],
          total: 0,
          error: new StandardError("INTERNAL_SERVER_ERROR")
        };
      }
    } else {
      return {
        contents: [],
        total: 0,
        error: new StandardError("INTERNAL_SERVER_ERROR")
      };
    }
  }
};

type PixbayImageResponse = {
  total: string;
  totalHits: number;
  hits: {
    id: number;
    pageURL: string;
    type: string; // "photo",
    tags: string; // "puppy, pet, canine",
    previewURL: string; // "https://cdn.pixabay.com/photo/2017/09/25/13/12/puppy-2785074_150.jpg",
    previewWidth: number; //150,
    previewHeight: number; //99,
    webformatURL: string; //"https://pixabay.com/get/g0d15a0e64af58b348383c0b70d9ee3d8b69c204b2e68707fb0f2a3faa45236a3555d9414b1c5e736f390aac856d5669458d4a98f7b012703f50d93b6d14039bc_640.jpg",
    webformatWidth: number; //640,
    webformatHeight: number; //426,
    largeImageURL: string;
    imageWidth: number; // 3943,
    imageHeight: number; // 2628,
    imageSize: number; // 2235576,
    views: number;
    downloads: number;
    collections: number;
    likes: number;
    comments: number;
    user_id: number;
    user: string;
    userImageURL: string;
  }[];
};

type VideoDetails = {
  url: string;
  width: number;
  height: number;
  size: number;
  thumbnail: string;
};

type Video = {
  large: VideoDetails;
  medium: VideoDetails;
  small: VideoDetails;
  tiny: VideoDetails;
};

type Hit = {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  videos: Video;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
};

type PixbayVideoResponse = {
  total: number;
  totalHits: number;
  hits: Hit[];
};

export const pixabay = {
  getImage,
  getVideo
};
