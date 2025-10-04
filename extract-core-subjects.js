#!/usr/bin/env node

/**
 * Accurate HKDSE 2024 Core Subjects Performance Extractor
 * Extracts correct performance data from cross-tabulation tables
 */

console.log('🎯 HKDSE 2024 Core Subjects - Accurate Performance Data');
console.log('====================================================');

const fs = require('fs');
const path = require('path');

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

      if (!isNaN(Number(value.replace(/,/g, ''))) && value !== '' && !value.includes('%') && !value.includes('/')) {
        obj[header] = Number(value.replace(/,/g, ''));
      } else {
        obj[header] = value;
      }
    });

    return obj;
  });
}

// Extract accurate subject performance
function extractAccurateSubjectData(files) {
  const subjects = {};

  // Chinese & English Language from table3i
  const chineseEnglishFile = files.find(f => f.includes('table3i'));
  if (chineseEnglishFile) {
    console.log('📊 Processing Chinese-English Language data...');
    const data = parseCSV(fs.readFileSync(chineseEnglishFile, 'utf-8'));

    // Get Chinese Language totals (row totals from the "Total" column)
    const chineseData = data.filter(row => row['Type'] === 'Number' && row['Attainment in Chinese Language'] !== 'Total');
    const chineseTotals = {};
    chineseData.forEach(row => {
      const level = row['Attainment in Chinese Language'];
      chineseTotals[level] = row['Total'] || 0;
    });

    // Get English Language totals (from the bottom Total row)
    const englishTotalRow = data.find(row => row['Attainment in Chinese Language'] === 'Total' && row['Type'] === 'Number');
    const englishTotals = {};
    if (englishTotalRow) {
      englishTotals['5**'] = englishTotalRow['Attainment in English Language - 5**'] || 0;
      englishTotals['5*'] = englishTotalRow['Attainment in English Language - 5*'] || 0;
      englishTotals['5'] = englishTotalRow['Attainment in English Language - 5'] || 0;
      englishTotals['4'] = englishTotalRow['Attainment in English Language - 4'] || 0;
      englishTotals['3'] = englishTotalRow['Attainment in English Language - 3'] || 0;
      englishTotals['2'] = englishTotalRow['Attainment in English Language - 2'] || 0;
      englishTotals['1'] = englishTotalRow['Attainment in English Language - 1'] || 0;
      englishTotals['U'] = englishTotalRow['Attainment in English Language - U'] || 0;
    }

    subjects.chinese = {
      code: 'CHIN',
      name: 'Chinese Language',
      levels: chineseTotals
    };

    subjects.english = {
      code: 'ENGL',
      name: 'English Language',
      levels: englishTotals
    };
  }

  // Mathematics from table3j
  const mathFile = files.find(f => f.includes('table3j'));
  if (mathFile) {
    console.log('📊 Processing Mathematics data...');
    const data = parseCSV(fs.readFileSync(mathFile, 'utf-8'));

    // Get Mathematics Compulsory totals
    const mathData = data.filter(row => row['Type'] === 'Number' && row['Attainment in Mathematics Compulsory Part'] !== 'Total');
    const mathTotals = {};
    mathData.forEach(row => {
      const level = row['Attainment in Mathematics Compulsory Part'];
      mathTotals[level] = row['Total'] || 0;
    });

    // Get Mathematics Extended totals
    const mathExtendedTotalRow = data.find(row => row['Attainment in Mathematics Compulsory Part'] === 'Total' && row['Type'] === 'Number');
    const mathExtendedTotals = {};
    if (mathExtendedTotalRow) {
      mathExtendedTotals['5**'] = mathExtendedTotalRow['Attainment in Mathematics Extended Part - 5**'] || 0;
      mathExtendedTotals['5*'] = mathExtendedTotalRow['Attainment in Mathematics Extended Part - 5*'] || 0;
      mathExtendedTotals['5'] = mathExtendedTotalRow['Attainment in Mathematics Extended Part - 5'] || 0;
      mathExtendedTotals['4'] = mathExtendedTotalRow['Attainment in Mathematics Extended Part - 4'] || 0;
      mathExtendedTotals['3'] = mathExtendedTotalRow['Attainment in Mathematics Extended Part - 3'] || 0;
      mathExtendedTotals['2'] = mathExtendedTotalRow['Attainment in Mathematics Extended Part - 2'] || 0;
      mathExtendedTotals['1'] = mathExtendedTotalRow['Attainment in Mathematics Extended Part - 1'] || 0;
      mathExtendedTotals['U'] = mathExtendedTotalRow['Attainment in Mathematics Extended Part - U'] || 0;
    }

    subjects.mathematics = {
      code: 'MATH',
      name: 'Mathematics Compulsory Part',
      levels: mathTotals
    };

    // Only include M1/M2 if there's significant data
    const extendedTotal = Object.values(mathExtendedTotals).reduce((sum, val) => sum + val, 0);
    if (extendedTotal > 1000) {
      subjects.mathExtended = {
        code: 'M1M2',
        name: 'Mathematics Extended Part',
        levels: mathExtendedTotals
      };
    }
  }

  return subjects;
}

// Generate clean performance SQL
function generateCleanPerformanceSQL(subjects, year = 2024) {
  const statements = [];

  statements.push(`-- Clear existing ${year} performance data`);
  statements.push(`DELETE FROM dse_performance WHERE year = ${year};`);
  statements.push('');

  statements.push(`-- Insert ${year} core subject performance data`);

  const insertStatements = [];

  Object.values(subjects).forEach(subject => {
    const levels = subject.levels;
    if (Object.keys(levels).length > 0) {
      const totalCandidates = Object.values(levels).reduce((sum, count) => sum + (count || 0), 0);

      if (totalCandidates > 0) {
        // Calculate mean score (weighted average based on grade levels)
        const gradeWeights = { '5**': 7, '5*': 6, '5': 5, '4': 4, '3': 3, '2': 2, '1': 1, 'U': 0 };
        let totalPoints = 0;
        let totalWithGrades = 0;

        Object.entries(levels).forEach(([level, count]) => {
          if (gradeWeights[level] !== undefined && count > 0) {
            totalPoints += gradeWeights[level] * count;
            totalWithGrades += count;
          }
        });

        const meanScore = totalWithGrades > 0 ? (totalPoints / totalWithGrades).toFixed(2) : 0;

        const insertSQL = `(${year}, '${subject.code}', '${subject.name}', ${totalCandidates}, ${levels['5**'] || 0}, ${levels['5*'] || 0}, ${levels['5'] || 0}, ${levels['4'] || 0}, ${levels['3'] || 0}, ${levels['2'] || 0}, ${levels['1'] || 0}, ${levels['U'] || 0}, ${meanScore}, 0)`;

        insertStatements.push(insertSQL);

        console.log(`   ✅ ${subject.name}: ${totalCandidates} candidates (mean: ${meanScore})`);
        console.log(`      5**: ${levels['5**'] || 0}, 5*: ${levels['5*'] || 0}, 5: ${levels['5'] || 0}, 4: ${levels['4'] || 0}`);
      }
    }
  });

  if (insertStatements.length > 0) {
    statements.push('INSERT INTO dse_performance (year, subject_code, subject_name, total_candidates, level_5_star_star, level_5_star, level_5, level_4, level_3, level_2, level_1, unclassified, mean_score, standard_deviation) VALUES');
    statements.push(insertStatements.join(',\n'));
    statements.push(';');
  }

  return statements.join('\n');
}

// Main processing
const csvDir = './data/csv';
const outputDir = './database/imports';

try {
  const files = fs.readdirSync(csvDir)
    .filter(f => f.endsWith('.csv'))
    .map(f => path.join(csvDir, f));

  console.log(`📊 Processing core subject performance from cross-tabulation tables...`);

  // Extract accurate subject performance
  const subjects = extractAccurateSubjectData(files);

  console.log('\n📈 Extracted Core Subject Performance:');

  // Generate SQL
  const performanceSQL = generateCleanPerformanceSQL(subjects, 2024);

  if (performanceSQL) {
    const header = `-- DSE 2024 Core Subject Performance Data\n-- Generated on ${new Date().toISOString()}\n-- Source: Official HKDSE cross-tabulation tables (3i, 3j)\n-- Accurate data extracted from row/column totals\n\n`;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'core_subjects_performance_2024.sql');
    const fullSQL = header + performanceSQL;

    fs.writeFileSync(outputPath, fullSQL);

    console.log('\n✅ Core subject performance extraction completed!');
    console.log(`📄 SQL file: ${outputPath}`);
    console.log('\n🔧 Summary:');
    Object.values(subjects).forEach(subject => {
      const total = Object.values(subject.levels).reduce((sum, count) => sum + (count || 0), 0);
      console.log(`   ${subject.name}: ${total.toLocaleString()} candidates`);
    });
  } else {
    console.log('\n⚠️  No subject performance data extracted');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}