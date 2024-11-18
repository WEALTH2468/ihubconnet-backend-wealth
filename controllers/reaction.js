const Reaction = require('../models/reaction');

const ReactionController = {
  // Add a reaction to a message
  async addReaction(req, res) {
    try {
      const { messageId, userId, emoji } = req.body;
      const newReaction = new Reaction({ messageId, userId, emoji });
      await newReaction.save();
      res.status(201).json(newReaction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get reactions for a message
  async getMessageReactions(req, res) {
    try {
      const messageId = req.params.messageId;
      const reactions = await Reaction.find({ messageId });
      res.status(200).json(reactions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = ReactionController;
