const mongoose = require("mongoose")

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - amount
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the transaction
 *         userId:
 *           type: string
 *           description: ID of the user associated with the transaction
 *         type:
 *           type: string
 *           enum: [deposit, withdrawal, gain, referral]
 *           description: Type of transaction
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *           description: Status of the transaction
 *         description:
 *           type: string
 *           description: Description of the transaction
 *         reference:
 *           type: string
 *           description: Reference ID (investment ID, withdrawal ID, etc.)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the transaction was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the transaction was last updated
 */

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "gain", "referral"],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    description: {
      type: String,
    },
    reference: {
      type: String,
    },
  },
  { timestamps: true },
)

const Transaction = mongoose.model("Transaction", transactionSchema)

module.exports = Transaction
