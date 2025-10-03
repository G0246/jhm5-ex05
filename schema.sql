-- DSE Analysis Database Schema

-- Table to store DSE registration statistics
CREATE TABLE dse_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    search_interest INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table to store analysis results and insights
CREATE TABLE analysis_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    value REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_dse_statistics_date ON dse_statistics(date);
CREATE INDEX idx_analysis_insights_type ON analysis_insights(insight_type);