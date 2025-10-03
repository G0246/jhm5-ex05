-- DSE 2025 Performance and Registration Statistics
-- Based on typical DSE patterns and registration data

-- Insert 2025 Performance Data (Core Subjects)
INSERT INTO dse_performance (year, subject_code, subject_name, total_candidates, level_5_star_star, level_5_star, level_5, level_4, level_3, level_2, level_1, unclassified, mean_score, standard_deviation) VALUES
(2025, 'CHIN', 'Chinese Language', 48542, 245, 972, 4368, 9708, 14563, 12680, 5834, 172, 3.2, 1.1),
(2025, 'ENGL', 'English Language', 48542, 389, 1456, 5826, 10919, 13476, 11334, 4956, 186, 3.3, 1.2),
(2025, 'MATH', 'Mathematics (Compulsory)', 48542, 972, 2914, 7281, 11658, 12167, 9226, 4078, 246, 3.4, 1.3),
(2025, 'LS', 'Liberal Studies', 48542, 194, 728, 3883, 9708, 15534, 12922, 5398, 175, 3.1, 1.0),

-- Elective Subjects
(2025, 'PHYS', 'Physics', 12678, 634, 1268, 2536, 3203, 2789, 1774, 434, 40, 3.8, 1.4),
(2025, 'CHEM', 'Chemistry', 14523, 726, 1452, 2904, 3631, 3046, 2033, 681, 50, 3.7, 1.5),
(2025, 'BIOL', 'Biology', 13456, 673, 1346, 2691, 3364, 2962, 1883, 502, 35, 3.6, 1.4),
(2025, 'HIST', 'History', 8934, 447, 894, 1787, 2234, 1965, 1251, 321, 35, 3.5, 1.3),
(2025, 'GEOG', 'Geography', 7823, 391, 782, 1565, 1956, 1721, 1095, 281, 32, 3.4, 1.3),
(2025, 'ECON', 'Economics', 11245, 562, 1125, 2249, 2811, 2474, 1574, 405, 45, 3.6, 1.4),
(2025, 'BAFS', 'Business, Accounting and Financial Studies', 15678, 784, 1568, 3136, 3920, 3446, 2192, 564, 68, 3.5, 1.4),
(2025, 'ICT', 'Information and Communication Technology', 6789, 339, 679, 1358, 1697, 1493, 950, 244, 29, 3.4, 1.3),
(2025, 'VA', 'Visual Arts', 4523, 226, 452, 904, 1131, 995, 633, 163, 19, 3.3, 1.2),
(2025, 'MUS', 'Music', 1234, 62, 123, 247, 309, 272, 173, 44, 4, 3.2, 1.1),

-- Extended Mathematics
(2025, 'M1', 'Mathematics Extended Part (Module 1)', 8934, 894, 1787, 2680, 2234, 1251, 67, 21, 0, 4.2, 1.2),
(2025, 'M2', 'Mathematics Extended Part (Module 2)', 3456, 346, 691, 1038, 864, 484, 29, 4, 0, 4.3, 1.1);

-- Insert Registration Statistics by Category
INSERT INTO dse_registration (year, category, gender, subject_code, subject_name, registered_candidates, sat_for_exam, attendance_rate) VALUES
-- Day School Students - Summary for core subjects (representing unique candidates)
(2025, 'day_school', 'male', 'CORE', 'Core Subjects', 23680, 23445, 99.0),
(2025, 'day_school', 'female', 'CORE', 'Core Subjects', 24862, 24645, 99.1),

-- Private Candidates - Summary
(2025, 'private', 'male', 'CORE', 'Core Subjects', 1202, 1145, 95.3),
(2025, 'private', 'female', 'CORE', 'Core Subjects', 798, 767, 96.1),

-- Popular Elective Subjects by School Type
(2025, 'day_school', 'male', 'PHYS', 'Physics', 8234, 8110, 98.5),
(2025, 'day_school', 'female', 'PHYS', 'Physics', 4444, 4400, 99.0),
(2025, 'day_school', 'male', 'CHEM', 'Chemistry', 7456, 7345, 98.5),
(2025, 'day_school', 'female', 'CHEM', 'Chemistry', 7067, 6998, 99.0),
(2025, 'day_school', 'male', 'BIOL', 'Biology', 5234, 5167, 98.7),
(2025, 'day_school', 'female', 'BIOL', 'Biology', 8222, 8145, 99.1),
(2025, 'day_school', 'male', 'BAFS', 'Business, Accounting and Financial Studies', 6789, 6712, 98.9),
(2025, 'day_school', 'female', 'BAFS', 'Business, Accounting and Financial Studies', 8889, 8823, 99.3);

-- Insert Subject Trends and Analytics
INSERT INTO subject_trends (year, subject_code, subject_name, popularity_rank, difficulty_index, pass_rate, distinction_rate) VALUES
(2025, 'BAFS', 'Business, Accounting and Financial Studies', 1, 6.2, 85.2, 32.4),
(2025, 'CHEM', 'Chemistry', 2, 7.8, 82.1, 38.6),
(2025, 'BIOL', 'Biology', 3, 7.2, 83.4, 35.9),
(2025, 'PHYS', 'Physics', 4, 8.1, 81.2, 41.2),
(2025, 'ECON', 'Economics', 5, 6.8, 84.6, 34.1),
(2025, 'HIST', 'History', 6, 6.5, 86.1, 33.7),
(2025, 'M1', 'Mathematics Extended Part (Module 1)', 7, 8.9, 92.3, 52.1),
(2025, 'GEOG', 'Geography', 8, 6.4, 87.2, 32.8),
(2025, 'ICT', 'Information and Communication Technology', 9, 6.1, 88.5, 31.2),
(2025, 'M2', 'Mathematics Extended Part (Module 2)', 10, 9.2, 94.1, 56.7),
(2025, 'VA', 'Visual Arts', 11, 5.8, 89.3, 29.4),
(2025, 'MUS', 'Music', 12, 5.5, 91.2, 28.1);

-- Insert Enhanced Insights
INSERT INTO dse_insights (insight_type, title, description, value) VALUES
('performance', 'Overall Pass Rate 2025', 'Percentage of candidates achieving Level 2 or above across all subjects', 85.4),
('performance', 'Top Performing Subject', 'Mathematics M2 has the highest distinction rate', 56.7),
('performance', 'Most Popular Subject', 'BAFS remains the most popular elective with 15,678 candidates', 15678),
('registration', 'Total DSE Candidates 2025', 'Total number of candidates registered for DSE 2025', 48542),
('registration', 'Female Participation Rate', 'Percentage of female candidates in DSE 2025', 51.2),
('trends', 'STEM Subjects Growth', 'Combined STEM subjects saw 3.2% increase in registration', 3.2),
('trends', 'Mathematics Excellence', 'Extended Mathematics modules show exceptional performance', 94.2),
('difficulty', 'Most Challenging Subject', 'Mathematics M2 rated as most challenging with difficulty index', 9.2),
('difficulty', 'Most Accessible Subject', 'Music has the lowest difficulty index', 5.5),
('attendance', 'Overall Attendance Rate', 'Average attendance rate across all subjects and categories', 98.1);