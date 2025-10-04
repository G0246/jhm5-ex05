-- DSE Database Migration: 2025 to 2024
-- This script prepares the database for 2024 DSE data import

-- Backup existing 2025 data (optional - uncomment if you want to keep it)
/*
CREATE TABLE IF NOT EXISTS dse_performance_2025_backup AS SELECT * FROM dse_performance WHERE year = 2025;
CREATE TABLE IF NOT EXISTS dse_registration_2025_backup AS SELECT * FROM dse_registration WHERE year = 2025;
CREATE TABLE IF NOT EXISTS subject_trends_2025_backup AS SELECT * FROM subject_trends WHERE year = 2025;
*/

-- Clear existing 2025 data to make room for 2024 data
DELETE FROM dse_performance WHERE year = 2025;
DELETE FROM dse_registration WHERE year = 2025;
DELETE FROM subject_trends WHERE year = 2025;

-- Clear search interest data (will be replaced with 2024 data)
DELETE FROM dse_statistics;

-- Clear insights that may be year-specific
DELETE FROM dse_insights;

-- Reset auto-increment counters (optional)
-- DELETE FROM sqlite_sequence WHERE name IN ('dse_performance', 'dse_registration', 'subject_trends', 'dse_statistics', 'dse_insights');

-- Verify cleanup
SELECT 'Performance records remaining:' as info, COUNT(*) as count FROM dse_performance
UNION ALL
SELECT 'Registration records remaining:' as info, COUNT(*) as count FROM dse_registration
UNION ALL
SELECT 'Search interest records remaining:' as info, COUNT(*) as count FROM dse_statistics
UNION ALL
SELECT 'Subject trends records remaining:' as info, COUNT(*) as count FROM subject_trends
UNION ALL
SELECT 'Insights records remaining:' as info, COUNT(*) as count FROM dse_insights;