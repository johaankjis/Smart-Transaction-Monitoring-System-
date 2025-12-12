// Synthetic transaction data generator

import type { Transaction, TransactionChannel, MerchantCategory } from "@/lib/types/transaction"

const MERCHANT_CATEGORIES: MerchantCategory[] = [
  "Electronics",
  "Groceries",
  "Travel",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Restaurants",
  "Retail",
  "Services",
  "Other",
]

const CHANNELS: TransactionChannel[] = ["ONLINE", "POS", "ATM", "MOBILE", "WIRE"]

const COUNTRIES = ["US", "UK", "CA", "DE", "FR", "JP", "AU", "BR", "MX", "IN", "SG", "HK"]

const MERCHANT_NAMES: Record<MerchantCategory, string[]> = {
  Electronics: ["TechWorld", "ElectroMart", "GadgetHub", "ByteShop", "CircuitCity"],
  Groceries: ["FreshMart", "GreenGrocer", "SuperSave", "OrganicBest", "QuickStop"],
  Travel: ["SkyHigh Airlines", "GlobeTrek", "WanderlustHotels", "RoadRunner", "SeaBreeze Cruises"],
  Entertainment: ["CinemaMax", "GameZone", "StreamPlus", "LiveNation", "FunPark"],
  Utilities: ["PowerGrid", "WaterWorks", "GasConnect", "TeleCom Plus", "NetSpeed"],
  Healthcare: ["MediCare Plus", "PharmaDirect", "HealthFirst", "WellnessClinic", "DentalPro"],
  Restaurants: ["GourmetBite", "FastFeast", "CafeDeluxe", "SushiMaster", "PizzaPalace"],
  Retail: ["FashionFwd", "HomeStyle", "SportGear", "BookNook", "ToyLand"],
  Services: ["CleanPro", "FixIt", "BeautySpot", "AutoCare", "PetParadise"],
  Other: ["MiscMart", "GeneralStore", "LocalShop", "CornerStore", "QuickBuy"],
}

export class TransactionGenerator {
  private userIds: string[] = []
  private random: SeededRandom

  constructor(seed = 42) {
    this.random = new SeededRandom(seed)
    this.userIds = this.generateUserIds(500)
  }

  private generateUserIds(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `user_${String(i + 1).padStart(5, "0")}`)
  }

  generateTransactions(count: number, daysBack = 30): Transaction[] {
    const transactions: Transaction[] = []
    const now = new Date()

    for (let i = 0; i < count; i++) {
      const isAnomaly = this.random.next() < 0.05 // 5% anomalies
      transactions.push(this.generateTransaction(i, now, daysBack, isAnomaly))
    }

    return transactions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  private generateTransaction(index: number, now: Date, daysBack: number, isAnomaly: boolean): Transaction {
    const userId = this.userIds[Math.floor(this.random.next() * this.userIds.length)]
    const category = MERCHANT_CATEGORIES[Math.floor(this.random.next() * MERCHANT_CATEGORIES.length)]
    const channel = CHANNELS[Math.floor(this.random.next() * CHANNELS.length)]
    const country = COUNTRIES[Math.floor(this.random.next() * COUNTRIES.length)]
    const merchantNames = MERCHANT_NAMES[category]
    const merchantName = merchantNames[Math.floor(this.random.next() * merchantNames.length)]

    // Generate amount based on category with potential anomaly
    const amount = this.generateAmount(category, isAnomaly)

    // Generate timestamp
    const timestamp = new Date(now.getTime() - this.random.next() * daysBack * 24 * 60 * 60 * 1000)

    // Risk score based on whether it's an anomaly
    const riskScore = isAnomaly ? 0.7 + this.random.next() * 0.3 : this.random.next() * 0.5

    return {
      id: `tx_${String(index + 1).padStart(8, "0")}`,
      transactionId: `TXN${Date.now().toString(36).toUpperCase()}${String(index).padStart(5, "0")}`,
      userId,
      amount,
      merchantCategory: category,
      country,
      channel,
      timestamp,
      isFraud: isAnomaly ? this.random.next() < 0.6 : false,
      riskScore,
      isFlagged: riskScore >= 0.7,
      merchantName,
      ipAddress: this.generateIP(),
      deviceId: `device_${Math.floor(this.random.next() * 1000)}`,
    }
  }

  private generateAmount(category: MerchantCategory, isAnomaly: boolean): number {
    const baseAmounts: Record<MerchantCategory, [number, number]> = {
      Electronics: [50, 2000],
      Groceries: [10, 300],
      Travel: [100, 5000],
      Entertainment: [10, 200],
      Utilities: [50, 500],
      Healthcare: [20, 1000],
      Restaurants: [10, 200],
      Retail: [20, 500],
      Services: [30, 300],
      Other: [10, 200],
    }

    const [min, max] = baseAmounts[category]
    let amount = min + this.random.next() * (max - min)

    if (isAnomaly) {
      // Anomalous transactions are either very large or have unusual patterns
      const anomalyType = this.random.next()
      if (anomalyType < 0.7) {
        // Large amount anomaly
        amount = max * (3 + this.random.next() * 7) // 3x to 10x normal max
      } else {
        // Unusual small amount for category
        amount = min * 0.1
      }
    }

    return Math.round(amount * 100) / 100
  }

  private generateIP(): string {
    const octet = () => Math.floor(this.random.next() * 256)
    return `${octet()}.${octet()}.${octet()}.${octet()}`
  }
}

// Seeded random number generator for reproducible data
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    const x = Math.sin(this.seed++) * 10000
    return x - Math.floor(x)
  }
}
