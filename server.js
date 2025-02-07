const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const router = require("./routes/userRoute");
const groupRouter = require("./routes/grouRoute");
const http = require("http");
const socket = require("socket.io");
const socketIo = require("./socket");
const messageRouter = require("./routes/messageRoute");

const app = express();

const server = http.createServer(app);

const io = socket(server, {
  cors: {
    origin: "https://smankabtang.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use(
  cors({
    origin: "https://smankabtang.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });

socketIo(io);

app.use("/api/users", router);
app.use("/api/group", groupRouter);
app.use("/api/messages", messageRouter);
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
