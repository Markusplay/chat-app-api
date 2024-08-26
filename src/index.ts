require('dotenv').config();

import express, {Request, Response} from "express";
import mongoose from "mongoose";
import Chat from "../models/chat";
import Message from "../models/message";
import cors from "cors";
import axios from "axios";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT ?? 3500;


const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: 'https://chat-app-front-4hix.onrender.com',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("MONGO_URI is not defined");
}

mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("DB connected successfully");
    })
    .catch((error) => {
      console.error("DB connection failed:", error);
    });

app.get("/chats", async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find();
    res.json(chats);
  } catch (err) {
    res.status(500);
  }
})

app.get("/chats/:id", async (req:Request, res:Response) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ msg: "Chat not found" });

    res.json(chat);
  } catch (err) {
    res.status(500);
  }
});

app.post("/chats", async (req:Request, res:Response) => {
  const { firstName, lastName } = req.body;
  try {
    const newChat = new Chat({ firstName, lastName });
    await newChat.save();
    res.json(newChat);
  } catch (err) {
    res.status(500);
  }
});

app.put("/chats/:id", async (req:Request, res:Response) => {
  const { firstName, lastName } = req.body;
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ msg: "Chat not found" });

    chat.firstName = firstName;
    chat.lastName = lastName;
    chat.updatedAt = new Date();

    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

app.delete("/chats/:id", async (req:Request, res:Response) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ msg: "Chat not found" });

    await chat.deleteOne();
    res.json({ msg: "Chat removed" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

app.get("/chats/:id/messages", async (req: Request, res:Response) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).send("Chat not found");
    }
    res.status(200).json(chat.messages);
  } catch (error) {
    res.status(500);
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("sendMessage", async ({ chatId, message }) => {
    const chat = await Chat.findById(chatId);
    const newMessage = {
      sender: "user",
      message,
    };
    chat?.messages.push(newMessage);
    await chat?.save();

    io.emit("receiveMessage", { chatId, message: newMessage });

    setTimeout(async () => {
      const response = await axios.get("https://api.quotable.io/random");
      const autoResponse = new Message({
        chatId,
        message: response.data.content,
        sender: "bot",
      });

      chat?.messages.push(autoResponse);
      await chat?.save();
      io.emit("receiveMessage", { chatId, message: autoResponse });
    }, 3000);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
