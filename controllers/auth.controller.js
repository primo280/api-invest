const User = require("../models/user.model")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")
const jwt = require("jsonwebtoken")

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { phone, password, referralCode } = req.body

  // Check if user already exists
  const userExists = await User.findOne({ phone })
  if (userExists) {
    return next(new ErrorResponse("User already exists with this phone number", 400))
  }

  // Create user
  const userData = { phone, password }

  // Check if referral code is valid
  if (referralCode) {
    const referrer = await User.findOne({ referralCode })
    if (referrer) {
      userData.referredBy = referrer._id
    }
  }

  const user = await User.create(userData)

  // Generate tokens
  const token = user.generateAuthToken()
  const refreshToken = user.generateRefreshToken()

  // Save refresh token to database
  user.refreshToken = refreshToken
  await user.save()

  sendTokenResponse(user, 201, res)
})

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body

  // Validate phone & password
  if (!phone || !password) {
    return next(new ErrorResponse("Please provide phone and password", 400))
  }

  // Check for user
  const user = await User.findOne({ phone }).select("+password")
  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401))
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password)
  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401))
  }

  sendTokenResponse(user, 200, res)
})

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // Find user and clear refresh token
  await User.findByIdAndUpdate(req.user.id, { refreshToken: null })

  res.status(200).json({
    success: true,
    data: {},
  })
})

/**
 * @desc    Refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return next(new ErrorResponse("No refresh token provided", 400))
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

    // Check if user exists and has this refresh token
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken,
    })

    if (!user) {
      return next(new ErrorResponse("Invalid refresh token", 401))
    }

    // Generate new tokens
    const newToken = user.generateAuthToken()
    const newRefreshToken = user.generateRefreshToken()

    // Update refresh token in database
    user.refreshToken = newRefreshToken
    await user.save()

    res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
    })
  } catch (err) {
    return next(new ErrorResponse("Invalid refresh token", 401))
  }
})

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    data: user,
  })
})

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.generateAuthToken()
  const refreshToken = user.generateRefreshToken()

  // Save refresh token to database
  user.refreshToken = refreshToken
  user.save()

  // Remove password from output
  user.password = undefined

  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    user: {
      id: user._id,
      phone: user.phone,
      level: user.level,
    },
  })
}
