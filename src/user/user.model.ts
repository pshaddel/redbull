import { InferSchemaType, Schema, model } from 'mongoose';
//
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
});

export type User = InferSchemaType<typeof UserSchema>;

export const UserModel = model<User>('User', UserSchema);