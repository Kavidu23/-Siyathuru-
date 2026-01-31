const Community = require("../models/communities");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

/* SEND JOIN REQUEST / JOIN COMMUNITY */
const joinCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        error: "Community not found"
      });
    }

    // Block public communities
    if (!community.isPrivate) {
      return res.status(400).json({
        success: false,
        error: "This endpoint is only for private communities"
      });
    }

    // Already a member
    if (community.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: "You are already a member"
      });
    }

    // Already requested
    const alreadyRequested = community.joinRequests.some(
      r => r.user.toString() === userId
    );

    if (alreadyRequested) {
      return res.status(400).json({
        success: false,
        error: "Join request already sent"
      });
    }

    // Send join request
    await Community.findByIdAndUpdate(
      communityId,
      { $addToSet: { joinRequests: { user: userId } } }
    );

    return res.status(200).json({
      success: true,
      message: "Join request sent. Awaiting approval."
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server error",
      details: err.message
    });
  }
};


/* USER CANCEL JOIN REQUEST */
const cancelJoinRequest = async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user.id;

    const result = await Community.findByIdAndUpdate(
      communityId,
      { $pull: { joinRequests: { user: userId } } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ success: false, error: "Community not found" });
    }

    res.status(200).json({
      success: true,
      message: "Join request cancelled"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};

/* LEADER APPROVE / REJECT JOIN REQUEST */
const handleJoinRequest = async (req, res) => {
  try {
    const communityId = req.params.id;
    const { userId, approve } = req.body;
    const leaderId = req.user.id;

    const community = await Community.findById(communityId).populate("leader");
    if (!community) {
      return res.status(404).json({ success: false, error: "Community not found" });
    }

    // Authorization
    if (community.leader._id.toString() !== leaderId) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Remove request first
    await Community.findByIdAndUpdate(
      communityId,
      { $pull: { joinRequests: { user: userId } } }
    );

    if (approve) {
      // Add member
      await Community.findByIdAndUpdate(
        communityId,
        { $addToSet: { members: userId } }
      );

      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { joinedCommunities: communityId } }
      );

      // 📧 EMAIL APPROVAL
      await sendEmail(
        user.email,
        "Community Join Request Approved 🎉",
        `Hello ${user.name}, your request to join "${community.name}" has been approved.`,
        `<p>Hello <strong>${user.name}</strong>,</p>
         <p>Your request to join <strong>${community.name}</strong> has been approved 🎉</p>`
      );

      return res.status(200).json({
        success: true,
        message: "Join request approved"
      });
    }

    // EMAIL REJECTION
    await sendEmail(
      user.email,
      "Community Join Request Rejected",
      `Hello ${user.name}, your request to join "${community.name}" was rejected.`,
      `<p>Hello <strong>${user.name}</strong>,</p>
       <p>Your request to join <strong>${community.name}</strong> was rejected.</p>`
    );

    res.status(200).json({
      success: true,
      message: "Join request rejected"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};

// GET all join requests for a community (leader use)
const getJoinRequests = async (req, res) => {
  try {
    const communityId = req.params.id;
    const leaderId = req.user.id;
    const community = await Community.findById(communityId).populate("joinRequests.user");

    if (!community) {
      return res.status(404).json({ success: false, error: "Community not found" });
    }
    // Authorization
    if (community.leader.toString() !== leaderId) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }
    res.status(200).json({
      success: true,
      joinRequests: community.joinRequests
    });
  }
  catch (err) {
    res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};

module.exports = {
  joinCommunity,
  cancelJoinRequest,
  handleJoinRequest,
  getJoinRequests
};
