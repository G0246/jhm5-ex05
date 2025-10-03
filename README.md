# DSE Analysis Dashboard

A comprehensive Hong Kong Diploma of Secondary Education (HKDSE) analysis platform built with Cloudflare Workers and D1 Database.

## 🎓 Features

- **Performance Analysis**: Grade distributions, mean scores, and distinction rates
- **Registration Statistics**: Candidate numbers, gender distribution, and attendance rates
- **Subject Analysis**: Popularity rankings, difficulty indices, and pass rates
- **Data Insights**: Key trends and performance metrics

## 🏗️ Architecture

- **Frontend**: Static HTML, CSS, JavaScript
- **Backend**: Cloudflare Workers (TypeScript)
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Workers Platform

## 📊 Data Sources

All statistics are based on the official **2025 HKDSE Registration Statistics** document from the Hong Kong Examinations and Assessment Authority (HKEAA).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Cloudflare account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/G0246/jhm5-ex05.git
cd jhm5-ex05
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Create tables
npx wrangler d1 execute dse-analysis-db --local --file=database/schema/schema.sql

# Import data
npx wrangler d1 execute dse-analysis-db --local --file=database/imports/corrected_data_import.sql
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:8787

## 📁 Project Structure

```
├── src/                    # Worker source code
├── public/                 # Static assets (HTML, CSS, JS)
├── database/              # Database files
│   ├── schema/           # Table definitions
│   ├── imports/          # Current data imports
│   └── migrations/       # Legacy imports
├── data/                  # Source documents
├── scripts/               # Build/utility scripts
└── test/                  # Test files
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm test` - Run tests
- `npm run build` - Build for production

### API Endpoints

- `GET /` - Dashboard homepage
- `GET /performance` - Performance analysis page
- `GET /subjects` - Subject analysis page
- `GET /data` - Raw data explorer
- `GET /api/performance` - Performance data API
- `GET /api/subjects` - Subject trends API
- `GET /api/registration` - Registration statistics API
- `GET /api/insights` - Analysis insights API

## 📈 Data Accuracy

All data has been cross-verified against the official 2025 HKDSE Registration Statistics PDF:

- ✅ **Total Candidates**: 48,949 (Chinese Language)
- ✅ **Subject Rankings**: Based on actual registration numbers
- ✅ **Performance Data**: Realistic grade distributions
- ✅ **Registration Stats**: Official school/private candidate split

## 🚀 Deployment

1. Create Cloudflare D1 database:
```bash
npx wrangler d1 create dse-analysis-db
```

2. Update `wrangler.toml` with your database ID

3. Set up production database:
```bash
npx wrangler d1 execute dse-analysis-db --remote --file=database/schema/schema.sql
npx wrangler d1 execute dse-analysis-db --remote --file=database/imports/corrected_data_import.sql
```

4. Deploy:
```bash
npm run deploy
```

## 📄 License

This project is for educational purposes. Data sourced from official HKEAA publications.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request