const express = require("express")
const {
  createWithdrawal,
  getWithdrawals,
  getPendingWithdrawals,
  processWithdrawal,
} = require("../controllers/withdrawal.controller")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Protect all routes
router.use(protect)

/**
 * @swagger
 * /api/withdrawals:
 *   post:
 *     summary: Create a withdrawal request
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - phone
 *             properties:
 *               amount:
 *                 type: number
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Withdrawal request created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 */
router.post("/", createWithdrawal)

/**
 * @swagger
 * /api/withdrawals:
 *   get:
 *     summary: Get all withdrawals (admin only)
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all withdrawals
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
router.get("/", getWithdrawals)

/**
 * @swagger
 * /api/withdrawals/pending:
 *   get:
 *     summary: Get pending withdrawals (admin only)
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending withdrawals
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
router.get("/pending", getPendingWithdrawals)

/**
 * @swagger
 * /api/withdrawals/{id}/process:
 *   put:
 *     summary: Process a withdrawal (admin only)
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Withdrawal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [completed, rejected]
 *     responses:
 *       200:
 *         description: Withdrawal processed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Withdrawal not found
 */
router.put("/:id/process", processWithdrawal)

module.exports = router
