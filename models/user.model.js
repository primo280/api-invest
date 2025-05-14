const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - phone
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the user
 *         phone:
 *           type: string
 *           description: User's phone number
 *         password:
 *           type: string
 *           description: User's password (hashed)
 *         level:
 *           type: string
 *           enum: [bronze, silver, gold, platinum]
 *           description: User's level
 *         balance:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               description: Total balance
 *             invested:
 *               type: number
 *               description: Amount invested
 *             available:
 *               type: number
 *               description: Available balance for withdrawal
 *         referralCode:
 *           type: string
 *           description: User's referral code
 *         referredBy:
 *           type: string
 *           description: ID of the user who referred this user
 *         isAdmin:
 *           type: boolean
 *           description: Whether the user is an admin
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the user was last updated
 */

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    level: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    balance: {
      total: {
        type: Number,
        default: 0,
      },
      invested: {
        type: Number,
        default: 0,
      },
      available: {
        type: Number,
        default: 0,
      },
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    refreshToken: String,
  },
  { timestamps: true },
)

// Generate referral code before saving
userSchema.pre("save", async function (next) {
  // Only generate referral code if it doesn't exist
  if (!this.referralCode) {
    this.referralCode = "REF" + crypto.randomBytes(4).toString("hex").toUpperCase()
  }

  // Only hash password if it has been modified
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to check if password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, isAdmin: this.isAdmin }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE })
}

// Method to update user level based on investment amount
userSchema.methods.updateLevel = function () {
  const investedAmount = this.balance.invested

  if (investedAmount >= 10000) {
    this.level = "platinum"
  } else if (investedAmount >= 5000) {
    this.level = "gold"
  } else if (investedAmount >= 2500) {
    this.level = "silver"
  } else {
    this.level = "bronze"
  }

  return this.save()
}

const User = mongoose.model("User", userSchema)

module.exports = User
