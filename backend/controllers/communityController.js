const Community = require('../models/communities');
const User = require('../models/user.js');
const sendEmail = require('../utils/sendEmail');

// CREATE a new community
const createCommunity = async (req, res) => {
  try {
    const {
      name,
      type,
      mission,
      description,
      location,
      contact,
      media,
      isPrivate,
      members,
      established,
      bannerImage,
      profileImage,
    } = req.body;

    // Get image URLs from req.body (uploaded separately by frontend) or from files if uploaded directly
    const finalBannerImage = bannerImage || req.files?.bannerImage?.[0]?.path || null;
    const finalProfileImage = profileImage || req.files?.profileImage?.[0]?.path || null;

    const newCommunity = await Community.create({
      name,
      type,
      mission,
      description,
      bannerImage: finalBannerImage,
      profileImage: finalProfileImage,
      location,
      contact,
      media,
      isPrivate,
      members,
      leader: req.user.id, // Set leader to the authenticated user
      established,
    });

    // Add the new community to the leader's joinedCommunities
    try {
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { joinedCommunities: newCommunity._id },
      });
    } catch (uErr) {
      console.error('Failed to update leader joinedCommunities:', uErr.message);
    }

    // ✅ Send email to contact
    if (contact?.email) {
      try {
        const emailSubject = 'Community Created Successfully!';
        const emailText = `Hello ${contact.name},\n\nYour community "${name}" has been successfully created.\n\nThank you!`;
        const emailHTML = `<p>Hello <strong>${contact.name}</strong>,</p>
                       <p>Your community "<strong>${name}</strong>" has been successfully created.</p>
                       <p>Thank you!</p>`;

        console.log(`📧 Attempting to send email to: ${contact.email}...`);

        await sendEmail(contact.email, emailSubject, emailText, emailHTML);

        console.log(`✅ Email successfully sent to: ${contact.email}`);
      } catch (emailErr) {
        console.error(`❌ Failed to send email to ${contact.email}:`, emailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: newCommunity,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: err.message,
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate field value',
        details: err.message,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// GET all communities
const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find();
    res.status(200).json({
      success: true,
      message: 'Communities fetched successfully',
      data: communities,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch communities',
      details: err.message,
    });
  }
};

// GET a single community by ID
const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('leader', 'name email profileImage')
      .populate('members', 'name email profileImage');
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found',
      });
    }
    res.status(200).json({
      success: true,
      data: community,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch community',
      details: err.message,
    });
  }
};

// GET communities by leader ID
const getCommunitiesByLeader = async (req, res) => {
  try {
    const leaderId = req.params.leaderId;
    const communities = await Community.find({ leader: leaderId });
    res.status(200).json({
      success: true,
      message: 'Communities fetched successfully',
      data: communities,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch communities',
      details: err.message,
    });
  }
};

// UPDATE a community
const updateCommunity = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Update images from req.body (URLs) or from files if uploaded directly
    if (updateData.bannerImage || req.files?.bannerImage)
      updateData.bannerImage = updateData.bannerImage || req.files.bannerImage[0].path;
    if (updateData.profileImage || req.files?.profileImage)
      updateData.profileImage = updateData.profileImage || req.files.profileImage[0].path;

    const updatedCommunity = await Community.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCommunity) {
      return res.status(404).json({
        success: false,
        error: 'Community not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Community updated successfully',
      data: updatedCommunity,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: err.message,
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate field value',
        details: err.message,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// DELETE a community
const deleteCommunity = async (req, res) => {
  try {
    const deletedCommunity = await Community.findByIdAndDelete(req.params.id);
    if (!deletedCommunity) {
      return res.status(404).json({
        success: false,
        error: 'Community not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Community deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// JOIN a community (add user to members)
const joinCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, error: 'Community not found' });
    }

    // If community is private, indicate request sent (no pendingRequests model yet)
    if (community.isPrivate) {
      return res
        .status(200)
        .json({ success: true, message: 'Join request sent. Awaiting approval.' });
    }

    // Check if user is already a member
    const already = community.members.some((m) => m.toString() === userId.toString());
    if (already) {
      return res.status(400).json({ success: false, error: 'User already a member' });
    }

    community.members.push(userId);
    await community.save();

    // also add the community reference to the user's joinedCommunities using $addToSet
    try {
      await User.findByIdAndUpdate(userId, { $addToSet: { joinedCommunities: community._id } });
    } catch (uErr) {
      console.error('Failed to update user joinedCommunities:', uErr.message);
    }

    res.status(200).json({ success: true, message: 'Joined community', data: community });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
};

// LEAVE a community (remove user from members)
const leaveCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, error: 'Community not found' });
    }

    const memberIndex = community.members.findIndex((m) => m.toString() === userId.toString());
    if (memberIndex === -1) {
      return res.status(400).json({ success: false, error: 'User is not a member' });
    }

    community.members.splice(memberIndex, 1);
    await community.save();

    // also remove the community reference from the user's joinedCommunities
    try {
      await User.findByIdAndUpdate(userId, { $pull: { joinedCommunities: community._id } });
    } catch (uErr) {
      console.error('Failed to remove community from user joinedCommunities:', uErr.message);
    }

    res.status(200).json({ success: true, message: 'Left community', data: community });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
};

// REMOVE a member (leader only)
const removeMember = async (req, res) => {
  try {
    const communityId = req.params.id;
    const memberId = req.params.memberId;
    const leaderId = req.user?.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, error: 'Community not found' });
    }

    if (!leaderId || community.leader.toString() !== leaderId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (community.leader.toString() === memberId.toString()) {
      return res.status(400).json({ success: false, error: 'Cannot remove community leader' });
    }

    const isMember = community.members.some((m) => m.toString() === memberId.toString());
    if (!isMember) {
      return res.status(400).json({ success: false, error: 'User is not a member' });
    }

    await Community.findByIdAndUpdate(communityId, { $pull: { members: memberId } }, { new: true });

    // also remove the community reference from the user's joinedCommunities
    try {
      await User.findByIdAndUpdate(memberId, { $pull: { joinedCommunities: communityId } });
    } catch (uErr) {
      console.error('Failed to remove community from user joinedCommunities:', uErr.message);
    }

    res.status(200).json({ success: true, message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
};

module.exports = {
  createCommunity,
  getCommunities,
  getCommunityById,
  getCommunitiesByLeader,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  removeMember,
};
