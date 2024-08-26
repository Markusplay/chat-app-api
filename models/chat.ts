import { Schema, model } from "mongoose";
interface IChat {
  firstName: string;
  lastName: string;
  createdAt: Date;
  messages: any[];
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  messages: [
    {
      sender: String,
      message: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Chat = model<IChat>("Chat", chatSchema);
export default Chat;
