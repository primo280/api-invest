const User = require("../models/user.model")
const Investment = require("../models/investment.model")
const Transaction = require("../models/transaction.model")
const Withdrawal = require("../models/withdrawal.model")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getAdminStats = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to access admin stats", 403))
  }

  // Get total users count
  const totalUsers = await User.countDocuments()

  // Get active investments count
  const activeInvestments = await Investment.countDocuments({ status: "active" })

  // Get total invested amount
  const investmentStats = await Investment.aggregate([
    {
      $group: {
        _id: null,
        totalInvested: { $sum: "$amount" },
      },
    },
  ])
  const totalInvested = investmentStats.length > 0 ? investmentStats[0].totalInvested : 0

  // Get total withdrawals amount
  const withdrawalStats = await Withdrawal.aggregate([
    {
      $match: { status: "completed" },
    },
    {
      $group: {
        _id: null,
        totalWithdrawals: { $sum: "$amount" },
      },
    },
  ])
  const totalWithdrawals = withdrawalStats.length > 0 ? withdrawalStats[0].totalWithdrawals : 0

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      activeInvestments,
      totalInvested,
      totalWithdrawals,
    },
  })
})

/**
 * @desc    Get recent users
 * @route   GET /api/admin/users/recent
 * @access  Private/Admin
 */
exports.getRecentUsers = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to access user data", 403))
  }

  const users = await User.find({ isAdmin: false }).sort({ createdAt: -1 }).limit(10)

  // Get additional data for each user
  const usersWithData = await Promise.all(
    users.map(async (user) => {
      // Get total invested
      const investments = await Investment.find({ userId: user._id })
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)

      return {
        id: user._id,
        phone: user.phone,
        level: user.level,
        totalInvested,
        balance: user.balance.total,
        joinDate: user.createdAt,
      }
    }),
  )

  res.status(200).json({
    success: true,
    data: usersWithData,
  })
})

/**
 * @desc    Get recent transactions
 * @route   GET /api/admin/transactions/recent
 * @access  Private/Admin
 */
exports.getRecentTransactions = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to access transaction data", 403))
  }

  const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(10).populate("userId", "phone")

  const formattedTransactions = transactions.map((transaction) => ({
    id: transaction._id,
    userId: transaction.userId._id,
    userPhone: transaction.userId.phone,
    type: transaction.type,
    amount: transaction.amount,
    status: transaction.status,
    date: transaction.createdAt,
  }))

  res.status(200).json({
    success: true,
    data: formattedTransactions,
  })
})

/**
 * @desc    Get investment stats by month
 * @route   GET /api/admin/investments/stats
 * @access  Private/Admin
 */
exports.getInvestmentStats = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to access investment stats", 403))
  }

  // Get current year
  const currentYear = new Date().getFullYear()

  // Aggregate investments by month for current year
  const monthlyStats = await Investment.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        investments: { $sum: "$amount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ])

  // Format data for chart
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

  const result = months.map((month, index) => {
    const monthData = monthlyStats.find((stat) => stat._id === index + 1)
    return {
      month,
      investments: monthData ? monthData.investments : 0,
    }
  })

  res.status(200).json({
    success: true,
    data: result,
  })
})

/**
 * @desc    Get user details
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
exports.getUserDetails = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to access user details", 403))
  }

  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404))
  }

  // Get user investments
  const investments = await Investment.find({ userId: user._id }).populate("productId", "name").sort({ createdAt: -1 })

  // Get user transactions
  const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20)

  // Get user withdrawals
  const withdrawals = await Withdrawal.find({ userId: user._id }).sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        phone: user.phone,
        level: user.level,
        balance: user.balance,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        createdAt: user.createdAt,
      },
      investments,
      transactions,
      withdrawals,
    },
  })
})

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to update users", 403))
  }

  // Fields allowed to update
  const { level, isAdmin } = req.body

  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404))
  }

  // Update fields if provided
  if (level) user.level = level
  if (isAdmin !== undefined) user.isAdmin = isAdmin

  await user.save()

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      phone: user.phone,
      level: user.level,
      isAdmin: user.isAdmin,
    },
  })
})
