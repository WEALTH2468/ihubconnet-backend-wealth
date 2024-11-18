const Comment = require('../models/comment');
const User = require('../models/user');

exports.addComment = async (req, res, next) => {
    try {
        const body = req.body;

        const user = await User.findById({ _id: body.userId });
        const newComment = new Comment({
            ...body,
            user: { name: user.displayName, avatar: user.avatar },
            time: Date.now(),
        });

        await newComment.save();

        res.status(201).json({newComment, message: 'Comment Created successfully'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.deleteComment = async (req, res, next) => {
    const commentId = req.params.id;

    try {
        // Attempt to find the document by ID and delete it
        const deletedComment = await Comment.findOneAndDelete({
            _id: commentId,
        });

        if (!deletedComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        return res
            .status(200)
            .json({ message: 'Comment deleted successfully', deletedComment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.getComments = async (req, res, next) => {
  const id = req.params.id;
  const type = req.query.type;

  try {
    const comments = await Comment.find({ [type]: id });
    return res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllComments = async (req, res, next) => {
  const type = req.query.type;
  console.log({ type });
  try {
    const comments = await Comment.find({ [type]: { $exists: true } }).sort({
      time: -1,
    });
    return res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.editComment = async (req, res) => {
  const id = req.params.id;

  try {
    const edittedComment = await Comment.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    console.log({ edittedComment });
    return res.status(200).json({ edittedComment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};