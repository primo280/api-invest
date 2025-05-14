const mongoose = require("mongoose")

/**
 * @swagger
 * components:
 *   schemas:
 *     Withdrawal:
 *       type: object
 *       required:
 *         - userId
 *         - amount
 *         - phone
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the withdrawal
 *         userId:
 *           type: string
 *           description: ID of the user requesting the withdrawal
 *         amount:
 *           type: number
 *           description: Withdrawal amount
 *         phone:
 *           type: string
 *           description: Phone number for receiving the withdrawal
 *         status:
 *           type: string
 *           enum: [pending, completed, rejected]
 *           description: Status of the withdrawal
 *         processedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the withdrawal was processed
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the withdrawal was requested
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the withdrawal was last updated
 */

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Withdrawal amount is required"],
      min: [50, "Minimum withdrawal amount is 50"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema)

module.exports = Withdrawal
