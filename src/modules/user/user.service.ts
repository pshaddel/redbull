import { User, UserCreationObject, UserModel } from "./user.model";
import argon2 from "argon2";

export async function findUserByUsername(
  username: string
): Promise<User | null> {
  return UserModel.findOne({ username }, { password: 0 });
}

export async function registerUser(
  user: UserCreationObject
): Promise<{ error: string | null }> {
  try {
    const hash = await argon2.hash(user.password, {
      type: argon2.argon2id,
      salt: Buffer.from("salt should be more"),
      secret: Buffer.from("secret should")
    });
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

export async function authenticateUser(
  username: string,
  password: string
): Promise<{ error: string | null; user: User | null }> {
  const user = await UserModel.findOne({ username });
  if (!user) {
    // log attempted login with wrong username
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await argon2.verify((process.env as any).TEST_ARGON_HASH, "password"); // avoid timing attacks
    return { error: "Username or Password is wrong", user: null }; // security matter
  }
  const isValid = await argon2.verify(user.password, password);
  if (!isValid) {
    // log attempted login with wrong password
    return { error: "Username or Password is wrong", user: null }; // security matter
  }
  return { error: null, user };
}
