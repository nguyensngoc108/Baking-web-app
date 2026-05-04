import crypto from "crypto";
import bcryptjs from "bcryptjs";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import {
  generateAdminToken,
  generateUserToken,
} from "../middleware/authMiddleware.js";
import { generateOTP } from "../utils/Services.js";
import { sendOTPEmail, sendVerificationOTP } from "../utils/emailService.js";
// Admin login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login request received:", { email });

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const passwordMatch = await bcryptjs.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateAdminToken(admin);

    console.log("Login successful for:", email);
    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Admin registration
export const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    console.log("Registration request received:", { email });

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Email, password, and username are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Password will be hashed by Admin model's pre-save hook
    const admin = new Admin({ email, password, username });
    const savedAdmin = await admin.save();

    console.log("Admin registered successfully:", email);

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: savedAdmin._id,
        email: savedAdmin.email,
        username: savedAdmin.username,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// User login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("User login request received:", { email });

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Unverified account — resend a fresh OTP and tell the client to redirect
    if (user.isVerified === false) {
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      user.verificationOTP = otp;
      user.verificationOTPExpires = expiresAt;
      user.verificationExpiresAt = expiresAt;
      await user.save();
      await sendVerificationOTP(email, otp, user.firstName);
      return res.status(403).json({
        pendingVerification: true,
        email,
        message: "Your email is not verified. We've sent a new code — please check your inbox.",
      });
    }

    // Compare passwords
    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateUserToken(user);

    console.log("User login successful for:", email);
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// User registration — creates unverified account and sends OTP
export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      email,
      phone,
      password,
      street,
      city,
      postalCode,
      dietaryRestrictions,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !phone || !street || !city || !postalCode) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const address = `${street}, ${city}, ${postalCode}`;
    const details = `Dietary Restrictions: ${dietaryRestrictions || "None"}`;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    if (existingUser && !existingUser.isVerified) {
      // Update ALL fields — user may be re-registering with new data
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.gender = gender;
      existingUser.phone = phone;
      existingUser.address = address;
      existingUser.details = details;
      existingUser.password = password; // pre-save hook will re-hash
      existingUser.verificationOTP = otp;
      existingUser.verificationOTPExpires = expiresAt;
      existingUser.verificationExpiresAt = expiresAt; // reset TTL window
      await existingUser.save();
    } else {
      const user = new User({
        firstName, lastName, email, password, phone, gender, address, details,
        isVerified: false,
        verificationOTP: otp,
        verificationOTPExpires: expiresAt,
        verificationExpiresAt: expiresAt,
      });
      await user.save();
    }

    await sendVerificationOTP(email, otp, firstName);

    res.status(201).json({ message: "Verification code sent to your email", email });
  } catch (error) {
    console.error("User registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Verify email OTP — completes registration and returns token
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    if (user.verificationOTP !== otp || user.verificationOTPExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationOTP = null;
    user.verificationOTPExpires = null;
    user.verificationExpiresAt = null; // disarm TTL — verified users must never be auto-deleted
    await user.save();

    const token = generateUserToken(user);
    res.json({
      message: "Email verified successfully",
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address" });
    }

    // Check if account is locked from too many OTP attempts
    if (user.resetOTPLockedUntil && user.resetOTPLockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.resetOTPLockedUntil - Date.now()) / 60000);
      return res.status(429).json({
        message: `Account is temporarily locked. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
        lockedUntil: user.resetOTPLockedUntil,
      });
    }

    // 60-second cooldown between resend requests
    if (user.resetOTPRequestedAt && Date.now() - new Date(user.resetOTPRequestedAt).getTime() < 60 * 1000) {
      const remaining = Math.ceil((60 * 1000 - (Date.now() - new Date(user.resetOTPRequestedAt).getTime())) / 1000);
      return res.status(429).json({
        message: `Please wait ${remaining} seconds before requesting a new code.`,
        remaining,
      });
    }

    const otp = generateOTP();
    user.resetOTP = otp;
    user.resetOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetAttempts = 0;
    user.resetOTPLockedUntil = null;
    user.resetOTPRequestedAt = new Date();
    await user.save();

    await sendOTPEmail(email, otp, `${user.firstName} ${user.lastName}`);
    res.json({ message: "Verification code sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check lockout
    if (user.resetOTPLockedUntil && user.resetOTPLockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.resetOTPLockedUntil - Date.now()) / 60000);
      return res.status(429).json({
        message: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
        lockedUntil: user.resetOTPLockedUntil,
      });
    }

    // Check OTP expiry
    if (!user.resetOTP || !user.resetOTPExpires || user.resetOTPExpires < Date.now()) {
      return res.status(400).json({ message: "Code has expired. Please request a new one." });
    }

    // Wrong OTP
    if (user.resetOTP !== otp) {
      user.resetAttempts = (user.resetAttempts || 0) + 1;
      if (user.resetAttempts >= 3) {
        user.resetOTPLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.resetOTP = null;
        user.resetOTPExpires = null;
        await user.save();
        return res.status(429).json({
          message: "Too many failed attempts. Please request a new code in 15 minutes.",
          lockedUntil: user.resetOTPLockedUntil,
        });
      }
      await user.save();
      const remaining = 3 - user.resetAttempts;
      return res.status(400).json({
        message: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
        attemptsRemaining: remaining,
      });
    }

    // OTP correct — issue a short-lived password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOTP = null;
    user.resetOTPExpires = null;
    user.resetAttempts = 0;
    await user.save();

    res.json({ message: "Code verified", resetToken });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== resetToken ||
      user.passwordResetTokenExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Reset session has expired. Please start over." });
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    user.resetOTPLockedUntil = null;
    user.resetOTPRequestedAt = null;
    await user.save();

    res.json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message });
  }
};


