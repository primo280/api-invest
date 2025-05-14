const express = require("express")
const {
  getAdminStats,
  getRecentUsers,
  getRecentTransactions,
  getInvestmentStats,
  getUserDetails,
  updateUser,
} = require("../controllers/admin.controller")
const { protect, isAdmin } = require("../middleware/auth")

const router = express.Router()

// Protect all routes and require admin role
router.use(protect)
router.use(isAdmin)

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard statistics
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
router.get("/stats", getAdminStats)

/**
 * @swagger
 * /api/admin/users/recent:
 *   get:
 *     summary: Get recent users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recent users
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
router.get("/users/recent", getRecentUsers)

/**
 * @swagger
 * /api/admin/transactions/recent:
 *   get:
 *     summary: Get recent transactions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recent transactions
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
router.get("/transactions/recent", getRecentTransactions)

/**
 * @swagger
 * /api/admin/investments/stats:
 *   get:
 *     summary: Get investment statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Investment statistics
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
router.get("/investments/stats", getInvestmentStats)

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get("/users/:id", getUserDetails)

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [bronze, silver, gold, platinum]
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put("/users/:id", updateUser)

module.exports = router
