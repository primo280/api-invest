const Investment = require("../models/investment.model")
const User = require("../models/user.model")
const Transaction = require("../models/transaction.model")

/**
 * Calculate and distribute daily returns for all active investments
 */
exports.calculateDailyReturns = async () => {
  try {
    // Get all active investments
    const activeInvestments = await Investment.find({ status: "active" })

    console.log(`Processing ${activeInvestments.length} active investments`)

    // Process each investment
    for (const investment of activeInvestments) {
      // Check if investment has reached end date
      const today = new Date()
      if (investment.endDate && today >= investment.endDate) {
        // Mark investment as completed
        investment.status = "completed"
        await investment.save()

        console.log(`Investment ${investment._id} completed`)

        // Move investment amount to available balance
        const user = await User.findById(investment.userId)
        user.balance.invested -= investment.amount
        user.balance.available += investment.amount
        await user.save()

        // Create transaction for investment completion
        await Transaction.create({
          userId: investment.userId,
          type: "deposit",
          amount: investment.amount,
          status: "completed",
          description: "Investment matured",
          reference: investment._id.toString(),
        })

        continue // Skip to next investment
      }

      // Process daily return
      const dailyReturn = investment.dailyReturn

      // Update investment total return
      investment.totalReturn += dailyReturn
      await investment.save()

      // Update user balance
      const user = await User.findById(investment.userId)
      user.balance.total += dailyReturn
      user.balance.available += dailyReturn
      await user.save()

      // Create transaction record
      await Transaction.create({
        userId: investment.userId,
        type: "gain",
        amount: dailyReturn,
        status: "completed",
        description: "Daily investment return",
        reference: investment._id.toString(),
      })

      console.log(`Processed daily return of ${dailyReturn} for investment ${investment._id}`)
    }

    console.log("Daily returns calculation completed successfully")
    return true
  } catch (error) {
    console.error("Error calculating daily returns:", error)
    throw error
  }
}
