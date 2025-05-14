const express = require("express")
const {
  getUserProfile,
  getUserBalance,
  getUserGains,
  getUserInvestments,
  getUserReferral,
  getUserReferralStats,
  getUserReferrals,
  getUserRecentTransactions,
  getUserWithdrawals,
} = require("../controllers/user.controller")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Protect all routes
router.use(protect)

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Not authorized
 */
router.get("/profile", getUserProfile)

/**
 * @swagger
 * /api/user/balance:
 *   get:
 *     summary: Get user balance
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User balance data
 *       401:
 *         description: Not authorized
 */
router.get("/balance", getUserBalance)

/**
 * @swagger
 * /api/user/gains:
 *   get:
 *     summary: Get user daily gains
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User daily gains data
 *       401:
 *         description: Not authorized
 */
router.get("/gains", getUserGains)

/**
 * @swagger
 * /api/user/investments:
 *   get:
 *     summary: Get user investments
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User investments data
 *       401:
 *         description: Not authorized
 */
router.get("/investments", getUserInvestments)

/**
 * @swagger
 * /api/user/referral:
 *   get:
 *     summary: Get user referral code
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User referral code
 *       401:
 *         description: Not authorized
 */
router.get("/referral", getUserReferral)

/**
 * @swagger
 * /api/user/referral/stats:
 *   get:
 *     summary: Get user referral statistics
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User referral statistics
 *       401:
 *         description: Not authorized
 */
router.get("/referral/stats", getUserReferralStats)

/**
 * @swagger
 * /api/user/referrals:
 *   get:
 *     summary: Get user referrals list
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User referrals list
 *       401:
 *         description: Not authorized
 */
router.get("/referrals", getUserReferrals)

/**
 * @swagger
 * /api/user/transactions/recent:
 *   get:
 *     summary: Get user recent transactions
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User recent transactions
 *       401:
 *         description: Not authorized
 */
router.get("/transactions/recent", getUserRecentTransactions)

/**
 * @swagger
 * /api/user/withdrawals:
 *   get:
 *     summary: Get user withdrawal history
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User withdrawal history
 *       401:
 *         description: Not authorized
 */
router.get("/withdrawals", getUserWithdrawals)

module.exports = router
