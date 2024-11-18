const mongoose = require("mongoose");
const Comment = require("./comment");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, ref: "User" },
  user: { name: { type: String }, avatar: { type: String } },
  text: { type: String },
  picture: { type: String },
  time: { type: Number },
  comments: { type: Array, default: [] },
  likes: { type: Map, of: Boolean, default: {} },
  dislikes: { type: Map, of: Boolean, default: {} },
  likeCount: { type: Number, default: 0 },
  dislikeCount: { type: Number, default: 0 },
});

postSchema.pre("findOneAndDelete", async function (next) {
  const post = await this.model.findOne(this.getFilter());
  await Comment.deleteMany({ postId: post._id });
  next();
});

postSchema.methods.likePost = function (userId) {
  if (this.dislikes.get(userId)) {
    this.dislikes.delete(userId);
    this.dislikeCount -= 1;
  }

  if (!this.likes.get(userId)) {
    this.likes.set(userId, true);
    this.likeCount += 1;
  } else {
    this.likes.delete(userId);
    this.likeCount -= 1;
  }

  return this.save();
};

postSchema.methods.dislikePost = function (userId) {
  if (this.likes.get(userId)) {
    this.likes.delete(userId);
    this.likeCount -= 1;
  }

  if (!this.dislikes.get(userId)) {
    this.dislikes.set(userId, true);
    this.dislikeCount += 1;
  } else {
    this.dislikes.delete(userId);
    this.dislikeCount -= 1;
  }

  return this.save();
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
