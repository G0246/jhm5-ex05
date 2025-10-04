-- DSE 2024 Core Subject Performance Data
-- Generated on 2025-10-04T02:46:42.975Z
-- Source: Official HKDSE cross-tabulation tables (3i, 3j)
-- Accurate data extracted from row/column totals

-- Clear existing 2024 performance data
DELETE FROM dse_performance WHERE year = 2024;

-- Insert 2024 core subject performance data
INSERT INTO dse_performance (year, subject_code, subject_name, total_candidates, level_5_star_star, level_5_star, level_5, level_4, level_3, level_2, level_1, unclassified, mean_score, standard_deviation) VALUES
(2024, 'CHIN', 'Chinese Language', 42611, 489, 1356, 2662, 9146, 13889, 11276, 2883, 910, 3.02, 0),
(2024, 'ENGL', 'English Language', 42611, 394, 1204, 2368, 7436, 11661, 11396, 4945, 3207, 2.68, 0),
(2024, 'MATH', 'Mathematics Compulsory Part', 7149, 518, 1381, 2004, 2343, 699, 194, 9, 1, 4.73, 0),
(2024, 'M1M2', 'Mathematics Extended Part', 7149, 260, 748, 1456, 1566, 1482, 1006, 441, 190, 3.74, 0)
;