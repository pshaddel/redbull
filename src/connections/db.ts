import mongoose from "mongoose";

export async function connect() {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === "dev") console.log("Connecting to database");
    mongoose.connect(
      (process.env as { DATABASE_URL: string }).DATABASE_URL,
      {}
    );
    mongoose.connection.on("error", (err) => {
      console.error("Database connection error");
      reject(err);
    });
    mongoose.connection.on("disconnected", () => {
      console.error("Database disconnected");
    });
    mongoose.connection.once("open", () => {
      if (process.env.NODE_ENV === "dev") console.log("Database connected");
      // return the connection
      resolve(mongoose.connection);
    });
  });
}
