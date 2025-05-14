const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// Import models
const User = require("./models/user.model")
const Product = require("./models/product.model")

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany()
    await Product.deleteMany()

    console.log("Data cleared...")

    // Create admin user
    const adminPassword = "admin123"
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(adminPassword, salt)

    await User.create({
      phone: "+33123456789",
      password: hashedPassword,
      isAdmin: true,
      level: "platinum",
      balance: {
        total: 10000,
        invested: 0,
        available: 10000,
      },
    })

    console.log("Admin user created...")

    // Create products
    const products = [
      {
        name: "Plan Bronze",
        description: "Plan d'investissement idéal pour débuter",
        price: 1000,
        returnRate: 0.005, // 0.5%
        duration: 90,
        level: "bronze",
        features: [
          "Rendement journalier de 0.5%",
          "Durée de 90 jours",
          "Retrait possible à tout moment",
          "Support client standard",
        ],
      },
      {
        name: "Plan Argent",
        description: "Plan d'investissement intermédiaire avec un bon rendement",
        price: 2500,
        returnRate: 0.006, // 0.6%
        duration: 90,
        level: "silver",
        features: [
          "Rendement journalier de 0.6%",
          "Durée de 90 jours",
          "Retrait possible à tout moment",
          "Support client prioritaire",
          "Bonus de parrainage amélioré",
        ],
      },
      {
        name: "Plan Or",
        description: "Plan d'investissement premium avec un rendement élevé",
        price: 5000,
        returnRate: 0.007, // 0.7%
        duration: 90,
        level: "gold",
        features: [
          "Rendement journalier de 0.7%",
          "Durée de 90 jours",
          "Retrait possible à tout moment",
          "Support prioritaire",
          "Bonus de parrainage amélioré",
          "Accès aux événements exclusifs",
        ],
      },
      {
        name: "Plan Platine",
        description: "Plan d'investissement exclusif avec le meilleur rendement",
        price: 10000,
        returnRate: 0.008, // 0.8%
        duration: 90,
        level: "platinum",
        features: [
          "Rendement journalier de 0.8%",
          "Durée de 90 jours",
          "Retrait possible à tout moment",
          "Support VIP 24/7",
          "Bonus de parrainage maximum",
          "Accès aux événements exclusifs",
          "Conseiller personnel",
        ],
      },
    ]

    await Product.insertMany(products)

    console.log("Products created...")
    console.log("Database seeded successfully!")
    process.exit()
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
