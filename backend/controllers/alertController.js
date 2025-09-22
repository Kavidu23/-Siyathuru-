const Alert = require("../models/alert"); // alert model path

// Create a new alert
const createAlert = async (req, res) => {
    try {
        const { communityId, title, message, severity, isActive } = req.body;

        const newAlert = await Alert.create({
            communityId,
            title,
            message,
            severity,
            isActive
        });

        res.status(201).json({
            success: true,
            message: "Alert created successfully",
            data: newAlert
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: err.message
            });
        }
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: "Duplicate field value",
                details: err.message
            });
        }
        res.status(500).json({
            success: false,
            error: "Server error",
            details: err.message
        });
    }
};

// Read all alerts
const getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find();

        res.status(200).json({
            success: true,
            message: "Alerts fetched successfully",
            data: alerts
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch alerts",
            details: err.message
        });
    }
};

// Read single alert by ID
const getAlertById = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) {
            return res.status(404).json({
                success: false,
                error: "Alert not found"
            });
        }
        res.status(200).json({
            success: true,
            data: alert
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch alert",
            details: err.message
        });
    }
};

// Update an alert
const updateAlert = async (req, res) => {
    try {
        const updatedAlert = await Alert.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedAlert) {
            return res.status(404).json({
                success: false,
                error: "Alert not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Alert updated successfully",
            data: updatedAlert
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: err.message
            });
        }
        res.status(500).json({
            success: false,
            error: "Server error",
            details: err.message
        });
    }
};

// Delete an alert
const deleteAlert = async (req, res) => {
    try {
        const deletedAlert = await Alert.findByIdAndDelete(req.params.id);
        if (!deletedAlert) {
            return res.status(404).json({
                success: false,
                error: "Alert not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Alert deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Server error",
            details: err.message
        });
    }
};

module.exports = {
    createAlert,
    getAlerts,
    getAlertById,
    updateAlert,
    deleteAlert
};
