const Investment = require("../models/investment.model")
const Product = require("../models/product.model")
const User = require("../models/user.model")
const Transaction = require("../models/transaction.model")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")

/**
 * @desc    Create new investment
 * @route   POST /api/investments
 * @access  Private
 */
exports.createInvestment = asyncHandler(async (req, res, next) => {
  const { productId, amount } = req.body

  // Check if product exists
  const product = await Product.findById(productId)
  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${productId}`, 404))
  }

  // Check if product is active
  if (!product.isActive) {
    return next(new ErrorResponse("This product is not available for investment", 400))
  }

  // Check if user has required level
  const user = await User.findById(req.user.id)
  const levelHierarchy = { bronze: 1, silver: 2, gold: 3, platinum: 4 }
  const userLevelValue = levelHierarchy[user.level]
  const productLevelValue = levelHierarchy[product.level]

  if (userLevelValue < productLevelValue) {
    return next(new ErrorResponse(`You need to be at ${product.level} level to invest in this product`, 400))
  }

  // Check if amount is valid
  if (amount < product.price) {
    return next(new ErrorResponse(`Minimum investment amount is ${product.price}`, 400))
  }

  // Calculate daily return
  const dailyReturn = amount * product.returnRate

  // Calculate end date
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + product.duration)

  // Create investment
  const investment = await Investment.create({
    userId: req.user.id,
    productId,
    amount,
    dailyReturn,
    endDate,
  })

  // Update user balance
  user.balance.total += amount
  user.balance.invested += amount
  await user.updateLevel() // Update user level based on new investment

  // Create transaction record
  await Transaction.create({
    userId: req.user.id,
    type: "deposit",
    amount,
    status: "completed",
    description: `Investment in ${product.name}`,
    reference: investment._id.toString(),
  })

  // Process referral bonus if applicable
  if (user.referredBy) {
    const referrer = await User.findById(user.referredBy)
    if (referrer) {
      // Calculate referral bonus based on referrer's level
      let bonusRate
      switch (referrer.level) {
        case "platinum":
          bonusRate = 0.1 // 10%
          break
        case "gold":
          bonusRate = 0.08 // 8%
          break
        case "silver":
          bonusRate = 0.05 // 5%
          break
        default:
          bonusRate = 0.03 // 3%
      }

      const bonusAmount = amount * bonusRate

      // Update referrer's balance
      referrer.balance.total += bonusAmount
      referrer.balance.available += bonusAmount
      await referrer.save()

      // Create transaction record for referral bonus
      await Transaction.create({
        userId: referrer._id,
        type: "referral",
        amount: bonusAmount,
        status: "completed",
        description: `Referral bonus from ${user.phone}`,
        reference: user._id.toString(),
      })
    }
  }

  res.status(201).json({
    success: true,
    data: investment,
  })
})

/**
 * @desc    Get all investments
 * @route   GET /api/investments
 * @access  Private/Admin
 */
exports.getInvestments = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to access this route", 403))
  }

  const investments = await Investment.find().populate("userId", "phone").populate("productId", "name")

  res.status(200).json({
    success: true,
    count: investments.length,
    data: investments,
  })
})

/**
 * @desc    Get single investment
 * @route   GET /api/investments/:id
 * @access  Private
 */
exports.getInvestment = asyncHandler(async (req, res, next) => {
  const investment = await Investment.findById(req.params.id).populate("productId", "name returnRate duration level")

  if (!investment) {
    return next(new ErrorResponse(`Investment not found with id of ${req.params.id}`, 404))
  }

  // Check if user owns this investment or is admin
  if (investment.userId.toString() !== req.user.id && !req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to access this investment", 403))
  }

  res.status(200).json({
    success: true,
    data: investment,
  })
})

/**
 * @desc    Cancel investment
 * @route   PUT /api/investments/:id/cancel
 * @access  Private
 */
exports.cancelInvestment = asyncHandler(async (req, res, next) => {
  const investment = await Investment.findById(req.params.id)

  if (!investment) {
    return next(new ErrorResponse(`Investment not found with id of ${req.params.id}`, 404))
  }

  // Check if user owns this investment or is admin
  if (investment.userId.toString() !== req.user.id && !req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to cancel this investment", 403))
  }

  // Check if investment can be cancelled
  if (investment.status !== "active") {
    return next(new ErrorResponse("Only active investments can be cancelled", 400))
  }

  // Update investment status
  investment.status = "cancelled"
  await investment.save()

  // Update user balance
  const user = await User.findById(investment.userId)
  user.balance.invested -= investment.amount
  user.balance.available += investment.amount
  await user.updateLevel() // Update user level after cancellation

  // Create transaction record
  await Transaction.create({
    userId: investment.userId,
    type: "withdrawal",
    amount: investment.amount,
    status: "completed",
    description: "Investment cancellation",
    reference: investment._id.toString(),
  })

  res.status(200).json({
    success: true,
    data: investment,
  })
})
