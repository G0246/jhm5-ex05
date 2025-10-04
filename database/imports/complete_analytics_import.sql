-- HKDSE 2024 Complete Analytics Data Import
-- Generated on 2025-10-04T03:06:16.279Z
-- New analytics-focused schema with rich insights

INSERT INTO candidates (year, total_candidates, day_school_male, day_school_female, day_school_total, private_male, private_female, private_total, gender_ratio, day_school_percentage) VALUES 
(2024, 42909, 20020, 19539, 39559, 1876, 1474, 3350, 0.960, 92.19);

INSERT INTO subject_performance (year, subject_code, subject_name, category, total_candidates, level_5_star_star, level_5_star, level_5, level_4, level_3, level_2, level_1, unclassified, mean_score, difficulty_index, distinction_rate, pass_rate, participation_rate) VALUES 
(2024, 'CHIN', 'Chinese Language', 'core', 42611, 489, 1356, 2662, 9146, 13889, 11276, 2883, 910, 3.02, 6.8, 10.58, 91.10, 100.00),
(2024, 'ENGL', 'English Language', 'core', 42611, 394, 1204, 2368, 7436, 11661, 11396, 4945, 3207, 2.68, 7.2, 9.31, 80.87, 100.00),
(2024, 'MATH', 'Mathematics Compulsory Part', 'core', 42611, 518, 1381, 2004, 2343, 699, 194, 9, 1, 2.73, 5.2, 54.60, 99.86, 100.00),
(2024, 'M1M2', 'Mathematics Extended Part', 'extended', 7149, 260, 748, 1456, 1566, 1482, 1006, 441, 190, 3.74, 6.5, 34.47, 91.17, 16.78);

INSERT INTO university_readiness (year, grade_point_range, grade_point_min, grade_point_max, day_school_candidates, all_candidates, cumulative_day_school, cumulative_all, percentage_day_school, percentage_all, cumulative_percentage_day_school, cumulative_percentage_all, top_tier_universities, competitive_programs, general_admission, international_recognition) VALUES 
(2024, '33-35', 33, 35, 283, 296, 283, 296, 0.70, 0.60, 0.70, 0.60, true, true, true, true),
(2024, '30-32', 30, 32, 643, 671, 926, 967, 1.58, 1.37, 2.28, 1.97, false, true, true, true),
(2024, '27-29', 27, 29, 1253, 1306, 2179, 2273, 3.08, 2.66, 5.36, 4.64, false, true, true, true),
(2024, '24-26', 24, 26, 2138, 2256, 4317, 4529, 5.26, 4.60, 10.62, 9.24, false, false, true, true),
(2024, '21-23', 21, 23, 3648, 3801, 7965, 8330, 8.97, 7.75, 19.59, 16.99, false, false, true, false),
(2024, '18-20', 18, 20, 4887, 5109, 12852, 13439, 12.02, 10.42, 31.60, 27.41, false, false, true, false),
(2024, '15-17', 15, 17, 4011, 4187, 16863, 17626, 9.86, 8.54, 41.47, 35.95, false, false, false, false),
(2024, '12-14', 12, 14, 1164, 1224, 18027, 18850, 2.86, 2.50, 44.33, 38.45, false, false, false, false);

INSERT INTO dashboard_insights (insight_category, insight_key, display_title, display_value, display_unit, description, significance_level, trend_direction, source_tables, calculation_method) VALUES 
('hero_stats', 'total_candidates', 'Total DSE Candidates', '42,909', '', 'Total number of candidates who sat for HKDSE 2024', 'critical', '', 'candidates', 'Direct extraction from Table 3A'),
('hero_stats', 'university_eligible', 'University Eligible', '72.0', '%', 'Percentage meeting basic university admission requirements (332A)', 'critical', '', 'candidates', 'Level 2+ in Chinese, English, Math + Attained in CSD'),
('hero_stats', 'elite_performers', 'Elite Performers', '0.11', '%', 'Candidates achieving 5** in five subjects', 'notable', '', 'candidates', 'Based on Table 3B high achiever statistics'),
('key_findings', 'english_challenge', 'English Language Challenge', '2.68', '/7', 'English shows lowest mean score among core subjects, indicating difficulty', 'important', '', 'subject_performance', 'Cross-tabulation analysis from Table 3I'),
('key_findings', 'language_gap', 'Chinese-English Performance Gap', '1.3', 'pp', 'Chinese Language outperforms English in distinction rates', 'important', 'advantage_chinese', 'subject_performance', 'Distinction rate differential (Level 5+ percentage)'),
('demographics', 'gender_balance', 'Gender Balance', '4', '% more male', 'Gender distribution among DSE 2024 candidates', 'notable', '', 'candidates', 'Female to male ratio calculation');