const Withdrawal = require("../models/withdrawal.model")
const User = require("../models/user.model")
const Transaction = require("../models/transaction.model")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")

/**
 * @desc    Create withdrawal request
 * @route   POST /api/withdrawals
 * @access  Private
 */
exports.createWithdrawal = asyncHandler(async (req, res, next) => {
  const { amount, phone } = req.body

  // Validate amount
  if (amount < 50) {
    return next(new ErrorResponse("Minimum withdrawal amount is 50", 400))
  }

  // Check if user has sufficient balance
  const user = await User.findById(req.user.id)
  if (user.balance.available < amount) {
    return next(new ErrorResponse("Insufficient balance for withdrawal", 400))
  }

  // Create withdrawal request
  const withdrawal = await Withdrawal.create({
    userId: req.user.id,
    amount,
    phone,
  })

  // Update user balance
  user.balance.available -= amount
  await user.save()

  // Create transaction record
  await Transaction.create({
    userId: req.user.id,
    type: "withdrawal",
    amount,
    status: "pending",
    description: "Withdrawal request",
    reference: withdrawal._id.toString(),
  })

  res.status(201).json({
    success: true,
    data: withdrawal,
  })
})

/**
 * @desc    Get all withdrawals
 * @route   GET /api/withdrawals
 * @access  Private/Admin
 */
exports.getWithdrawals = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to access this route", 403))
  }

  const withdrawals = await Withdrawal.find().populate("userId", "phone").sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: withdrawals.length,
    data: withdrawals,
  })
})

/**
 * @desc    Get pending withdrawals
 * @route   GET /api/withdrawals/pending
 * @access  Private/Admin
 */
exports.getPendingWithdrawals = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to access this route", 403))
  }

  const withdrawals = await Withdrawal.find({ status: "pending" }).populate("userId", "phone").sort({ createdAt: 1 })

  res.status(200).json({
    success: true,
    count: withdrawals.length,
    data: withdrawals,
  })
})

/**
 * @desc    Process withdrawal
 * @route   PUT /api/withdrawals/:id/process
 * @access  Private/Admin
 */
exports.processWithdrawal = asyncHandler(async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to process withdrawals", 403))
  }

  const { status } = req.body

  if (!["completed", "rejected"].includes(status)) {
    return next(new ErrorResponse("Invalid status. Must be completed or rejected", 400))
  }

  const withdrawal = await Withdrawal.findById(req.params.id)

  if (!withdrawal) {
    return next(new ErrorResponse(`Withdrawal not found with id of ${req.params.id}`, 404))
  }

  if (withdrawal.status !== "pending") {
    return next(new ErrorResponse("This withdrawal has already been processed", 400))
  }

  // Update withdrawal status
  withdrawal.status = status
  withdrawal.processedAt = Date.now()
  await withdrawal.save()

  // Update transaction status
  await Transaction.findOneAndUpdate(
    { reference: withdrawal._id.toString(), type: "withdrawal" },
    { status: status === "completed" ? "completed" : "failed" },
  )

  // If rejected, return funds to user
  if (status === "rejected") {
    const user = await User.findById(withdrawal.userId)
    user.balance.available += withdrawal.amount
    await user.save()
  }

  res.status(200).json({
    success: true,
    data: withdrawal,
  })
})
