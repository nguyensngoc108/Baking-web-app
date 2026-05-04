import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationOTP: {
    type: String,
    default: null,
  },
  verificationOTPExpires: {
    type: Date,
    default: null,
  },
  verificationExpiresAt: {
    type: Date,
    default: null,
    index: { expireAfterSeconds: 0 }, // MongoDB auto-deletes unverified docs at this time
  },
  resetOTP: {
    type: String,
    default: null,
  },
  resetOTPExpires: {
    type: Date,
    default: null,
  },
  resetAttempts: {
    type: Number,
    default: 0,
  },
  resetOTPLockedUntil: {
    type: Date,
    default: null,
  },
  resetOTPRequestedAt: {
    type: Date,
    default: null,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetTokenExpires: {
    type: Date,
    default: null,
  },
  phone: {
    type: String,
  },
  details: {
    allergies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CakeIngredient'
    }],
    notes:{
      type: String,
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
