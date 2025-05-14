const User = require("../models/user.model")
const Transaction = require("../models/transaction.model")
const Investment = require("../models/investment.model")
const Withdrawal = require("../models/withdrawal.model")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")

/**
 * @desc    Get user profile
 * @route   GET /api/user/profile
 * @access  Private
 */
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      phone: user.phone,
      level: user.level,
      balance: user.balance,
      referralCode: user.referralCode,
    },
  })
})

/**
 * @desc    Get user balance
 * @route   GET /api/user/balance
 * @access  Private
 */
exports.getUserBalance = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    data: user.balance,
  })
})

/**
 * @desc    Get user daily gains
 * @route   GET /api/user/gains
 * @access  Private
 */
exports.getUserGains = asyncHandler(async (req, res, next) => {
  // Get daily gain transactions for the last 14 days
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const transactions = await Transaction.find({
    userId: req.user.id,
    type: "gain",
    createdAt: { $gte: fourteenDaysAgo },
  }).sort({ createdAt: 1 })

  // Format data for chart
  const gains = transactions.map((transaction) => ({
    date: transaction.createdAt.toISOString().split("T")[0],
    gains: transaction.amount,
  }))

  // Fill in missing dates with zero gains
  const result = []
  const dateMap = new Map()

  // Create a map of existing dates
  gains.forEach((item) => {
    dateMap.set(item.date, item.gains)
  })

  // Fill in all dates in the range
  for (let i = 0; i < 14; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (13 - i))
    const dateStr = date.toISOString().split("T")[0]

    result.push({
      date: dateStr,
      gains: dateMap.get(dateStr) || 0,
    })
  }

  res.status(200).json({
    success: true,
    data: result,
  })
})

/**
 * @desc    Get user investments
 * @route   GET /api/user/investments
 * @access  Private
 */
exports.getUserInvestments = asyncHandler(async (req, res, next) => {
  const investments = await Investment.find({ userId: req.user.id })
    .populate("productId", "name level")
    .sort({ createdAt: -1 })

  // Format investments for frontend
  const formattedInvestments = investments.map((investment) => ({
    id: investment._id,
    productId: investment.productId._id,
    productName: investment.productId.name,
    amount: investment.amount,
    dailyReturn: investment.dailyReturn,
    totalReturn: investment.totalReturn,
    startDate: investment.startDate,
    status: investment.status,
  }))

  res.status(200).json({
    success: true,
    data: formattedInvestments,
  })
})

/**
 * @desc    Get user referral info
 * @route   GET /api/user/referral
 * @access  Private
 */
exports.getUserReferral = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    data: {
      code: user.referralCode,
    },
  })
})

/**
 * @desc    Get user referral stats
 * @route   GET /api/user/referral/stats
 * @access  Private
 */
exports.getUserReferralStats = asyncHandler(async (req, res, next) => {
  // Get users referred by current user
  const referrals = await User.find({ referredBy: req.user.id })

  // Get active referrals (users who have made at least one investment)
  const activeReferrals = await Investment.distinct("userId", {
    userId: { $in: referrals.map((r) => r._id) },
    status: "active",
  })

  // Get total earnings from referrals
  const referralTransactions = await Transaction.find({
    userId: req.user.id,
    type: "referral",
  })

  const totalEarnings = referralTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

  // Get pending earnings (not yet credited)
  const pendingEarnings = 0 // This would be calculated based on your business logic

  res.status(200).json({
    success: true,
    data: {
      totalReferrals: referrals.length,
      activeReferrals: activeReferrals.length,
      totalEarnings,
      pendingEarnings,
    },
  })
})

/**
 * @desc    Get user referrals list
 * @route   GET /api/user/referrals
 * @access  Private
 */
exports.getUserReferrals = asyncHandler(async (req, res, next) => {
  // Get users referred by current user
  const referrals = await User.find({ referredBy: req.user.id })

  // Get investment data for each referral
  const referralData = await Promise.all(
    referrals.map(async (referral) => {
      // Get total investment amount
      const investments = await Investment.find({ userId: referral._id })
      const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0)

      // Get earnings from this referral
      const referralTransactions = await Transaction.find({
        userId: req.user.id,
        type: "referral",
        reference: referral._id.toString(),
      })

      const earnings = referralTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

      // Check if referral is active (has active investments)
      const hasActiveInvestments = investments.some((inv) => inv.status === "active")

      return {
        id: referral._id,
        phone: referral.phone,
        joinDate: referral.createdAt,
        status: hasActiveInvestments ? "active" : "inactive",
        totalInvestment,
        earnings,
      }
    }),
  )

  res.status(200).json({
    success: true,
    data: referralData,
  })
})

/**
 * @desc    Get user recent transactions
 * @route   GET /api/user/transactions/recent
 * @access  Private
 */
exports.getUserRecentTransactions = asyncHandler(async (req, res, next) => {
  const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10)

  const formattedTransactions = transactions.map((transaction) => ({
    id: transaction._id,
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.createdAt,
    status: transaction.status,
    description: transaction.description,
  }))

  res.status(200).json({
    success: true,
    data: formattedTransactions,
  })
})

/**
 * @desc    Get user withdrawal history
 * @route   GET /api/user/withdrawals
 * @access  Private
 */
exports.getUserWithdrawals = asyncHandler(async (req, res, next) => {
  const withdrawals = await Withdrawal.find({ userId: req.user.id }).sort({ createdAt: -1 })

  const formattedWithdrawals = withdrawals.map((withdrawal) => ({
    id: withdrawal._id,
    amount: withdrawal.amount,
    date: withdrawal.createdAt,
    status: withdrawal.status,
    phone: withdrawal.phone,
  }))

  res.status(200).json({
    success: true,
    data: formattedWithdrawals,
  })
})
