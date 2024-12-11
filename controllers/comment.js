const Comment = require('../models/comment');
const User = require('../models/user');

exports.addComment = async (req, res, next) => {
  try {
    const { parentId, ...body } = req.body;

    // Validate parentId if provided
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    // Create and save the new comment
    const user = await User.findById(body.userId);
    const newComment = new Comment({
      ...body,
      user: { name: user.displayName, avatar: user.avatar },
      parentId,
      time: Date.now(),
    });

    await newComment.save();
    res.status(201).json({ newComment, message: 'Comment added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// exports.addComment = async (req, res, next) => {
//   try {
//     const { parentId, userId, ...body } = req.body;

//     // Validate required fields
//     if (!userId) {
//       return res.status(400).json({ message: "Missing userId in request body" });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Validate parentId if provided
//     if (parentId) {
//       const parentComment = await Comment.findById(parentId);
//       if (!parentComment) {
//         return res.status(404).json({ message: "Parent comment not found" });
//       }
//     }

//     // Create and save the new comment
//     const newComment = new Comment({
//       ...body,
//       user: { name: user.displayName, avatar: user.avatar },
//       parentId,
//       time: Date.now(),
//     });

//     await newComment.save();
//     res.status(201).json({ newComment, message: "Comment added successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };



exports.getNestedComments = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.aggregate([
      { $match: { postId, parentId: null } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'parentId',
          as: 'replies',
        },
      },
    ]);
    res.status(200).json({ comments });
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