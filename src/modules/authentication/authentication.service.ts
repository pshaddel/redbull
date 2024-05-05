import argon2 from "argon2";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function hashPassword(password: string) {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      salt: Buffer.from(process.env.HASH_SALT as string),
      secret: Buffer.from(process.env.HASH_SECRET as string)
    });
    return { error: null, hash };
  } catch (error) {
    // send to logger
    console.log(error);
    return { error: "INTERNAL_SERVER_ERROR", hash: null };
  }
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    const isValid = await argon2.verify(hash, password, {
      secret: Buffer.from(process.env.HASH_SECRET as string)
    });
    return isValid;
  } catch (error) {
    // send to logger
    console.log(error);
    return false;
  }
}

export async function createJWTToken(payload: {
  username: string;
}): Promise<string | null> {
  const privateKey = process.env.JWT_PRIVATE_KEY as string;
  return new Promise((resolve) =>
    jwt.sign(
      { ...payload, type: "access_token" },
      privateKey,
      {
        expiresIn: "1h",
        algorithm: "RS256"
      },
      function (err, token) {
        if (err) {
          console.error(err);
          resolve(null);
        } else {
          resolve(token ? token : null);
        }
      }
    )
  );
}

export async function verifyJWTToken<T = { username: string }>(
  token: string
): Promise<(T & { type: "access_token" | "refresh_token" }) | null> {
  const publicKey = process.env.JWT_PUBLIC_KEY as string;
  return new Promise((resolve) =>
    jwt.verify(
      token,
      publicKey,
      {
        algorithms: ["RS256"]
      },
      function (err, decoded) {
        if (err) {
          console.error(err);
          resolve(null);
        }
        resolve(decoded as T & { type: "access_token" | "refresh_token" });
      }
    )
  );
}

export async function createRefreshToken(payload: { username: string }) {
  const privateKey = process.env.JWT_PRIVATE_KEY as string;
  return new Promise((resolve) =>
    jwt.sign(
      { ...payload, type: "refresh_token" },
      privateKey,
      {
        expiresIn: "7d",
        algorithm: "RS256"
      },
      function (err, token) {
        if (err) {
          // console.error(err);
          resolve(null);
        }
        resolve(token);
      }
    )
  );
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      username: string;
    }; // Replace 'any' with the actual type of 'user'
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const access_token = req.cookies.access_token;
  if (!access_token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // check if access token is valid
  const isValid = await verifyJWTToken(access_token);
  if (!isValid) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // check token type
  if (isValid.type !== "access_token") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // attach user to request
  req.user = { username: isValid.username };
  next();
}
