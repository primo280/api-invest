const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const swaggerUi = require("swagger-ui-express")
const swaggerJsDoc = require("swagger-jsdoc")
const cron = require("node-cron")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const productRoutes = require("./routes/product.routes")
const investmentRoutes = require("./routes/investment.routes")
const withdrawalRoutes = require("./routes/withdrawal.routes")
const adminRoutes = require("./routes/admin.routes")

// Import cron jobs
const { calculateDailyReturns } = require("./cron/dailyReturns")

// Initialize express app
const app = express()

// Middleware
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
})
app.use("/api/", apiLimiter)

// Dans server.js du backend
app.use(cors({
  origin: ['https://votre-domaine-vercel.vercel.app', 'http://localhost:3000'],
  credentials: true
}))

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "InvestPro API",
      version: "1.0.0",
      description: "API documentation for InvestPro investment platform",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"],
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/investments", investmentRoutes)
app.use("/api/withdrawals", withdrawalRoutes)
app.use("/api/admin", adminRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  })
})

// Schedule cron jobs
// Run daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running daily returns calculation...")
    await calculateDailyReturns()
    console.log("Daily returns calculation completed successfully")
  } catch (error) {
    console.error("Error in daily returns calculation:", error)
  }
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB")
    // Start server
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

module.exports = app
