const Post = require('../models/post');
const User = require('../models/user');
const fs = require('fs');

exports.getPosts = async (req, res, next) => {
    const postsPerFetch = 10;
    const count = Number(req.query.count) || 0;

    const limit = postsPerFetch;
    const skip = count * postsPerFetch;

    try {
        const postsWithComments = await Post.aggregate([
            {
                $lookup: {
                    from: 'comments', // The name of the comments collection
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'comments',
                },
            },
            {
                $sort: { _id: -1 } // Sort the posts in descending order by _id
            },
            { $skip: skip },
            { $limit: limit }      
        ]);

        return res.status(200).json(postsWithComments);
    } catch (error) {
        console.error(error);
    }
};

exports.addPost = async (req, res, next) => {
    try {
    
        const { userId, text } = JSON.parse(req.body.post);

        const user = await User.findById({ _id: userId });

        const data = {
            userId,
            text,
            user: { name: user.displayName, avatar: user.avatar },
            time: Date.now(),
        };
        if (req.files.picture) {
            data.picture = '/images/' + req.files.picture[0].filename;
        }
        const newPost = new Post(data);

        const post = await newPost.save();

        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.deletePost = async (req, res, next) => {
    const postId = req.params.id;
    try {
        const post = await Post.findById({ _id: postId });

        if (post.picture) {
            const fileName = post.picture.split('/images/')[1];

            fs.unlink('images/' + fileName, async () => {
                const deletedPost = await Post.findOneAndDelete({
                    _id: postId,
                });
                if (!deletedPost) {
                    return res.status(404).json({ error: 'Post not found' });
                }
                return res
                    .status(200)
                    .json({deletedPost, message: 'Post deleted successfully' });
            });
        } else {
            const deletedPost = await Post.findOneAndDelete({ _id: postId });
            if (!deletedPost) {
                return res.status(404).json({ error: 'Post not found' });
            }
            return res
                .status(200)
                .json({ deletedPost, message: 'Post deleted successfully' });
        }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
};

exports.updatePost = async (req, res, next) => {
    const postId = req.params.id;

    const postData = JSON.parse(req.body.post);

    Object.keys(req.files).forEach((key) => {
        if (postData[key]) {
            const fileName = postData[key].split('/images/')[1];
            fs.unlink('images/' + fileName, () => {});
        }

        postData[key] = '/images/' + req.files[key][0].filename;
    });

    Post.findByIdAndUpdate(
        postId, // find the user by id
        postData,
        { new: true } // updated data
    )
        .then((updatedPost) => {
            if (updatedPost) {
                return res.status(200).json({
                    updatedPost,
                    message: 'Updated successfully!',
                });
            } else {
                return res.status(200).json({
                    message: 'Post not found!',
                });
            }
        })
        .catch((error) => {
          console.error(error);
          return res.status(500).json({ message: error.message });
        });
};

exports.likePost = async (req, res, next) => {
    const { userId, postId } = JSON.parse(req.params.ids);

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

       const like = await post.likePost(userId);
        return res.json({ like, message: 'Post liked successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
};

exports.dislikePost = async (req, res, next) => {
    const { userId, postId } = JSON.parse(req.params.ids);

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

      const dislike =  await post.dislikePost(userId);
        return res.json({ dislike, message: 'Post liked successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
};
