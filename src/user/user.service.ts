import { User, UserModel } from "./user.model";
import z from "zod";

export const createUser = async (user: UserCreationObject): Promise<User> => {
  const insertResult = await UserModel.create({
    email: user.email,
    name: user.name
  });
  return insertResult;
};

export const userCreationValidator = z.object({
  name: z.string(),
  email: z.string().email()
});

type UserCreationObject = z.infer<typeof userCreationValidator>;
