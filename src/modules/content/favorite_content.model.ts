import { InferSchemaType, Schema, model } from "mongoose";

const favoriteContentSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: true
  },
  contents: {
    type: [
      {
        id: {
          type: String,
          required: true
        },
        src: {
          type: String,
          required: true
        },
        width: {
          type: Number,
          required: true
        },
        height: {
          type: Number,
          required: true
        },
        thumbnail: {
          type: String,
          required: true
        },
        thumbnailWidth: {
          type: Number,
          required: true
        },
        thumbnailHeight: {
          type: Number,
          required: true
        },
        type: {
          type: String,
          required: true,
          enum: ["image"]
        }
      }
    ],
    default: []
  }
});

type FavoriteContent = InferSchemaType<typeof favoriteContentSchema>;

export const FavoriteContentModel = model<FavoriteContent>(
  "FavoriteContent",
  favoriteContentSchema
);
