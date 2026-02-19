const fs = require('fs').promises;
const path = require('path');
const Community = require('../models/communities');

const DATA_PATH = path.join(__dirname, '..', 'data', 'communityVerificationCodes.json');

const loadCodes = async () => {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
};

const saveCodes = async (codes) => {
  const data = JSON.stringify(codes, null, 2);
  await fs.writeFile(DATA_PATH, data, 'utf8');
};

const findEntryByCommunityId = (codes, communityId) => {
  const needle = String(communityId || '').trim();
  return codes.find((c) => String(c.communityId || '').trim() === needle);
};

const validateEntry = (entry, registrationCode) => {
  if (!entry) {
    return {
      ok: false,
      status: 404,
      error: 'Community ID not found in registry',
    };
  }
  if (entry.usage === 'Used') {
    return { ok: false, status: 400, error: 'Registration code already used' };
  }
  if (
    registrationCode !== undefined &&
    Number(entry.registrationCode) !== Number(registrationCode)
  ) {
    return { ok: false, status: 400, error: 'Invalid registration code' };
  }
  return { ok: true };
};

// Check if a verification code is valid (does not mark as used)
const requestVerification = async (req, res) => {
  try {
    const { communityId, registrationCode } = req.body;
    if (!communityId) {
      return res.status(400).json({
        success: false,
        error: 'communityId required',
      });
    }

    const codes = await loadCodes();
    const entry = findEntryByCommunityId(codes, communityId);
    const validation = validateEntry(entry, registrationCode);
    if (!validation.ok) {
      return res.status(validation.status).json({ success: false, error: validation.error });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code is valid',
      data: { communityId: entry.communityId, usage: entry.usage },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// Verify community and mark code as used
const verifyCommunity = async (req, res) => {
  try {
    const { communityId, registrationCode } = req.body;
    if (!communityId) {
      return res.status(400).json({
        success: false,
        error: 'communityId required',
      });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, error: 'Community not found' });
    }
    if (community.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Community already verified',
      });
    }

    const codes = await loadCodes();
    const entry = findEntryByCommunityId(codes, communityId);
    const validation = validateEntry(entry, registrationCode);
    if (!validation.ok) {
      return res.status(validation.status).json({ success: false, error: validation.error });
    }

    community.isVerified = true;
    await community.save();

    entry.usage = 'Used';
    await saveCodes(codes);

    return res.status(200).json({
      success: true,
      message: 'Community verified successfully',
      data: { communityId: community._id, isVerified: true },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

module.exports = {
  requestVerification,
  verifyCommunity,
};
