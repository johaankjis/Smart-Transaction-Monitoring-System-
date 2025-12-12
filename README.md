# FraudShield - Smart Transaction Monitoring System

A real-time fraud detection and transaction monitoring system powered by advanced machine learning algorithms. This system provides comprehensive anomaly detection, risk scoring, and alerting capabilities for financial transactions.

## 🚀 Features

- **Real-time Fraud Detection**: Instant analysis and risk scoring of financial transactions
- **Advanced ML Algorithms**: Ensemble model combining multiple detection techniques
  - Z-Score Anomaly Detection
  - Isolation Forest
  - Velocity Tracking
  - Geographic Risk Scoring
- **Interactive Dashboard**: Modern, responsive UI for monitoring transactions and analytics
- **Comprehensive Analytics**: Real-time metrics, charts, and visualizations
- **Risk-Based Alerts**: Automated alert system for high-risk transactions
- **Model Management**: View model metadata and retrain capabilities
- **Multi-Channel Support**: Monitor transactions across ONLINE, POS, ATM, MOBILE, and WIRE channels

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization
- **SWR** - Data fetching and caching
- **Lucide React** - Icon library

### Backend & Data Processing
- **Next.js API Routes** - Serverless API endpoints
- **Custom ML Algorithms** - In-house fraud detection models
- **Synthetic Data Generation** - Transaction data simulation

### Development Tools
- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 📊 Architecture Overview

### Machine Learning Pipeline

The fraud detection system uses an ensemble approach combining multiple detection algorithms:

1. **Z-Score Detector** (35% weight)
   - Statistical anomaly detection based on standard deviations
   - Threshold: 2.5 standard deviations

2. **Isolation Forest Detector** (45% weight)
   - Tree-based anomaly detection
   - 50 trees with sample size of 128
   - Anomaly threshold: 0.6

3. **Velocity Tracker** (10% weight)
   - Monitors transaction frequency per user
   - Detects unusual transaction patterns

4. **Geographic Risk Scorer** (10% weight)
   - Identifies high-risk countries
   - Flags rare geographic locations

### Core Components

```
├── Transaction Processor
│   └── Validates and scores transactions
├── Analytics Engine
│   └── Generates metrics and insights
├── Alert Manager
│   └── Monitors and triggers alerts
└── Fraud Detection Store
    └── Centralized state management
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ or higher
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/johaankjis/Smart-Transaction-Monitoring-System-.git
cd Smart-Transaction-Monitoring-System-
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
pnpm build
pnpm start
# or
npm run build
npm start
```

## 📖 Usage

### Dashboard Overview

The main dashboard provides:
- **Total Transactions**: Count of all processed transactions
- **Flagged Transactions**: Number of high-risk transactions
- **Total Volume**: Sum of transaction amounts
- **Average Risk Score**: Mean risk score across all transactions

### Viewing Transactions

Navigate to different sections:
- **Overview**: Main dashboard with real-time analytics
- **Transactions**: Detailed transaction list with filtering
- **Flagged**: High-risk transactions requiring review
- **Alerts**: Critical alerts and notifications
- **Users**: User-specific transaction patterns
- **Model**: ML model details and retraining options
- **Settings**: System configuration

### Risk Levels

Transactions are categorized into risk levels:
- 🟢 **LOW** (0-0.25): Normal transaction
- 🟡 **MEDIUM** (0.25-0.50): Slightly elevated risk
- 🟠 **HIGH** (0.50-0.75): High risk, requires attention
- 🔴 **CRITICAL** (0.75-1.0): Severe risk, immediate action required

## 🔌 API Endpoints

### Transactions
- `GET /api/transactions` - Fetch transactions with filtering options
  - Query params: `type`, `limit`, `userId`
- `POST /api/transactions` - Score a new transaction

### Metrics
- `GET /api/metrics` - Get dashboard metrics and analytics

### Model
- `GET /api/model` - Retrieve model metadata
- `POST /api/model` - Retrain the fraud detection model

### Users
- `GET /api/users` - List all users
- `GET /api/users/[userId]` - Get user-specific data and risk summary

## 🧠 Fraud Detection Algorithms

### Ensemble Detector

The system uses an ensemble approach to combine multiple detection methods:

**Feature Engineering:**
- Transaction amount normalization
- Temporal features (hour, day of week)
- Categorical encoding (channel, country, merchant category)
- User behavior patterns

**Anomaly Factors:**
- `UNUSUAL_AMOUNT`: Transaction amount significantly deviates from norm
- `HIGH_VELOCITY`: Rapid succession of transactions
- `HIGH_RISK_COUNTRY`: Transaction from flagged country
- `RARE_COUNTRY`: Transaction from infrequently seen location
- `UNUSUAL_CHANNEL`: Uncommon payment method for user
- `UNUSUAL_TIME`: Transaction at atypical time

### Model Training

The model is trained on historical transaction data:
- Default: 5,000 synthetic transactions over 30 days
- Supports retraining with new data
- Maintains model versioning and metadata

## 📁 Project Structure

```
Smart-Transaction-Monitoring-System-/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── metrics/              # Analytics endpoints
│   │   ├── model/                # Model management
│   │   ├── transactions/         # Transaction endpoints
│   │   └── users/                # User endpoints
│   ├── alerts/                   # Alerts page
│   ├── flagged/                  # Flagged transactions page
│   ├── model/                    # Model details page
│   ├── settings/                 # Settings page
│   ├── transactions/             # Transactions list page
│   ├── users/                    # Users page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Dashboard homepage
├── components/                   # React components
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── charts/              # Chart components
│   │   ├── header.tsx           # Page header
│   │   ├── sidebar.tsx          # Navigation sidebar
│   │   ├── stats-card.tsx       # Metric cards
│   │   └── transaction-table.tsx # Transaction data table
│   ├── ui/                      # Reusable UI components
│   └── theme-provider.tsx       # Theme management
├── lib/                         # Core libraries
│   ├── classes/                 # Business logic classes
│   │   ├── alert-manager.ts    # Alert handling
│   │   ├── analytics-engine.ts # Analytics computation
│   │   ├── base-anomaly-detector.ts # Detector base class
│   │   ├── ensemble-detector.ts # Ensemble ML model
│   │   ├── isolation-forest-detector.ts # Isolation Forest
│   │   ├── transaction-processor.ts # Transaction processing
│   │   └── z-score-detector.ts # Z-Score detection
│   ├── data/                   # Data utilities
│   │   └── transaction-generator.ts # Synthetic data
│   ├── store/                  # State management
│   │   └── fraud-detection-store.ts # Global store
│   ├── types/                  # TypeScript types
│   │   ├── analytics.ts        # Analytics types
│   │   ├── model.ts            # Model types
│   │   ├── transaction.ts      # Transaction types
│   │   └── user.ts             # User types
│   └── utils.ts                # Utility functions
├── public/                      # Static assets
├── styles/                      # Global styles
├── components.json             # shadcn/ui configuration
├── next.config.mjs             # Next.js configuration
├── package.json                # Dependencies
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## 🔧 Development

### Running Linter

```bash
pnpm lint
# or
npm run lint
```

### Code Style

This project follows modern TypeScript and React best practices:
- Functional components with hooks
- TypeScript strict mode enabled
- Component composition patterns
- Separation of concerns (UI, logic, data)

### Adding New Features

1. Define types in `lib/types/`
2. Implement business logic in `lib/classes/`
3. Create API routes in `app/api/`
4. Build UI components in `components/`
5. Add pages in `app/`

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript for all new code
- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

## 📝 License

This project is private and proprietary. All rights reserved.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

For support, issues, or feature requests, please open an issue in the GitHub repository.

---

**Note**: This system uses synthetic data for demonstration purposes. In a production environment, connect to real transaction data sources and implement appropriate security measures.
