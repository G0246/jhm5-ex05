# Database Files

This directory contains all database-related files for the DSE Analysis project.

## Structure

### `/schema/`
Contains the database schema definitions:
- `schema.sql` - Main database schema with table definitions

### `/imports/`
Contains current/active data import scripts:
- `corrected_data_import.sql` - **CURRENT** - Corrected data based on official 2025 HKDSE PDF statistics
- `performance_data_import.sql` - Performance and registration data import script

### `/migrations/`
Contains legacy/historical import scripts:
- `complete_data_import.sql` - Legacy complete data import
- `data_import.sql` - Original data import script

## Usage

### Setting Up the Database
```bash
# Create tables
npx wrangler d1 execute dse-analysis-db --local --file=database/schema/schema.sql

# Import current data
npx wrangler d1 execute dse-analysis-db --local --file=database/imports/corrected_data_import.sql
```

### Production Database
```bash
# For remote database, add --remote flag
npx wrangler d1 execute dse-analysis-db --remote --file=database/schema/schema.sql
npx wrangler d1 execute dse-analysis-db --remote --file=database/imports/corrected_data_import.sql

# Deploy the worker after database setup
npm run deploy
```

### Verifying Database Setup
```bash
# Check local database
npx wrangler d1 execute dse-analysis-db --local --command="SELECT COUNT(*) as count FROM dse_performance"

# Check remote database
npx wrangler d1 execute dse-analysis-db --remote --command="SELECT COUNT(*) as count FROM dse_performance"

# View sample data
npx wrangler d1 execute dse-analysis-db --remote --command="SELECT subject_name, total_candidates FROM dse_performance ORDER BY total_candidates DESC LIMIT 5"
```

## Data Sources

The current data in `corrected_data_import.sql` is based on the official **2025 HKDSE Registration Statistics** PDF document located in `/data/2025_HKDSE_registration_statistics.pdf`.

All candidate numbers, subject popularity rankings, and registration statistics have been verified against this official document.