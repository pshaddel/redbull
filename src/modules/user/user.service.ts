import { ObjectId } from "mongoose";
import {
  hashPassword,
  verifyPassword
} from "../authentication/authentication.service";
import { User, UserCreationObject, UserModel } from "./user.model";
import { logger } from "../log/logger";
import { StandardError } from "../error_handler/error.service";

export async function findUserByUsername(
  username: string
): Promise<(User & { _id: ObjectId }) | null> {
  return UserModel.findOne({ username }, { password: 0 });
}

export async function registerUser(
  user: UserCreationObject
): Promise<{ error: StandardError | null }> {
  try {
    const existingUser = await findUserByUsername(user.username);
    if (existingUser) {
      return {
        error: new StandardError(
          "RESOURCE_ALREADY_EXISTS",
          "Username already exists"
        )
      };
    }
    const { hash, error } = await hashPassword(user.password);
    if (error) {
      return { error }; // maybe returning an status
    }
    await UserModel.create({
      username: user.username,
      password: hash
    });
    return { error: null };
  } catch (error: unknown) {
    logger.error(error);
    return { error: new StandardError("INTERNAL_SERVER_ERROR") };
  }
}

/**
 * Checks if the user exists and if the password is correct by checking the hash
 * @param username valid username which is a email
 * @param password user password in plain text
 * @returns
 */
export async function authenticateUser(
  username: string,
  password: string
): Promise<
  | { error: StandardError; user: null }
  | { error: null; user: { username: string } }
> {
  const user = (await UserModel.findOne({ username }, { password: 1 })) as {
    password: string;
  } | null;
  if (!user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await verifyPassword((process.env as any).TEST_ARGON_HASH, "invalid_text"); // avoid timing attacks
    return {
      error: new StandardError("UNAUTHORIZED", "Username or Password is wrong"),
      user: null
    }; // security matter
  }
  const isValid = await verifyPassword(user.password, password);
  if (!isValid) {
    // log attempted login with wrong password
    return {
      error: new StandardError("UNAUTHORIZED", "Username or Password is wrong"),
      user: null
    }; // security matter
  }
  return { error: null, user: { username } }; // should not return the password
}
