import argon2 from "argon2";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../log/logger";
import { StandardError } from "../error_handler/error.service";
import { getRedisClient } from "../../connections/redis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { sendError } from "../../helpers/response_handler";
import { config } from "../../../config";

export async function hashPassword(password: string): Promise<{
  error: StandardError | null;
  hash: string | null;
}> {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      salt: Buffer.from(config.hash.salt as string),
      secret: Buffer.from(config.hash.secret as string)
    });
    return { error: null, hash };
  } catch (error) {
    logger.error(error);
    return { error: new StandardError("INTERNAL_SERVER_ERROR"), hash: null };
  }
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    const isValid = await argon2.verify(hash, password, {
      secret: Buffer.from(config.hash.secret as string)
    });
    return isValid;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

export async function createJWTToken(payload: {
  username: string;
}): Promise<string | null> {
  const privateKey = config.jwt.privateKey as string;
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
          logger.error(err);
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
  const publicKey = config.jwt.publicKey as string;
  return new Promise((resolve) =>
    jwt.verify(
      token,
      publicKey,
      {
        algorithms: ["RS256"]
      },
      function (err, decoded) {
        if (err) {
          logger.error(err);
          resolve(null);
        }
        resolve(decoded as T & { type: "access_token" | "refresh_token" });
      }
    )
  );
}

export async function createRefreshToken(payload: { username: string }) {
  const privateKey = config.jwt.privateKey as string;
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

const ddosLimiter = new RateLimiterRedis({
  storeClient: getRedisClient(),
  keyPrefix: "rate_limit_ddos",
  points: 5, // 5 requests
  duration: 1, // per 1 second by IP
  blockDuration: 10 // block for 10 seconds
});

const bruteForceLimiter = new RateLimiterRedis({
  storeClient: getRedisClient(),
  keyPrefix: "rate_limit_brute_force",
  points: 5, // 5 requests
  duration: 60 * 5, // per 5 minutes by IP
  blockDuration: 60 * 15 // block for 15 minutes
});

/**
 * It is a function that returns a middleware function that limits the rate of requests
 * @param limiter
 * @returns
 */
function rateLimiterMiddleware(limiter: RateLimiterRedis) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (config.features.rateLimiter) {
        await limiter.consume(req.ip);
        console.info("ip:", req.ip);
      }
      next();
    } catch (error) {
      sendError(res, new StandardError("TOO_MANY_REQUESTS"));
    }
  };
}

export const ddos = rateLimiterMiddleware(ddosLimiter);
export const bruteForce = rateLimiterMiddleware(bruteForceLimiter);
