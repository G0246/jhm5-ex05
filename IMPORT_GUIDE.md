# DSE 2024 Data Import Guide

This guide explains how to import 2024 DSE data from CSV files into the database.

## 📁 File Structure

```
data/csv/                           # CSV files directory
├── README.md                       # Format specifications
├── dse_performance_2024.csv        # Performance/results data
├── dse_registration_2024.csv       # Registration statistics
├── dse_search_interest_2024.csv    # Search trend data
├── subject_trends_2024.csv         # Subject analysis data
└── *_template.csv                  # Example file formats

database/imports/                   # SQL import files
├── csv_import_2024.sql            # Generated import script
└── prepare_for_2024_data.sql      # Data cleanup script

src/                               # Import utilities
├── csv-import.ts                  # TypeScript utility functions
└── csv-import-cli.ts              # CLI import tool

csv-to-sql.js                      # Simple Node.js converter
```

## 🚀 Quick Start

### Method 1: Simple Node.js Script (Recommended)

1. **Place your CSV files** in `data/csv/` directory
2. **Run the converter**:
   ```bash
   node csv-to-sql.js
   ```
3. **Check the output** in `database/imports/csv_import_2024.sql`
4. **Execute the SQL** in your database

### Method 2: TypeScript Utilities

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Use the import tool**:
   ```bash
   npm run import-csv 2024
   ```

## 📊 CSV File Formats

### Performance Data (`dse_performance_2024.csv`)

```csv
subject_code,subject_name,total_candidates,level_5_star_star,level_5_star,level_5,level_4,level_3,level_2,level_1,unclassified,mean_score,standard_deviation
CHIN,Chinese Language,48000,240,950,4300,9500,14000,12500,5800,250,3.2,1.1
ENGL,English Language,50000,400,1500,6000,11000,14000,11500,5000,220,3.3,1.2
```

**Required columns:**
- `subject_code`: Subject code (e.g., CHIN, ENGL, MATH)
- `subject_name`: Full subject name
- `total_candidates`: Total number of candidates
- `level_5_star_star` through `unclassified`: Grade distribution

**Optional columns:**
- `mean_score`: Average score
- `standard_deviation`: Score standard deviation

### Registration Data (`dse_registration_2024.csv`)

```csv
category,gender,subject_code,subject_name,registered_candidates,sat_for_exam,attendance_rate
day_school,male,CORE,Core Subjects,22000,21800,99.1
day_school,female,CORE,Core Subjects,23000,22800,99.1
```

### Search Interest Data (`dse_search_interest_2024.csv`)

```csv
date,search_interest
2024-03-30,100
2024-04-07,96
2024-04-14,72
```

### Subject Trends (`subject_trends_2024.csv`)

```csv
subject_code,subject_name,popularity_rank,difficulty_index,pass_rate,distinction_rate
BIOL,Biology,1,7.2,83.4,35.9
CHEM,Chemistry,2,7.8,82.1,38.6
```

## 🔧 Database Preparation

Before importing new data, clean up existing 2025 data:

```bash
# Execute the cleanup script
sqlite3 your_database.db < database/migrations/prepare_for_2024_data.sql
```

This will:
- Remove 2025 data from all tables
- Clear search interest and insights data
- Prepare for fresh 2024 import

## 📝 Import Process

### Step 1: Prepare CSV Files

1. Export your 2024 DSE data to CSV format
2. Ensure files follow the naming convention:
   - `dse_performance_2024.csv`
   - `dse_registration_2024.csv`
   - `dse_search_interest_2024.csv`
   - `subject_trends_2024.csv`
3. Place files in `data/csv/` directory
4. Verify formats match the templates

### Step 2: Generate SQL

Run the conversion script:

```bash
node csv-to-sql.js
```

This creates `database/imports/csv_import_2024.sql` with all INSERT statements.

### Step 3: Execute Import

```bash
# For SQLite
sqlite3 your_database.db < database/imports/csv_import_2024.sql

# For other databases, use appropriate client
```

### Step 4: Verify Import

Check that data was imported correctly:

```sql
SELECT 'Performance' as table_name, COUNT(*) as records FROM dse_performance WHERE year = 2024
UNION ALL
SELECT 'Registration', COUNT(*) FROM dse_registration WHERE year = 2024
UNION ALL
SELECT 'Search Interest', COUNT(*) FROM dse_statistics
UNION ALL
SELECT 'Subject Trends', COUNT(*) FROM subject_trends WHERE year = 2024;
```

## 🛠️ Troubleshooting

### Common Issues

**CSV Parse Errors:**
- Check for proper comma separation
- Ensure UTF-8 encoding
- Verify no missing commas in data rows
- Check for quotes around text containing commas

**Missing Files:**
- Verify file names match expected patterns
- Check file permissions
- Ensure files are in correct directory

**SQL Execution Errors:**
- Verify database schema exists
- Check for data type mismatches
- Ensure required columns are present

### Data Validation

After import, validate your data:

```sql
-- Check for reasonable candidate numbers
SELECT subject_code, total_candidates
FROM dse_performance
WHERE year = 2024 AND (total_candidates < 100 OR total_candidates > 100000);

-- Verify grade distributions add up
SELECT subject_code,
       total_candidates,
       (level_5_star_star + level_5_star + level_5 + level_4 + level_3 + level_2 + level_1 + unclassified) as sum_levels
FROM dse_performance
WHERE year = 2024 AND total_candidates != sum_levels;

-- Check attendance rates are reasonable
SELECT * FROM dse_registration
WHERE year = 2024 AND (attendance_rate < 50 OR attendance_rate > 100);
```

## 📈 Next Steps

After successful import:

1. **Update frontend code** to display 2024 data instead of 2025
2. **Regenerate insights** based on 2024 data
3. **Update documentation** and labels to reflect 2024
4. **Test all visualizations** with new data
5. **Archive old PDF files** and update with 2024 documents

## 🤝 Support

If you encounter issues:

1. Check the console output for specific error messages
2. Verify CSV file formats against templates
3. Ensure database schema is up to date
4. Check file permissions and paths

The import utilities are designed to be flexible and handle various CSV formats while providing clear error messages when issues occur.