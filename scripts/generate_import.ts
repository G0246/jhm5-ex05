import * as fs from 'fs';
import * as path from 'path';

// Read and parse the CSV data
const csvPath = path.join(__dirname, '../data/DSE_data.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV and generate SQL insert statements
function parseCSVAndGenerateSQL() {
    const lines = csvContent.split('\n');
    const dataLines = lines.slice(3); // Skip header lines

    let sqlInserts = '-- Generated DSE statistics data\n\n';
    sqlInserts += 'INSERT INTO dse_statistics (date, search_interest) VALUES\n';

    const validData: string[] = [];

    for (const line of dataLines) {
        const trimmedLine = line.trim();
        if (trimmedLine && trimmedLine.includes(',')) {
            const [dateStr, valueStr] = trimmedLine.split(',');
            const date = dateStr.trim();
            const value = parseInt(valueStr.trim());

            if (date && !isNaN(value) && date !== 'Week') {
                // Convert date format if needed
                const formattedDate = formatDate(date);
                if (formattedDate) {
                    validData.push(`('${formattedDate}', ${value})`);
                }
            }
        }
    }

    sqlInserts += validData.join(',\n') + ';\n';
    return sqlInserts;
}

function formatDate(dateStr: string): string | null {
    try {
        // Handle different date formats in the CSV
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
        }
    } catch (error) {
        console.error('Error formatting date:', dateStr, error);
    }
    return null;
}

// Generate and save the SQL
const sqlContent = parseCSVAndGenerateSQL();
fs.writeFileSync(path.join(__dirname, '../generated_data_import.sql'), sqlContent);

console.log('Generated SQL import file: generated_data_import.sql');