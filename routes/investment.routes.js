const express = require("express")
const {
  createInvestment,
  getInvestments,
  getInvestment,
  cancelInvestment,
} = require("../controllers/investment.controller")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Protect all routes
router.use(protect)

/**
 * @swagger
 * /api/investments:
 *   post:
 *     summary: Create a new investment
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - amount
 *             properties:
 *               productId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Investment created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 */
router.post("/", createInvestment)

/**
 * @swagger
 * /api/investments:
 *   get:
 *     summary: Get all investments (admin only)
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all investments
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
router.get("/", getInvestments)

/**
 * @swagger
 * /api/investments/{id}:
 *   get:
 *     summary: Get an investment by ID
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Investment ID
 *     responses:
 *       200:
 *         description: Investment details
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Investment not found
 */
router.get("/:id", getInvestment)

/**
 * @swagger
 * /api/investments/{id}/cancel:
 *   put:
 *     summary: Cancel an investment
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Investment ID
 *     responses:
 *       200:
 *         description: Investment cancelled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Investment not found
 */
router.put("/:id/cancel", cancelInvestment)

module.exports = router
