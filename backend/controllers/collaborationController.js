const Community = require('../models/communities');

// Suggest communities based on nearby location only
const suggestCommunities = async (req, res) => {
  try {
    const { communityId } = req.params;

    // 1. Find the base community
    const baseCommunity = await Community.findById(communityId);
    if (!baseCommunity) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    const { location } = baseCommunity;

    // 2. Find other communities with valid coordinates
    const nearbyThresholdKm = 60;

    const suggestedCommunities = await Community.find({
      _id: { $ne: communityId }, // exclude current community
      'location.coordinates.latitude': {
        $exists: true,
      },
      'location.coordinates.longitude': {
        $exists: true,
      },
    }).lean();

    // 3. Filter by simple distance (Haversine formula)
    const toRad = (deg) => (deg * Math.PI) / 180;

    const filteredSuggestions = suggestedCommunities.filter((c) => {
      if (!c.location?.coordinates) return false;

      const lat1 = location.coordinates.latitude;
      const lon1 = location.coordinates.longitude;
      const lat2 = c.location.coordinates.latitude;
      const lon2 = c.location.coordinates.longitude;

      const R = 6371; // Earth's radius in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const cAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * cAngle;

      return distance <= nearbyThresholdKm;
    });

    res.status(200).json({
      success: true,
      message: 'Suggested communities fetched successfully',
      data: filteredSuggestions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      details: err.message,
    });
  }
};

module.exports = {
  suggestCommunities,
};
