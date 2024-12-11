const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const path = require("path");
const cors = require("cors");
const cron = require("node-cron");

const app = express();
const { differenceInDays } = require('date-fns');
const Chat = require("./models/chat");

const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const commentRoutes = require("./routes/comment");
const notificationRoutes = require("./routes/notification");
const messageRoutes = require("./routes/message");
const reactionRoutes = require("./routes/reaction");
const readReceiptRoutes = require("./routes/readReceipt");


function connectToDatabase() {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(process.env.localConnect, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        family: 4,
      })
      .then(async () => {
        // await generateChat()
        console.log("Connected to local MongoDB");
        resolve();
      })
      .catch((error) => {
        console.error("Failed to connect to local MongoDB:", error.message);
        console.log("Trying fallback connection...");

        mongoose
          .connect(process.env.remoteDeployment, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          })
          .then(async () => {
            console.log("Connected to remote MongoDB");
            resolve();
          })
          .catch((fallbackError) => {
            console.error(
              "Failed to connect to fallback MongoDB:",
              fallbackError.message
            );
            reject(fallbackError);
          });
      });
  });
}

connectToDatabase();

app.use(
  cors({
    origin: process.env.frontend_domain,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message:
      "iHub Connect 1.0.0.3 - MVP Release : (iPerformance) November 5th 2024",
  });
});

// Different files upload storage
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/ihub", userRoutes);
app.use("/notifications", notificationRoutes);
app.use("/chat", messageRoutes);
app.use("/reaction", reactionRoutes);
app.use("/readReceipt", readReceiptRoutes);




module.exports = app;
