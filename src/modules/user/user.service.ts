import { ObjectId } from "mongoose";
import {
  hashPassword,
  verifyPassword
} from "../authentication/authentication.service";
import { User, UserCreationObject, UserModel } from "./user.model";

export async function findUserByUsername(
  username: string
): Promise<(User & { _id: ObjectId }) | null> {
  return UserModel.findOne({ username }, { password: 0 });
}

export async function registerUser(
  user: UserCreationObject
): Promise<{ error: string | null }> {
  try {
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
    // send to logger
    console.log(error);
    return { error: "INTERNAL_SERVER_ERROR" };
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
  { error: string; user: null } | { error: null; user: { username: string } }
> {
  const user = (await UserModel.findOne({ username }, { password: 1 })) as {
    password: string;
  } | null;
  if (!user) {
    // log attempted login with wrong username
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await verifyPassword((process.env as any).TEST_ARGON_HASH, "invalid_text"); // avoid timing attacks
    return { error: "Username or Password is wrong", user: null }; // security matter
  }
  const isValid = await verifyPassword(user.password, password);
  if (!isValid) {
    // log attempted login with wrong password
    return { error: "Username or Password is wrong", user: null }; // security matter
  }
  return { error: null, user: { username } }; // should not return the password
}
