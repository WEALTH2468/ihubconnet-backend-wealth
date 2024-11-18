const SocketIO = require("socket.io");
const nodemailer = require("nodemailer");
const UnsentNotification = require("./models/unsentNotification");
const jwt = require("jsonwebtoken");
const Message = require("./models/message");
const User = require("./models/user");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "izone5.media@gmail.com",
    pass: "niwlnbyxupfhcpmm",
  },
});

const initSocketIO = (httpServer) => {
  const io = new SocketIO.Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: process.env.frontend_domain,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  let onlineUsers = {};

  const addNewUser = (data) => {
    if (!onlineUsers[data.userId]) {
      onlineUsers[data.userId] = data.socket.id;
    }
  };

  const removeUser = (userId) => {
    delete onlineUsers[userId];
  };

  const getContactSocketId = (userId) => {
    return onlineUsers[userId];
  };

  const getUserId = (socket) => {
    try {
      const token = socket.handshake.query.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.access_token);
        return decoded.userId;
      }
    } catch (err) {
      console.error("Error verifying token:", err);
      return null;
    }
  };

  const storedNotificationForUser = async (data) => {
    try {
      const {
        senderId,
        receiverId,
        description,
        image,
        read,
        link,
        useRouter,
      } = data;

      const newUnsentNotification = new UnsentNotification({
        senderId,
        receiverId,
        description,
        image,
        read,
        link,
        useRouter,
        time: Date.now(),
      });
      await newUnsentNotification.save();
    } catch (error) {
      console.error(error);
    }
  };

  const getStoredNotificationsForUser = async (userId, socket) => {
    try {
      const unsentNotifications = await UnsentNotification.find({
        receiverId: userId,
      });

      unsentNotifications.forEach((notification) => {
        io.to(socket.id).emit("emitNotification", notification);
      });
      clearStoredNotificationsForUser(userId);
    } catch (err) {
      console.error(err);
    }
  };

  const clearStoredNotificationsForUser = async (userId) => {
    try {
      await UnsentNotification.deleteMany({ receiverId: userId });
    } catch (err) {
      console.error(err);
    }
  };

  const sendEmailNotification = async (data) => {
    const mailOptions = {
      from: "izone5.media@gmail.com",
      to: data.receivers.map((user) => user.email).join(", "),
      subject: data.subject,
      html: data.description,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Message sent: %s", info.messageId);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const emitNotification = (data) => {
    const onlineIds = Object.entries(onlineUsers)
      .filter((user) => data.receivers.some((item) => user[0] === item._id))
      .map((item) => item[1]);

    console.log({ onlineIds, data });
    const offlineUsers = data.receivers.filter(
      (user) =>
        !Object.entries(onlineUsers).some((item) => item[0] === user._id)
    );

    console.log({ offlineUsers });
    if (onlineIds.length > 0) {
      io.to(onlineIds).emit("emitNotification", data);
    }
    if (offlineUsers.length > 0) {
      offlineUsers.forEach((user) => {
        data.receiverId = user._id;
        storedNotificationForUser(data);
      });
    }
  };

  io.on("connection", async (socket) => {
    const userId = getUserId(socket);
    const lastLogin = new Date();

    socket.on("connectedUser", async ({ userId, displayName }) => {
      addNewUser({ userId, socket });
      io.emit("online", { userId, status: "online" });
      getStoredNotificationsForUser(userId, socket);
      await User.findOneAndUpdate(
        { _id: userId },
        { status: "online", lastLogin: lastLogin.toISOString() },
        { new: true }
      );
      console.log(`${userId} => ${displayName} has connected`);
    });

    socket.on("refreshPost", (post) => {
      io.emit("refreshPost", post);
    });

    socket.on("emitGetUsers", () => {
      io.emit("emitGetUsers");
    });

    socket.on("emitEmailAndNotification", async (data) => {
      emitNotification(data);
      // sendEmailNotification(data)
    });

    socket.on("emitNotification", (data) => {
      emitNotification(data);
    });

    socket.on("emitSendChat", (data) => {
      const message = data.chat ? data.message : data;
      const socketId = getContactSocketId(message.contactId);
      if (socketId) {
        // Emit message to receiver
        io.to(socketId).emit("sendChat", data);
        console.log("Message sent:");
      } else {
        console.error("Receiver not found for message:", data);
      }
    });

    socket.on("emitSendPanelChat", (data) => {
      const message = data.chat ? data.message : data;
      const socketId = getContactSocketId(message.contactId);
      if (socketId) {
        // Emit message to receiver
        io.to(socketId).emit("sendPanelChat", data);
        console.log("Message sent:");
      } else {
        console.error("Receiver not found for message:", data);
      }
    });

    // Listen for messageRead event to update the messages' isRead status
    socket.on("messageRead", async (messageIds) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $set: { isRead: true } }
        );
        console.log(`Messages with IDs ${messageIds} marked as read`);
      } catch (error) {
        console.error("Error updating message statuses:", error);
      }
    });

    socket.on("updateStatus", async (data) => {
      console.log({ data });
      io.emit("updateStatus", { userId: data.userId, status: data.status });
      await User.findOneAndUpdate(
        { _id: data.userId },
        { status: data.status },
        { new: true }
      );
    });

    socket.on("userlogout", async () => {
      console.log("logout has been clicked");
      io.emit("offline", { userId, status: "offline" });
      await User.findOneAndUpdate(
        { _id: userId },
        { status: "offline" },
        { new: true }
      );
      console.log(`${onlineUsers[userId]} has disconnected`);
      removeUser(userId);
    });

    socket.on("disconnect", async () => {
      io.emit("offline", { userId, status: "offline" });
      await User.findOneAndUpdate(
        { _id: userId },
        { status: "offline" },
        { new: true }
      );
      console.log(`${onlineUsers[userId]} has disconnected`);
      removeUser(userId);
    });
  });

  return {
    getContactSocketId,
    emitNotification,
  };
};

module.exports = initSocketIO;
