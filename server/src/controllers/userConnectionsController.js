const User = require("../models/User");

// Send connection request
const sendConnectionRequest = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    
    // Prevent users from connecting to themselves
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot connect to yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already connected
    if (targetUser.connections.includes(req.user._id)) {
      return res.status(400).json({ message: "Already connected" });
    }

    // Check if request already sent
    if (targetUser.connectionRequests.includes(req.user._id)) {
      return res.status(400).json({ message: "Connection request already sent" });
    }

    // Add connection request
    targetUser.connectionRequests.push(req.user._id);
    await targetUser.save();

    res.status(200).json({ message: "Connection request sent successfully" });
  } catch (err) {
    console.error("Connection request error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Accept connection request
const acceptConnectionRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const requesterId = req.params.id;

    if (!user.connectionRequests.includes(requesterId))
      return res.status(400).json({ message: "No such request found" });

    user.connections.push(requesterId);
    user.connectionRequests = user.connectionRequests.filter(
      (id) => id.toString() !== requesterId
    );

    const requester = await User.findById(requesterId);
    requester.connections.push(user._id);

    await user.save();
    await requester.save();

    res.status(200).json({ message: "Connection accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Reject connection request
const rejectConnectionRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const requesterId = req.params.id;

    if (!user.connectionRequests.includes(requesterId))
      return res.status(400).json({ message: "No such request found" });

    user.connectionRequests = user.connectionRequests.filter(
      (id) => id.toString() !== requesterId
    );

    await user.save();

    res.status(200).json({ message: "Connection request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// List connections
const listConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "connections",
      "name email profilePic role"
    );

    res.status(200).json({
      connections: user.connections,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// List pending requests
const listConnectionRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("connectionRequests", "name email profilePic role")
      .select("connectionRequests");

    res.status(200).json({
      requests: user.connectionRequests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Search users by name
const searchUsersByName = async (req, res) => {
  try {
    const { name } = req.query; // Get search query from query params

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Case-insensitive, partial match
    const users = await User.find({
      name: { $regex: name, $options: "i" },
      _id: { $ne: req.user._id }, // Exclude the searching user
    }).select("name email profilePic role"); // Select fields to return

    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Disconnect from a user
const disconnectUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    // Find both users
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if they are actually connected
    if (!currentUser.connections.includes(targetUserId)) {
      return res.status(400).json({ message: "Not connected to this user" });
    }

    // Remove connection from both users
    currentUser.connections = currentUser.connections.filter(
      id => id.toString() !== targetUserId
    );
    targetUser.connections = targetUser.connections.filter(
      id => id.toString() !== currentUserId.toString()
    );

    // Save both users
    await Promise.all([currentUser.save(), targetUser.save()]);

    res.status(200).json({ message: "Successfully disconnected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  listConnections,
  listConnectionRequests,
  searchUsersByName,
  disconnectUser,
};
