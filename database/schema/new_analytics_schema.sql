-- HKDSE Analytics Database - Complete Redesign
-- Modern schema optimized for university admission analytics and performance insights
-- 2024 Official Data Integration

-- ============================================================================
-- DROP ALL OLD TABLES - Complete Clean Slate
-- ============================================================================

DROP TABLE IF EXISTS dse_statistics;
DROP TABLE IF EXISTS dse_performance;
DROP TABLE IF EXISTS dse_registration;
DROP TABLE IF EXISTS subject_trends;
DROP TABLE IF EXISTS dse_insights;

-- ============================================================================
-- NEW ANALYTICS-FOCUSED SCHEMA
-- ============================================================================

-- Core candidate demographics and participation
CREATE TABLE candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    total_candidates INTEGER NOT NULL,
    day_school_male INTEGER NOT NULL,
    day_school_female INTEGER NOT NULL,
    day_school_total INTEGER NOT NULL,
    private_male INTEGER NOT NULL,
    private_female INTEGER NOT NULL,
    private_total INTEGER NOT NULL,
    gender_ratio REAL NOT NULL, -- Female to male ratio
    day_school_percentage REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Detailed subject performance with full grade distributions
CREATE TABLE subject_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'core', 'extended', 'elective'
    total_candidates INTEGER NOT NULL,

    -- Grade distribution
    level_5_star_star INTEGER DEFAULT 0,
    level_5_star INTEGER DEFAULT 0,
    level_5 INTEGER DEFAULT 0,
    level_4 INTEGER DEFAULT 0,
    level_3 INTEGER DEFAULT 0,
    level_2 INTEGER DEFAULT 0,
    level_1 INTEGER DEFAULT 0,
    unclassified INTEGER DEFAULT 0,

    -- Analytics
    mean_score REAL NOT NULL,
    difficulty_index REAL NOT NULL, -- 1-10 scale
    distinction_rate REAL NOT NULL, -- Level 5+ percentage
    pass_rate REAL NOT NULL, -- Level 2+ percentage
    participation_rate REAL NOT NULL, -- vs total candidates

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- University admission analytics and grade point distributions
CREATE TABLE university_readiness (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    grade_point_range TEXT NOT NULL, -- '33-35', '30-32', etc.
    grade_point_min INTEGER NOT NULL,
    grade_point_max INTEGER NOT NULL,

    -- Candidate counts
    day_school_candidates INTEGER NOT NULL,
    all_candidates INTEGER NOT NULL,
    cumulative_day_school INTEGER NOT NULL,
    cumulative_all INTEGER NOT NULL,

    -- Percentages
    percentage_day_school REAL NOT NULL,
    percentage_all REAL NOT NULL,
    cumulative_percentage_day_school REAL NOT NULL,
    cumulative_percentage_all REAL NOT NULL,

    -- University eligibility categories
    top_tier_universities BOOLEAN DEFAULT FALSE, -- Top 1%
    competitive_programs BOOLEAN DEFAULT FALSE, -- Top 5%
    general_admission BOOLEAN DEFAULT FALSE, -- Basic 332A
    international_recognition BOOLEAN DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cross-subject performance correlations and patterns
CREATE TABLE performance_matrix (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    subject1_code TEXT NOT NULL,
    subject1_name TEXT NOT NULL,
    subject2_code TEXT NOT NULL,
    subject2_name TEXT NOT NULL,

    -- Performance correlation data
    correlation_strength REAL NOT NULL, -- -1 to 1
    common_high_achievers INTEGER NOT NULL, -- Both subjects 5+
    common_struggle_areas INTEGER NOT NULL, -- Both subjects <3

    -- Specific performance patterns
    chinese_english_bilingual INTEGER DEFAULT 0,
    math_core_extended_progression INTEGER DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gender and demographic performance analysis
CREATE TABLE demographic_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    analysis_type TEXT NOT NULL, -- 'gender_gap', 'school_type', 'regional'
    category TEXT NOT NULL, -- 'day_school_male', 'private_female', etc.
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,

    -- Performance metrics
    total_candidates INTEGER NOT NULL,
    mean_performance REAL NOT NULL,
    distinction_rate REAL NOT NULL,
    pass_rate REAL NOT NULL,

    -- Comparative analysis
    performance_gap REAL NOT NULL, -- vs comparison group
    statistical_significance REAL NOT NULL, -- p-value
    gap_interpretation TEXT NOT NULL, -- 'significant_advantage', 'moderate_gap', etc.

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pre-calculated dashboard insights for fast loading
CREATE TABLE dashboard_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    insight_category TEXT NOT NULL, -- 'hero_stats', 'key_findings', 'trends'
    insight_key TEXT NOT NULL UNIQUE,
    display_title TEXT NOT NULL,
    display_value TEXT NOT NULL,
    display_unit TEXT DEFAULT '',

    -- Additional context
    description TEXT NOT NULL,
    significance_level TEXT NOT NULL, -- 'critical', 'important', 'notable'
    trend_direction TEXT DEFAULT NULL, -- 'increasing', 'decreasing', 'stable'

    -- Data source
    source_tables TEXT NOT NULL,
    calculation_method TEXT NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analytics trends for multi-year comparisons
CREATE TABLE trends_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_type TEXT NOT NULL, -- 'participation', 'performance', 'university_eligibility'
    metric_name TEXT NOT NULL,
    year INTEGER NOT NULL,
    value REAL NOT NULL,

    -- Trend analysis
    year_over_year_change REAL DEFAULT NULL,
    trend_direction TEXT DEFAULT NULL,
    trend_strength TEXT DEFAULT NULL, -- 'strong', 'moderate', 'weak'

    -- Context
    context_notes TEXT DEFAULT NULL,
    data_quality TEXT DEFAULT 'verified',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES for Analytics Performance
-- ============================================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_candidates_year ON candidates(year);
CREATE INDEX IF NOT EXISTS idx_subject_performance_year_subject ON subject_performance(year, subject_code);
CREATE INDEX IF NOT EXISTS idx_university_readiness_year ON university_readiness(year);
CREATE INDEX IF NOT EXISTS idx_performance_matrix_year ON performance_matrix(year);
CREATE INDEX IF NOT EXISTS idx_demographic_analysis_year_type ON demographic_analysis(year, analysis_type);

-- Dashboard performance indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_category ON dashboard_insights(insight_category);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_key ON dashboard_insights(insight_key);
CREATE INDEX IF NOT EXISTS idx_trends_analytics_type_year ON trends_analytics(metric_type, year);

-- Analytics query optimization
CREATE INDEX IF NOT EXISTS idx_subject_performance_category ON subject_performance(category);
CREATE INDEX IF NOT EXISTS idx_university_readiness_grade_points ON university_readiness(grade_point_min, grade_point_max);
CREATE INDEX IF NOT EXISTS idx_demographic_analysis_subject ON demographic_analysis(subject_code);