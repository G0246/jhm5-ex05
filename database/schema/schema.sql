-- DSE Analysis Database Schema
-- This schema supports analysis of HKDSE search interest and related statistics

-- Main statistics table for search interest data
CREATE TABLE IF NOT EXISTS dse_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    search_interest INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Student performance and marks data
CREATE TABLE IF NOT EXISTS dse_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    total_candidates INTEGER NOT NULL,
    level_5_star_star INTEGER DEFAULT 0,
    level_5_star INTEGER DEFAULT 0,
    level_5 INTEGER DEFAULT 0,
    level_4 INTEGER DEFAULT 0,
    level_3 INTEGER DEFAULT 0,
    level_2 INTEGER DEFAULT 0,
    level_1 INTEGER DEFAULT 0,
    unclassified INTEGER DEFAULT 0,
    mean_score REAL DEFAULT 0,
    standard_deviation REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Registration statistics
CREATE TABLE IF NOT EXISTS dse_registration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    category TEXT NOT NULL, -- 'day_school', 'private', 'self_study', etc.
    gender TEXT NOT NULL, -- 'male', 'female', 'total'
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    registered_candidates INTEGER NOT NULL,
    sat_for_exam INTEGER NOT NULL,
    attendance_rate REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subject statistics and trends
CREATE TABLE IF NOT EXISTS subject_trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    popularity_rank INTEGER,
    difficulty_index REAL,
    pass_rate REAL,
    distinction_rate REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insights table for storing analytical insights
CREATE TABLE IF NOT EXISTS dse_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    value REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dse_statistics_date ON dse_statistics(date);
CREATE INDEX IF NOT EXISTS idx_dse_performance_year_subject ON dse_performance(year, subject_code);
CREATE INDEX IF NOT EXISTS idx_dse_registration_year_subject ON dse_registration(year, subject_code);
CREATE INDEX IF NOT EXISTS idx_subject_trends_year ON subject_trends(year);
CREATE INDEX IF NOT EXISTS idx_dse_insights_type ON dse_insights(insight_type);