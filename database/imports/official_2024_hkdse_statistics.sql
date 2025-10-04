-- DSE 2024 Official Statistics Import
-- Generated on 2025-10-04T02:44:08.995Z
-- Source: Official HKDSE Results Statistics Tables

-- Key Insights and Statistics

DELETE FROM dse_insights WHERE insight_type LIKE "2024_%";

INSERT INTO dse_insights (insight_type, title, description, value) VALUES 
('2024_total_candidates', 'Total 2024 DSE Candidates', 'Total number of candidates who sat for DSE 2024', 42909),
('2024_day_school_candidates', '2024 Day School Candidates', 'Number of day school candidates in DSE 2024', 39559),
('2024_private_candidates', '2024 Private Candidates', 'Number of private candidates in DSE 2024', 3350);

INSERT INTO dse_insights (insight_type, title, description, value) VALUES 
('2024_university_eligibility', '2024 University Admission Eligibility Rate', 'Percentage of candidates meeting basic university requirements (332A)', 72.0);

INSERT INTO dse_insights (insight_type, title, description, value) VALUES 
('2024_top_performers', '2024 Top Performers (5** in 5 subjects)', 'Percentage of candidates achieving 5** in five subjects', 0.110);

-- Registration Summary Data

INSERT INTO dse_registration (year, category, gender, subject_code, subject_name, registered_candidates, sat_for_exam, attendance_rate) VALUES 
(2024, 'day_school', 'male', 'ALL', 'All Subjects', 20020, 20020, 100.0),
(2024, 'day_school', 'female', 'ALL', 'All Subjects', 19539, 19539, 100.0),
(2024, 'private', 'male', 'ALL', 'All Subjects', 1876, 1876, 100.0),
(2024, 'private', 'female', 'ALL', 'All Subjects', 1474, 1474, 100.0);