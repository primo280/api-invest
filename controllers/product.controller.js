const Product = require("../models/product.model")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ isActive: true })

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  })
})

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404))
  }

  res.status(200).json({
    success: true,
    data: product,
  })
})

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = asyncHandler(async (req, res, next) => {
  // Add admin check
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to create products", 403))
  }

  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    data: product,
  })
})

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = asyncHandler(async (req, res, next) => {
  // Add admin check
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to update products", 403))
  }

  let product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404))
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: product,
  })
})

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  // Add admin check
  if (!req.user.isAdmin) {
    return next(new ErrorResponse("Not authorized to delete products", 403))
  }

  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404))
  }

  await product.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})
