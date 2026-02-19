const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

/* REQUEST PASSWORD RESET */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Always return generic response to avoid account enumeration (security best practice)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:4200";
    const resetLink = `${frontendBaseUrl}/forgot-password?token=${resetToken}`;

    const subject = "Reset your Siyathuru password";
    const text = `You requested a password reset. Use this link within 15 minutes: ${resetLink}`;
    const html = `
      <p>Hello ${user.name || ""},</p>
      <p>You requested to reset your Siyathuru password.</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link expires in 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

    try {
      await sendEmail(user.email, subject, text, html);
    } catch (emailErr) {
      console.error("Password reset email failed:", emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server error",
      details: err.message,
    });
  }
};

/* RESET PASSWORD */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: "Token and new password are required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server error",
      details: err.message,
    });
  }
};

/* EXPORTS */
module.exports = {
  requestPasswordReset,
  resetPassword,
};