import { InferSchemaType, Schema, model } from "mongoose";
import { z } from "zod";

const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const passwordError =
  "Password must contain at least 8 characters and a combination of lowercase, uppercase, number and a special character";

//
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value: string) => {
          return z.string().email().safeParse(value).success;
        },
        message: "Invalid Email"
      }
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => {
          return passwordRegex.test(value);
        },
        message: passwordError
      }
    }
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema>;

/** Password requirements:
 * - contains at least 8 characters and
 * - lowercase,
 * - uppercase,
 * - number
 * - special character
 * @example testUser!123
 * */
const passwordValidator = z
  .string()
  .regex(passwordRegex, { message: passwordError });

/** Username requirements:
 * - email format
 * RFC2822: https://www.ietf.org/rfc/rfc2822.txt
 * Check this link: https://learn.microsoft.com/en-us/archive/blogs/testing123/email-address-test-cases
 * @example test@gmail.com
 * */
const usernameValidator = z.string().regex(
  // eslint-disable-next-line no-control-regex
  /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/gm
);
export const userRegistrationValidator = z.object({
  username: usernameValidator,
  password: passwordValidator
});

export type UserCreationObject = z.infer<typeof userRegistrationValidator>;

export const UserModel = model<User>("User", UserSchema);
