const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  senderId: String,
  receiverId: String,
  description: String,
  image: String,
  time: Number,
  read: Boolean,
  link: String,
  useRouter: Boolean
});



const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
