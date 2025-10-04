#!/usr/bin/env node

/**
 * Enhanced HKDSE 2024 Subject Performance Extractor
 * Extracts detailed subject performance data from cross-tabulation tables
 */

console.log('📚 HKDSE 2024 Subject Performance Extractor');
console.log('===========================================');

const fs = require('fs');
const path = require('path');

// Parse CSV with better handling
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

  return lines.slice(1).map((line, index) => {
    const values = [];
    let currentValue = '';
    let inQuotes = false;

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

      if (value.endsWith('%')) {
        obj[header] = parseFloat(value.replace('%', ''));
        obj[header + '_type'] = 'percentage';
      } else if (!isNaN(Number(value.replace(/,/g, ''))) && value !== '' && !value.includes('/')) {
        obj[header] = Number(value.replace(/,/g, ''));
      } else {
        obj[header] = value;
      }
    });

    return obj;
  }).filter(row => row['No.'] && row['No.'] !== '');
}

// Extract core subject performance from cross-tabulation tables
function extractCoreSubjectPerformance(files) {
  const subjects = {
    chinese: { code: 'CHIN', name: 'Chinese Language', levels: {} },
    english: { code: 'ENGL', name: 'English Language', levels: {} },
    mathematics: { code: 'MATH', name: 'Mathematics Compulsory Part', levels: {} },
    mathsExtended: { code: 'M1M2', name: 'Mathematics Extended Part', levels: {} }
  };

  // Process Chinese-English cross-tabulation (table3i)
  const chineseEnglishFile = files.find(f => f.includes('table3i'));
  if (chineseEnglishFile) {
    console.log('📊 Processing Chinese-English cross-tabulation...');
    const data = parseCSV(fs.readFileSync(chineseEnglishFile, 'utf-8'));

    // Extract Chinese Language totals from row totals
    const chineseLevels = ['5**', '5*', '5', '4', '3', '2', '1', 'U'];
    chineseLevels.forEach(level => {
      const row = data.find(r => r['Attainment in Chinese Language'] === level);
      if (row && row['Total']) {
        subjects.chinese.levels[level] = row['Total'];
      }
    });

    // Extract English Language totals from column headers (sum each column)
    const englishColumns = data[0] ? Object.keys(data[0]).filter(k => k.includes('Attainment in English Language -')) : [];
    englishColumns.forEach(col => {
      const level = col.split(' - ')[1];
      if (level && chineseLevels.includes(level)) {
        subjects.english.levels[level] = data.reduce((sum, row) => sum + (row[col] || 0), 0);
      }
    });
  }

  // Process Mathematics cross-tabulation (table3j)
  const mathFile = files.find(f => f.includes('table3j'));
  if (mathFile) {
    console.log('📊 Processing Mathematics cross-tabulation...');
    const data = parseCSV(fs.readFileSync(mathFile, 'utf-8'));

    // Extract Mathematics Compulsory totals
    const mathLevels = ['5**', '5*', '5', '4', '3', '2', '1', 'U'];
    mathLevels.forEach(level => {
      const row = data.find(r => r['Attainment in Mathematics Compulsory Part'] === level);
      if (row && row['Total']) {
        subjects.mathematics.levels[level] = row['Total'];
      }
    });

    // Extract Extended Math totals
    const extendedColumns = data[0] ? Object.keys(data[0]).filter(k => k.includes('Attainment in Mathematics Extended Part -')) : [];
    extendedColumns.forEach(col => {
      const level = col.split(' - ')[1];
      if (level && mathLevels.includes(level)) {
        subjects.mathsExtended.levels[level] = data.reduce((sum, row) => sum + (row[col] || 0), 0);
      }
    });
  }

  return subjects;
}

// Generate performance SQL
function generatePerformanceSQL(subjects, year = 2024) {
  const statements = [];

  // Clear existing 2024 performance data
  statements.push(`DELETE FROM dse_performance WHERE year = ${year};`);

  Object.values(subjects).forEach(subject => {
    const levels = subject.levels;
    if (Object.keys(levels).length > 0) {
      const totalCandidates = Object.values(levels).reduce((sum, count) => sum + count, 0);

      if (totalCandidates > 0) {
        const insertSQL = `INSERT INTO dse_performance (year, subject_code, subject_name, total_candidates, level_5_star_star, level_5_star, level_5, level_4, level_3, level_2, level_1, unclassified, mean_score, standard_deviation) VALUES
(${year}, '${subject.code}', '${subject.name}', ${totalCandidates}, ${levels['5**'] || 0}, ${levels['5*'] || 0}, ${levels['5'] || 0}, ${levels['4'] || 0}, ${levels['3'] || 0}, ${levels['2'] || 0}, ${levels['1'] || 0}, ${levels['U'] || 0}, 0, 0);`;

        statements.push(insertSQL);

        console.log(`   ✅ ${subject.name}: ${totalCandidates} candidates`);
        console.log(`      5**: ${levels['5**'] || 0}, 5*: ${levels['5*'] || 0}, 5: ${levels['5'] || 0}`);
      }
    }
  });

  return statements.join('\n\n');
}

// Extract additional statistics
function extractAdditionalStats(files) {
  const stats = {
    universityEligibility: {},
    topPerformers: {},
    gradeDistribution: {}
  };

  // From table3a - university eligibility
  const table3a = files.find(f => f.includes('table3a'));
  if (table3a) {
    const data = parseCSV(fs.readFileSync(table3a, 'utf-8'));
    const eligibilityRow = data.find(r =>
      r.Description && r.Description.includes('Level 2+ in Chinese Language, English Language and Mathematics')
    );
    if (eligibilityRow) {
      stats.universityEligibility = {
        total: eligibilityRow['All candidates taking at least five Category A / B subjects - Total'],
        percentage: eligibilityRow['All candidates taking at least five Category A / B subjects - Total'] // Will calculate percentage later
      };
    }
  }

  return stats;
}

// Main processing
const csvDir = './data/csv';
const outputDir = './database/imports';

try {
  const files = fs.readdirSync(csvDir)
    .filter(f => f.endsWith('.csv'))
    .map(f => path.join(csvDir, f));

  console.log(`📊 Processing ${files.length} files for subject performance data...`);

  // Extract subject performance
  const subjects = extractCoreSubjectPerformance(files);

  console.log('\n📈 Extracted Subject Performance:');
  Object.values(subjects).forEach(subject => {
    const total = Object.values(subject.levels).reduce((sum, count) => sum + count, 0);
    if (total > 0) {
      console.log(`   ${subject.name} (${subject.code}): ${total} candidates`);
    }
  });

  // Generate SQL
  const performanceSQL = generatePerformanceSQL(subjects, 2024);

  if (performanceSQL) {
    const header = `-- DSE 2024 Subject Performance Data\n-- Generated on ${new Date().toISOString()}\n-- Extracted from official HKDSE cross-tabulation tables\n\n`;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'subject_performance_2024.sql');
    const fullSQL = header + performanceSQL;

    fs.writeFileSync(outputPath, fullSQL);

    console.log('\n✅ Subject performance extraction completed!');
    console.log(`📄 SQL file: ${outputPath}`);
  } else {
    console.log('\n⚠️  No subject performance data extracted');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}