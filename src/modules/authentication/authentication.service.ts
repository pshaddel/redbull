import argon2 from "argon2";

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
