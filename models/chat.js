const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    contactId: {type:String},
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    messages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    }],
    unreadCount: {type: Number, default:0},
    muted: {type: Boolean, default: false},
    lastMessage:{type:String},
    lastMessageAt:{type:Date}

  },
);

chatSchema.index({ participants: 1 });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
