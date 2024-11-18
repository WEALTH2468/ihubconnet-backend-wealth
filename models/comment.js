const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  user: { name: { type: String }, avatar: { type: String } },
  time: { type: Number },
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  goalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
  riskId: { type: Schema.Types.ObjectId, ref: 'Risk' },
  challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge' },
  objectiveId: { type: Schema.Types.ObjectId, ref: 'Objective' },
  text: { type: String },
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
