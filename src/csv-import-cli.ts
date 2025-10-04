#!/usr/bin/env node

/**
 * CLI tool for importing CSV data into DSE database
 * Usage: npm run import-csv [year]
 */

import { importCSVData } from './csv-import';
import { writeFileSync } from 'fs';
import { join } from 'path';

const year = process.argv[2] ? parseInt(process.argv[2]) : 2024;

console.log(`🚀 DSE ${year} CSV Import Tool`);
console.log('================================');

try {
  const csvDir = './data/csv';
  const statements = importCSVData(csvDir, year);

  if (statements.length > 0) {
    // Write SQL to import file
    const outputPath = join('./database/imports', `csv_import_${year}.sql`);
    const header = `-- DSE ${year} Data Import from CSV\n-- Generated on ${new Date().toISOString()}\n-- Import tool: csv-import-cli.ts\n\n`;
    const fullSQL = header + statements.join('\n\n');

    writeFileSync(outputPath, fullSQL);

    console.log('\n✅ Import completed successfully!');
    console.log(`📁 SQL file generated: ${outputPath}`);
    console.log(`📊 Total statements: ${statements.length}`);

    console.log('\n🔧 Next steps:');
    console.log('1. Review the generated SQL file');
    console.log('2. Execute the SQL against your database');
    console.log('3. Verify the imported data');

  } else {
    console.log('\n⚠️  No CSV files found in data/csv directory');
    console.log('📋 Expected files:');
    console.log('   - dse_performance_2024.csv');
    console.log('   - dse_registration_2024.csv');
    console.log('   - dse_search_interest_2024.csv');
    console.log('   - subject_trends_2024.csv');
    console.log('\n💡 Check data/csv/README.md for file format details');
  }

} catch (error) {
  console.error('\n❌ Import failed:', error);
  console.log('\n🔍 Troubleshooting:');
  console.log('1. Check that CSV files exist in data/csv directory');
  console.log('2. Verify CSV format matches expected structure');
  console.log('3. Ensure file encoding is UTF-8');
  console.log('4. Check for proper comma separation and headers');
  process.exit(1);
}