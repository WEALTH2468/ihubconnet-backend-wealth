const Message = require("../models/message");
const Chat = require("../models/chat");

async function createIndexes() {
  try {
    await Chat.createIndexes();
    await Message.createIndexes();
    console.log('Indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}
// createIndexes();
//Chat update octorber 2024
//Just a comment to make push
exports.sendMessage = async (req, res) => {
  try {
    const date = new Date();
    const { messageText: content, subject, avatar, link } = req.body;
    const { contactId } = req.params;
    const { userId } = req.auth;

    let chat = await Chat.findOne({
      participants: { $all: [userId, contactId] },
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, contactId],
      });
    }

    const message = new Message({
      chatId: chat._id,
      userId,
      contactId,
      subject,
      image: avatar,
      content,
      link,
    });

    if (message) {
      chat.lastMessage = content;
      chat.lastMessageAt = date;
      chat.messages.push(message._id);
    }

    await Promise.all([chat.save(), message.save()]);
    chat.messages.length === 1
      ? res
          .status(201)
          .json({
            message,
            chat,
          })
      : res.status(201).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.isRead = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { userId } = req.auth;

    const chat = await Chat.findOne({
      participants: { $all: [userId, contactId] },
    }).select('_id');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    const result = await Message.updateMany(
      { chatId: chat._id, contactId: userId, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({
      message: `${result.nModified} messages marked as read`,
      chatId: chat._id,
      contactId: userId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { userId } = req.auth;

    let chat = await Chat.findOne({
      participants: { $all: [userId, contactId] },
    }).populate("messages");

    chat ? res.status(200).json(chat.messages) : res.status(200).json([]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getChats = async (req, res) => {
  try {
    const { userId } = req.auth;

    let chat = await Chat.find({ participants: { $in: userId } }).populate(
      "messages"
    );

    chat.sort(
      (d1, d2) =>
        new Date(d2.lastMessageAt).getTime() -
        new Date(d1.lastMessageAt).getTime()
    );

    if (chat) {
      chat = chat.map((item) => {
        const count = item.messages.reduce(
          (acc, curr) =>
            acc + (curr.seen === false && curr.contactId == userId ? 1 : 0),
          0
        );
        return {
          _id: item._id,
          unreadCount: count,
          contactId: item.contactId,
          participants: item.participants,
          muted: item.muted,
          lastMessage: item.lastMessage,
          lastMessageAt: item.lastMessageAt,
        };
      });
    }
    chat ? res.status(200).json(chat) : res.status(200).json([]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
