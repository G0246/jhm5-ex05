/**
 * HKDSE Analytics Platform - Modern Analytics-Focused API
 * Cloudflare Workers with D1 Database - Redesigned for University Admission Intelligence
 */

interface Env {
    DSE_DB: D1Database;
    ASSETS: Fetcher;
}

// New Analytics-Focused Interfaces

interface CandidateData {
    id: number;
    year: number;
    total_candidates: number;
    day_school_male: number;
    day_school_female: number;
    day_school_total: number;
    private_male: number;
    private_female: number;
    private_total: number;
    gender_ratio: number;
    day_school_percentage: number;
    created_at: string;
}

interface SubjectPerformance {
    id: number;
    year: number;
    subject_code: string;
    subject_name: string;
    category: string;
    total_candidates: number;
    level_5_star_star: number;
    level_5_star: number;
    level_5: number;
    level_4: number;
    level_3: number;
    level_2: number;
    level_1: number;
    unclassified: number;
    mean_score: number;
    difficulty_index: number;
    distinction_rate: number;
    pass_rate: number;
    participation_rate: number;
    created_at: string;
}

interface UniversityReadiness {
    id: number;
    year: number;
    grade_point_range: string;
    grade_point_min: number;
    grade_point_max: number;
    day_school_candidates: number;
    all_candidates: number;
    cumulative_day_school: number;
    cumulative_all: number;
    percentage_day_school: number;
    percentage_all: number;
    cumulative_percentage_day_school: number;
    cumulative_percentage_all: number;
    top_tier_universities: boolean;
    competitive_programs: boolean;
    general_admission: boolean;
    international_recognition: boolean;
    created_at: string;
}

interface DashboardInsight {
    id: number;
    insight_category: string;
    insight_key: string;
    display_title: string;
    display_value: string;
    display_unit: string;
    description: string;
    significance_level: string;
    trend_direction: string;
    source_tables: string;
    calculation_method: string;
    last_updated: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // Handle new analytics API routes
        if (path.startsWith('/api/')) {
            // Add CORS headers for all API responses
            const corsHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            };

            if (request.method === 'OPTIONS') {
                return new Response(null, { headers: corsHeaders });
            }

            let response: Response;

            switch (path) {
                case '/api/dashboard':
                    response = await handleDashboard(env);
                    break;
                case '/api/candidates':
                    response = await handleCandidates(env);
                    break;
                case '/api/subjects/performance':
                    response = await handleSubjectPerformance(env);
                    break;
                case '/api/university/readiness':
                    response = await handleUniversityReadiness(env);
                    break;
                case '/api/insights':
                    response = await handleInsights(env);
                    break;
                case '/api/analytics/overview':
                    response = await handleAnalyticsOverview(env);
                    break;
                default:
                    response = new Response('API endpoint not found', { status: 404 });
            }

            // Add CORS headers to response
            Object.entries(corsHeaders).forEach(([key, value]) => {
                response.headers.set(key, value);
            });

            return response;
        }

        // For all other requests (HTML, CSS, JS, etc.), use Cloudflare's static assets
        return env.ASSETS.fetch(request);
    },
} satisfies ExportedHandler<Env>;

// New Analytics API Handlers

async function handleDashboard(env: Env): Promise<Response> {
    try {
        // Get hero statistics from dashboard insights
        const heroStats = await env.DSE_DB.prepare(
            `SELECT insight_key, display_title, display_value, display_unit, description
             FROM dashboard_insights
             WHERE insight_category = 'hero_stats'
             ORDER BY insight_key`
        ).all();

        const keyFindings = await env.DSE_DB.prepare(
            `SELECT insight_key, display_title, display_value, display_unit, description, significance_level
             FROM dashboard_insights
             WHERE insight_category = 'key_findings'
             ORDER BY significance_level DESC`
        ).all();

        return Response.json({
            success: true,
            data: {
                heroStats: heroStats.results,
                keyFindings: keyFindings.results
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return Response.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}

async function handleCandidates(env: Env): Promise<Response> {
    try {
        const candidates = await env.DSE_DB.prepare('SELECT * FROM candidates WHERE year = 2024').all();
        return Response.json({ success: true, data: candidates.results[0] });
    } catch (error) {
        console.error('Error fetching candidates data:', error);
        return Response.json({ success: false, error: 'Failed to fetch candidates data' }, { status: 500 });
    }
}

async function handleSubjectPerformance(env: Env): Promise<Response> {
    try {
        const subjects = await env.DSE_DB.prepare(
            `SELECT subject_code, subject_name, category, total_candidates,
                    level_5_star_star, level_5_star, level_5, level_4, level_3, level_2, level_1, unclassified,
                    mean_score, difficulty_index, distinction_rate, pass_rate, participation_rate
             FROM subject_performance
             WHERE year = 2024
             ORDER BY difficulty_index DESC`
        ).all();

        return Response.json({ success: true, data: subjects.results });
    } catch (error) {
        console.error('Error fetching subject performance:', error);
        return Response.json({ success: false, error: 'Failed to fetch subject performance data' }, { status: 500 });
    }
}

async function handleUniversityReadiness(env: Env): Promise<Response> {
    try {
        const readiness = await env.DSE_DB.prepare(
            `SELECT grade_point_range, grade_point_min, grade_point_max,
                    all_candidates, cumulative_all, percentage_all, cumulative_percentage_all,
                    top_tier_universities, competitive_programs, general_admission, international_recognition
             FROM university_readiness
             WHERE year = 2024
             ORDER BY grade_point_min DESC`
        ).all();

        return Response.json({ success: true, data: readiness.results });
    } catch (error) {
        console.error('Error fetching university readiness:', error);
        return Response.json({ success: false, error: 'Failed to fetch university readiness data' }, { status: 500 });
    }
}

async function handleInsights(env: Env): Promise<Response> {
    try {
        const insights = await env.DSE_DB.prepare(
            `SELECT insight_category, insight_key, display_title, display_value, display_unit,
                    description, significance_level, trend_direction
             FROM dashboard_insights
             ORDER BY
                CASE significance_level
                    WHEN 'critical' THEN 1
                    WHEN 'important' THEN 2
                    WHEN 'notable' THEN 3
                    ELSE 4
                END, insight_category`
        ).all();

        return Response.json({ success: true, data: insights.results });
    } catch (error) {
        console.error('Error fetching insights:', error);
        return Response.json({ success: false, error: 'Failed to fetch insights data' }, { status: 500 });
    }
}

async function handleAnalyticsOverview(env: Env): Promise<Response> {
    try {
        // Get comprehensive overview data for analytics dashboard
        const [candidates, subjects, readiness, insights] = await Promise.all([
            env.DSE_DB.prepare('SELECT * FROM candidates WHERE year = 2024').all(),
            env.DSE_DB.prepare('SELECT * FROM subject_performance WHERE year = 2024 ORDER BY difficulty_index DESC').all(),
            env.DSE_DB.prepare('SELECT * FROM university_readiness WHERE year = 2024 ORDER BY grade_point_min DESC LIMIT 10').all(),
            env.DSE_DB.prepare('SELECT * FROM dashboard_insights ORDER BY significance_level').all()
        ]);

        return Response.json({
            success: true,
            data: {
                candidates: candidates.results[0],
                subjects: subjects.results,
                universityReadiness: readiness.results,
                insights: insights.results
            }
        });
    } catch (error) {
        console.error('Error fetching analytics overview:', error);
        return Response.json({ success: false, error: 'Failed to fetch analytics overview' }, { status: 500 });
    }
}