const mongoose = require("mongoose")

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - returnRate
 *         - duration
 *         - level
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the product
 *         name:
 *           type: string
 *           description: Name of the investment product
 *         description:
 *           type: string
 *           description: Description of the product
 *         price:
 *           type: number
 *           description: Minimum investment amount
 *         returnRate:
 *           type: number
 *           description: Daily return rate (decimal)
 *         dailyReturn:
 *           type: number
 *           description: Daily return amount for minimum investment
 *         duration:
 *           type: number
 *           description: Duration of the investment in days
 *         level:
 *           type: string
 *           enum: [bronze, silver, gold, platinum]
 *           description: Required user level for this product
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: List of product features
 *         isActive:
 *           type: boolean
 *           description: Whether the product is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the product was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the product was last updated
 */

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Minimum investment amount is required"],
      min: [100, "Minimum investment amount must be at least 100"],
    },
    returnRate: {
      type: Number,
      required: [true, "Return rate is required"],
      min: [0.001, "Return rate must be at least 0.1%"],
      max: [0.01, "Return rate cannot exceed 1%"],
    },
    dailyReturn: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 day"],
    },
    level: {
      type: String,
      required: [true, "Level is required"],
      enum: ["bronze", "silver", "gold", "platinum"],
    },
    features: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

// Calculate daily return before saving
productSchema.pre("save", function (next) {
  this.dailyReturn = this.price * this.returnRate
  next()
})

const Product = mongoose.model("Product", productSchema)

module.exports = Product
