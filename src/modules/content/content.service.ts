import { z } from "zod";

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
