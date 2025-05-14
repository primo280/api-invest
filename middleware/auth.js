const jwt = require("jsonwebtoken")
const asyncHandler = require("./async")
const ErrorResponse = require("../utils/errorResponse")
const User = require("../models/user.model")

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from token
    req.user = await User.findById(decoded.id)

    if (!req.user) {
      return next(new ErrorResponse("User not found", 401))
    }

    next()
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401))
  }
})

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403))
    }
    next()
  }
}

// Check if user is admin
exports.isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to access this route", 403))
  }
  next()
})
