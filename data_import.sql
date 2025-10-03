-- Insert DSE statistics data from CSV

-- Sample data based on the CSV structure
-- Note: The CSV appears to show search interest over time for DSE-related topics

INSERT INTO dse_statistics (date, search_interest) VALUES
('2025-03-30', 100),
('2024-04-07', 96),
('2023-04-16', 87),
('2023-04-23', 82),
('2022-04-17', 78),
('2020-04-26', 76),
('2021-04-25', 72),
('2022-04-24', 72),
('2024-04-14', 72),
('2025-04-06', 70),
('2024-07-14', 65),
('2023-07-16', 62),
('2020-04-19', 58),
('2022-07-17', 58),
('2025-03-23', 58),
('2025-03-16', 54),
('2021-04-18', 53),
('2020-04-12', 52),
('2025-03-09', 51),
('2020-05-24', 50);

-- Insert some analysis insights
INSERT INTO analysis_insights (insight_type, title, description, value) VALUES
('peak_interest', 'Peak Search Interest', 'Highest search interest recorded for DSE', 100.0),
('avg_interest', 'Average Search Interest', 'Average search interest across all periods', 45.2),
('trend_analysis', 'Recent Trend', 'Search interest trend in 2025', 75.6),
('seasonal_pattern', 'Seasonal Pattern', 'DSE interest typically peaks in March-April exam period', 85.0);