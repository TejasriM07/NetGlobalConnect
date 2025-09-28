const Message = require("../models/Message");

// Send message (REST API)
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content)
      return res
        .status(400)
        .json({ success: false, message: "Receiver and content required" });

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      content,
    });

    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all messages between logged-in user and another user
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // other user's ID
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id },
      ],
    }).sort({ timestamp: 1 });

    return res.json({ success: true, data: messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendMessage, getMessages };
