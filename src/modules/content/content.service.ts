import { z } from "zod";
import { findUserByUsername } from "../user/user.service";
import { FavoriteContentModel } from "./favorite_content.model";

export async function searchContent(
  engine: SearchEngine,
  { query, contentType, page = 1, pageSize = 10 }: Search
) {
  try {
    const results = await engine({
      query,
      contentType,
      page,
      pageSize
    });
    return results;
  } catch (error) {
    // log error
    console.log(error);
    return { contents: [], total: 0, error: "ERROR" };
  }
}

// Using Adopter pattern, if we want to use oop maybe we can turn this into a interface and the function into a class method
type Search = {
  query: string;
  contentType: "video" | "image";
  /**
   * @default 1
   */
  page: number;
  /**
   * @default 10
   */
  pageSize: number;
};
export type SearchEngine = (searchEngine: Search) => Promise<{
  contents: Content[];
  total: number;
  error: string | null;
}>;

export const contentValidator = z.object({
  id: z.string(),
  src: z.string(),
  width: z.number(),
  height: z.number(),
  thumbnail: z.string(),
  thumbnailWidth: z.number(),
  thumbnailHeight: z.number(),
  type: z.literal("image")
});

export type Content = z.infer<typeof contentValidator>;

export async function addContentToFavorite(username: string, content: Content) {
  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return { error: "USER_NOT_FOUND" };
    }
    // only add to the array if the content  id is not already in the array
    await FavoriteContentModel.updateOne(
      {
        username: username,
        "contents.id": {
          $ne: content.id
        }
      },
      {
        $push: {
          contents: content
        }
      },
      {
        upsert: true
      }
    );
    return { success: true, error: null };
  } catch (error) {
    // log error
    console.log(error);
    return { error: "ERROR", success: false };
  }
}

export async function removeContentFromFavorite(
  username: string,
  contentId: string
) {
  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return { error: "USER_NOT_FOUND" };
    }
    await FavoriteContentModel.updateOne(
      {
        username: username
      },
      {
        $pull: {
          contents: {
            id: contentId
          }
        }
      }
    );
    return { success: true, error: null };
  } catch (error) {
    // log error
    console.log(error);
    return { error: "ERROR", success: false };
  }
}

export async function getFavoriteContent(username: string) {
  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return { error: "USER_NOT_FOUND", contents: [] };
    }
    const favoriteContent = await FavoriteContentModel.findOne({
      username: username
    });
    return { contents: favoriteContent?.contents ?? [], error: null };
  } catch (error) {
    // log error
    console.log(error);
    return { error: "ERROR", contents: [] };
  }
}
