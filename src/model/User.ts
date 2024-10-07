import mongoose, {Schema, Document} from "mongoose";

export interface Message extends Document {
    content: string;
    created_at: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content: { type: String, required: true },
    created_at: { type: Date, require: true, default: Date.now }
});

export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpire: Date;
    isAcceptingMessages: boolean;
    isVerified: boolean;
    messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
    username: { type: String, required: [true, "Username is required"], trim: true, unique: true },
    email: { type: String, required: [true, "Email is required"], unique: true, match: [/.+\@.+\..+/, "Please enter a valid email"] },
    password: { type: String, required: [true, "Password is required"] },
    verifyCode: { type: String, required: [true, "Verify code is required"] },
    verifyCodeExpire: { type: Date, required: [true, "Verify code expiry is required"] },
    isVerified: { type: Boolean, required: true, default: false },
    isAcceptingMessages: { type: Boolean, required: true },
    messages: [MessageSchema]
});

const UserModel = ( mongoose.models.User as mongoose.Model<User> ) || mongoose.model<User>("User", UserSchema);

export default UserModel;