/**
 * CSV Import Utility for DSE 2024 Data
 * Handles processing CSV data into SQL statements
 * Note: File reading should be handled externally in this environment
 */

export interface PerformanceData {
  subject_code: string;
  subject_name: string;
  total_candidates: number;
  level_5_star_star: number;
  level_5_star: number;
  level_5: number;
  level_4: number;
  level_3: number;
  level_2: number;
  level_1: number;
  unclassified: number;
  mean_score?: number;
  standard_deviation?: number;
}

export interface RegistrationData {
  category: string;
  gender: string;
  subject_code: string;
  subject_name: string;
  registered_candidates: number;
  sat_for_exam: number;
  attendance_rate: number;
}

export interface SearchInterestData {
  date: string;
  search_interest: number;
}

export interface SubjectTrendsData {
  subject_code: string;
  subject_name: string;
  popularity_rank: number;
  difficulty_index?: number;
  pass_rate: number;
  distinction_rate: number;
}

/**
 * Parse CSV content into array of objects
 */
export function parseCSV<T>(csvContent: string): T[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};

    headers.forEach((header, index) => {
      const value = values[index];
      // Try to parse as number if it looks like a number
      if (!isNaN(Number(value)) && value !== '') {
        obj[header] = Number(value);
      } else {
        obj[header] = value;
      }
    });

    return obj as T;
  });
}

/**
 * Read and parse CSV file (placeholder - implement file reading externally)
 */
export function processCSVContent<T>(csvContent: string): T[] {
  try {
    return parseCSV<T>(csvContent);
  } catch (error) {
    console.error('Error parsing CSV content:', error);
    throw error;
  }
}

/**
 * Generate SQL INSERT statements for performance data
 */
export function generatePerformanceInserts(data: PerformanceData[], year: number = 2024): string {
  const inserts = data.map(row => {
    const values = [
      year,
      `'${row.subject_code}'`,
      `'${row.subject_name}'`,
      row.total_candidates,
      row.level_5_star_star || 0,
      row.level_5_star || 0,
      row.level_5 || 0,
      row.level_4 || 0,
      row.level_3 || 0,
      row.level_2 || 0,
      row.level_1 || 0,
      row.unclassified || 0,
      row.mean_score || 0,
      row.standard_deviation || 0
    ].join(', ');

    return `(${values})`;
  }).join(',\n');

  return `INSERT INTO dse_performance (year, subject_code, subject_name, total_candidates, level_5_star_star, level_5_star, level_5, level_4, level_3, level_2, level_1, unclassified, mean_score, standard_deviation) VALUES\n${inserts};`;
}

/**
 * Generate SQL INSERT statements for registration data
 */
export function generateRegistrationInserts(data: RegistrationData[], year: number = 2024): string {
  const inserts = data.map(row => {
    const values = [
      year,
      `'${row.category}'`,
      `'${row.gender}'`,
      `'${row.subject_code}'`,
      `'${row.subject_name}'`,
      row.registered_candidates,
      row.sat_for_exam,
      row.attendance_rate
    ].join(', ');

    return `(${values})`;
  }).join(',\n');

  return `INSERT INTO dse_registration (year, category, gender, subject_code, subject_name, registered_candidates, sat_for_exam, attendance_rate) VALUES\n${inserts};`;
}

/**
 * Generate SQL INSERT statements for search interest data
 */
export function generateSearchInterestInserts(data: SearchInterestData[]): string {
  const inserts = data.map(row => {
    const values = [
      `'${row.date}'`,
      row.search_interest
    ].join(', ');

    return `(${values})`;
  }).join(',\n');

  return `INSERT INTO dse_statistics (date, search_interest) VALUES\n${inserts};`;
}

/**
 * Generate SQL INSERT statements for subject trends data
 */
export function generateSubjectTrendsInserts(data: SubjectTrendsData[], year: number = 2024): string {
  const inserts = data.map(row => {
    const values = [
      year,
      `'${row.subject_code}'`,
      `'${row.subject_name}'`,
      row.popularity_rank,
      row.difficulty_index || 'NULL',
      row.pass_rate,
      row.distinction_rate
    ].join(', ');

    return `(${values})`;
  }).join(',\n');

  return `INSERT INTO subject_trends (year, subject_code, subject_name, popularity_rank, difficulty_index, pass_rate, distinction_rate) VALUES\n${inserts};`;
}

/**
 * Process multiple CSV contents and generate SQL statements
 */
export function processCSVDatasets(datasets: {
  performance?: string;
  registration?: string;
  searchInterest?: string;
  subjectTrends?: string;
}, year: number = 2024): string[] {
  const sqlStatements: string[] = [];

  try {
    // Process performance data
    if (datasets.performance) {
      const perfData = processCSVContent<PerformanceData>(datasets.performance);
      sqlStatements.push(generatePerformanceInserts(perfData, year));
      console.log(`✅ Processed ${perfData.length} performance records`);
    }

    // Process registration data
    if (datasets.registration) {
      const regData = processCSVContent<RegistrationData>(datasets.registration);
      sqlStatements.push(generateRegistrationInserts(regData, year));
      console.log(`✅ Processed ${regData.length} registration records`);
    }

    // Process search interest data
    if (datasets.searchInterest) {
      const searchData = processCSVContent<SearchInterestData>(datasets.searchInterest);
      sqlStatements.push(generateSearchInterestInserts(searchData));
      console.log(`✅ Processed ${searchData.length} search interest records`);
    }

    // Process subject trends data
    if (datasets.subjectTrends) {
      const trendsData = processCSVContent<SubjectTrendsData>(datasets.subjectTrends);
      sqlStatements.push(generateSubjectTrendsInserts(trendsData, year));
      console.log(`✅ Processed ${trendsData.length} subject trends records`);
    }

  } catch (error) {
    console.error('Error during CSV processing:', error);
    throw error;
  }

  return sqlStatements;
}

/**
 * Example usage:
 *
 * const csvContent = "subject_code,subject_name,total_candidates\nCHIN,Chinese Language,48000";
 * const data = processCSVContent<PerformanceData>(csvContent);
 * const sql = generatePerformanceInserts(data, 2024);
 * console.log(sql);
 */