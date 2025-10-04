#!/usr/bin/env node

/**
 * Official 2024 HKDSE Statistics CSV Processor
 * Processes the official HKDSE results tables into database format
 */

console.log('🚀 2024 HKDSE Official Statistics Processor');
console.log('============================================');

const fs = require('fs');
const path = require('path');

// Parse CSV with better handling for complex headers
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

  return lines.slice(1).map((line, index) => {
    const values = [];
    let currentValue = '';
    let inQuotes = false;

    // Handle CSV with embedded commas in quotes
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    const obj = { row_id: index + 1 };
    headers.forEach((header, index) => {
      let value = values[index] || '';
      value = value.replace(/"/g, '').trim();

      // Parse numbers and percentages
      if (value.endsWith('%')) {
        obj[header] = parseFloat(value.replace('%', ''));
        obj[header + '_type'] = 'percentage';
      } else if (!isNaN(Number(value.replace(/,/g, ''))) && value !== '' && !value.includes('/')) {
        obj[header] = Number(value.replace(/,/g, ''));
        obj[header + '_type'] = 'number';
      } else {
        obj[header] = value;
      }
    });

    return obj;
  }).filter(row => row['No.'] && row['No.'] !== ''); // Filter out empty rows
}

// Extract key statistics from the files
function extractKeyStatistics(files) {
  const statistics = {
    totalCandidates: null,
    coreSubjectPerformance: {},
    genderBreakdown: {},
    universityAdmission: {},
    topPerformers: {}
  };

  files.forEach(file => {
    const filename = path.basename(file, '.csv');
    console.log(`🔍 Extracting data from: ${filename}`);

    const csvContent = fs.readFileSync(file, 'utf-8');
    const data = parseCSV(csvContent);

    // Extract total candidates (usually in first row of most tables)
    const candidateRow = data.find(row => row['Description'] && row['Description'].includes('No. of candidates'));
    if (candidateRow && !statistics.totalCandidates) {
      statistics.totalCandidates = {
        daySchoolMale: candidateRow['Day school candidates - Male'] || candidateRow['Day school candidates taking at least five Category A / B subjects - Male'],
        daySchoolFemale: candidateRow['Day school candidates - Female'] || candidateRow['Day school candidates taking at least five Category A / B subjects - Female'],
        daySchoolTotal: candidateRow['Day school candidates - Total'] || candidateRow['Day school candidates taking at least five Category A / B subjects - Total'],
        allMale: candidateRow['All candidates - Male'] || candidateRow['All candidates taking at least five Category A / B subjects - Male'],
        allFemale: candidateRow['All candidates - Female'] || candidateRow['All candidates taking at least five Category A / B subjects - Female'],
        allTotal: candidateRow['All candidates - Total'] || candidateRow['All candidates taking at least five Category A / B subjects - Total']
      };
    }

    // Extract university admission requirements (332A performance)
    if (filename.includes('table3a')) {
      const universityRow = data.find(row =>
        row['Description'] && row['Description'].includes('Level 2+ in Chinese Language, English Language and Mathematics')
      );
      if (universityRow) {
        statistics.universityAdmission = {
          daySchoolMale: universityRow['Day school candidates taking at least five Category A / B subjects - Male'],
          daySchoolFemale: universityRow['Day school candidates taking at least five Category A / B subjects - Female'],
          daySchoolTotal: universityRow['Day school candidates taking at least five Category A / B subjects - Total'],
          allMale: universityRow['All candidates taking at least five Category A / B subjects - Male'],
          allFemale: universityRow['All candidates taking at least five Category A / B subjects - Female'],
          allTotal: universityRow['All candidates taking at least five Category A / B subjects - Total']
        };
      }
    }

    // Extract top performers (5** statistics)
    if (filename.includes('table3b')) {
      const fiveStarStarRow = data.find(row =>
        row['Description'] && row['Description'].includes('Five level 5**')
      );
      if (fiveStarStarRow) {
        statistics.topPerformers.fiveStarStar = {
          daySchoolMale: fiveStarStarRow['Day school candidates taking at least five Category A / B subjects - Male'],
          daySchoolFemale: fiveStarStarRow['Day school candidates taking at least five Category A / B subjects - Female'],
          daySchoolTotal: fiveStarStarRow['Day school candidates taking at least five Category A / B subjects - Total'],
          allMale: fiveStarStarRow['All candidates taking at least five Category A / B subjects - Male'],
          allFemale: fiveStarStarRow['All candidates taking at least five Category A / B subjects - Female'],
          allTotal: fiveStarStarRow['All candidates taking at least five Category A / B subjects - Total']
        };
      }
    }
  });

  return statistics;
}

// Generate SQL for key insights
function generateInsightSQL(statistics) {
  const sqlStatements = [];

  // Clear existing insights
  sqlStatements.push('DELETE FROM dse_insights WHERE insight_type LIKE "2024_%";');

  if (statistics.totalCandidates) {
    const total = statistics.totalCandidates.allTotal;
    const daySchoolTotal = statistics.totalCandidates.daySchoolTotal;
    const privateTotal = total - daySchoolTotal;

    sqlStatements.push(`INSERT INTO dse_insights (insight_type, title, description, value) VALUES
('2024_total_candidates', 'Total 2024 DSE Candidates', 'Total number of candidates who sat for DSE 2024', ${total}),
('2024_day_school_candidates', '2024 Day School Candidates', 'Number of day school candidates in DSE 2024', ${daySchoolTotal}),
('2024_private_candidates', '2024 Private Candidates', 'Number of private candidates in DSE 2024', ${privateTotal});`);
  }

  if (statistics.universityAdmission && statistics.universityAdmission.allTotal) {
    const rate = ((statistics.universityAdmission.allTotal / statistics.totalCandidates.allTotal) * 100).toFixed(1);
    sqlStatements.push(`INSERT INTO dse_insights (insight_type, title, description, value) VALUES
('2024_university_eligibility', '2024 University Admission Eligibility Rate', 'Percentage of candidates meeting basic university requirements (332A)', ${rate});`);
  }

  if (statistics.topPerformers.fiveStarStar && statistics.topPerformers.fiveStarStar.allTotal) {
    const rate = ((statistics.topPerformers.fiveStarStar.allTotal / statistics.totalCandidates.allTotal) * 100).toFixed(3);
    sqlStatements.push(`INSERT INTO dse_insights (insight_type, title, description, value) VALUES
('2024_top_performers', '2024 Top Performers (5** in 5 subjects)', 'Percentage of candidates achieving 5** in five subjects', ${rate});`);
  }

  return sqlStatements.join('\n\n');
}

// Generate summary statistics table
function generateSummarySQL(statistics) {
  if (!statistics.totalCandidates) return '';

  const year = 2024;
  const insertSQL = `INSERT INTO dse_registration (year, category, gender, subject_code, subject_name, registered_candidates, sat_for_exam, attendance_rate) VALUES
(${year}, 'day_school', 'male', 'ALL', 'All Subjects', ${statistics.totalCandidates.daySchoolMale}, ${statistics.totalCandidates.daySchoolMale}, 100.0),
(${year}, 'day_school', 'female', 'ALL', 'All Subjects', ${statistics.totalCandidates.daySchoolFemale}, ${statistics.totalCandidates.daySchoolFemale}, 100.0),
(${year}, 'private', 'male', 'ALL', 'All Subjects', ${statistics.totalCandidates.allMale - statistics.totalCandidates.daySchoolMale}, ${statistics.totalCandidates.allMale - statistics.totalCandidates.daySchoolMale}, 100.0),
(${year}, 'private', 'female', 'ALL', 'All Subjects', ${statistics.totalCandidates.allFemale - statistics.totalCandidates.daySchoolFemale}, ${statistics.totalCandidates.allFemale - statistics.totalCandidates.daySchoolFemale}, 100.0);`;

  return insertSQL;
}

// Main processing
const csvDir = './data/csv';
const outputDir = './database/imports';

try {
  if (!fs.existsSync(csvDir)) {
    console.log(`❌ CSV directory not found: ${csvDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(csvDir)
    .filter(f => f.endsWith('.csv'))
    .map(f => path.join(csvDir, f));

  if (files.length === 0) {
    console.log('⚠️  No CSV files found');
    process.exit(0);
  }

  console.log(`📊 Processing ${files.length} HKDSE statistics files...`);

  // Extract key statistics
  const statistics = extractKeyStatistics(files);

  console.log('\n📈 Extracted Statistics:');
  console.log(`   Total Candidates: ${statistics.totalCandidates?.allTotal || 'N/A'}`);
  console.log(`   Day School: ${statistics.totalCandidates?.daySchoolTotal || 'N/A'}`);
  console.log(`   University Eligible: ${statistics.universityAdmission?.allTotal || 'N/A'}`);
  console.log(`   Top Performers (5**×5): ${statistics.topPerformers.fiveStarStar?.allTotal || 'N/A'}`);

  // Generate SQL
  const sqlStatements = [];
  const header = `-- DSE 2024 Official Statistics Import\n-- Generated on ${new Date().toISOString()}\n-- Source: Official HKDSE Results Statistics Tables\n\n`;

  // Add insights
  const insightSQL = generateInsightSQL(statistics);
  if (insightSQL) {
    sqlStatements.push('-- Key Insights and Statistics');
    sqlStatements.push(insightSQL);
  }

  // Add registration summary
  const summarySQL = generateSummarySQL(statistics);
  if (summarySQL) {
    sqlStatements.push('-- Registration Summary Data');
    sqlStatements.push(summarySQL);
  }

  if (sqlStatements.length > 0) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'official_2024_hkdse_statistics.sql');
    const fullSQL = header + sqlStatements.join('\n\n');

    fs.writeFileSync(outputPath, fullSQL);

    console.log('\n✅ Processing completed!');
    console.log(`📄 SQL file: ${outputPath}`);
    console.log(`📊 Statistics extracted and converted to SQL`);

    console.log('\n🔧 Next steps:');
    console.log('1. Review the generated SQL file');
    console.log('2. Run the preparation script: database/migrations/prepare_for_2024_data.sql');
    console.log('3. Execute the generated statistics SQL');
    console.log('4. Verify the imported insights and data');
  } else {
    console.log('\n⚠️  No SQL statements generated');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}