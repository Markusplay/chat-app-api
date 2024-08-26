import mongoose from "mongoose";

interface IMessage {
  chatId: mongoose.Schema.Types.ObjectId;
  message: string;
  sender: "user" | "bot";
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ["user", "bot"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
