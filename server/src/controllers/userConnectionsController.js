const User = require("../models/User");

// Send connection request
const sendConnectionRequest = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Already connected or requested
    if (
      targetUser.connections.includes(req.user._id) ||
      targetUser.connectionRequests.includes(req.user._id)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Already connected or requested" });
    }

    targetUser.connectionRequests.push(req.user._id);
    await targetUser.save();

    res.json({ success: true, message: "Connection request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Accept connection request
const acceptConnectionRequest = async (req, res) => {
  try {
    const user = req.user; // Already populated by protect
    const requesterId = req.params.id;

    if (!user.connectionRequests.includes(requesterId))
      return res
        .status(400)
        .json({ success: false, message: "No such request found" });

    // Add to connections
    user.connections.push(requesterId);
    user.connectionRequests = user.connectionRequests.filter(
      (id) => id.toString() !== requesterId
    );

    const requester = await User.findById(requesterId);
    requester.connections.push(user._id);

    await user.save();
    await requester.save();

    res.json({ success: true, message: "Connection accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Reject connection request
const rejectConnectionRequest = async (req, res) => {
  try {
    const user = req.user; // Already populated
    const requesterId = req.params.id;

    if (!user.connectionRequests.includes(requesterId))
      return res
        .status(400)
        .json({ success: false, message: "No such request found" });

    user.connectionRequests = user.connectionRequests.filter(
      (id) => id.toString() !== requesterId
    );
    await user.save();

    res.json({ success: true, message: "Connection request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// List connections
const listConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "connections",
      "name email profilePic"
    );

    res.json({
      success: true,
      count: user.connections.length,
      connections: user.connections,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// List pending requests
const listConnectionRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("connectionRequests", "name email role profilePic")
      .select("connectionRequests");

    res.json({
      success: true,
      count: user.connectionRequests.length,
      requests: user.connectionRequests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  listConnections,
  listConnectionRequests,
};
