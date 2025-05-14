const mongoose = require("mongoose")

/**
 * @swagger
 * components:
 *   schemas:
 *     Investment:
 *       type: object
 *       required:
 *         - userId
 *         - productId
 *         - amount
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the investment
 *         userId:
 *           type: string
 *           description: ID of the user who made the investment
 *         productId:
 *           type: string
 *           description: ID of the product invested in
 *         amount:
 *           type: number
 *           description: Amount invested
 *         dailyReturn:
 *           type: number
 *           description: Daily return amount
 *         totalReturn:
 *           type: number
 *           description: Total return earned so far
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Date when the investment started
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Date when the investment ends
 *         status:
 *           type: string
 *           enum: [active, completed, cancelled]
 *           description: Status of the investment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the investment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the investment was last updated
 */

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Investment amount is required"],
      min: [100, "Minimum investment amount is 100"],
    },
    dailyReturn: {
      type: Number,
      required: true,
    },
    totalReturn: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true },
)

// Populate product details when querying investments
investmentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "productId",
    select: "name returnRate duration level",
  })
  next()
})

const Investment = mongoose.model("Investment", investmentSchema)

module.exports = Investment
