/**
 * DSE Analysis Site - Cloudflare Workers with D1 Database
 * Using Cloudflare's built-in static assets serving
 */

interface Env {
    DSE_DB: D1Database;
    ASSETS: Fetcher;
}

interface DSEPerformance {
    id: number;
    year: number;
    subject_code: string;
    subject_name: string;
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
    standard_deviation: number;
    created_at: string;
}

interface DSERegistration {
    id: number;
    year: number;
    category: string;
    gender: string;
    subject_code: string;
    subject_name: string;
    registered_candidates: number;
    sat_for_exam: number;
    attendance_rate: number;
    created_at: string;
}

interface SubjectTrend {
    id: number;
    year: number;
    subject_code: string;
    subject_name: string;
    popularity_rank: number;
    difficulty_index: number;
    pass_rate: number;
    distinction_rate: number;
    created_at: string;
}

interface DSEInsight {
    id: number;
    insight_type: string;
    title: string;
    description: string;
    value: number;
    created_at: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // Handle API routes
        if (path.startsWith('/api/')) {
            switch (path) {
                case '/api/insights':
                    return handleInsights(env);
                case '/api/performance':
                    return handlePerformance(env);
                case '/api/registration':
                    return handleRegistration(env);
                case '/api/subjects':
                    return handleSubjects(env);
                case '/api/data':
                    return handleDataPage(env);
                default:
                    return new Response('API endpoint not found', { status: 404 });
            }
        }

        // For all other requests (HTML, CSS, JS, etc.), use Cloudflare's static assets
        return env.ASSETS.fetch(request);
    },
} satisfies ExportedHandler<Env>;

// API Handler Functions

async function handleInsights(env: Env): Promise<Response> {
    try {
        const results = await env.DSE_DB.prepare('SELECT * FROM dse_insights ORDER BY created_at DESC').all();
        return Response.json({ success: true, data: results.results });
    } catch (error) {
        console.error('Error fetching insights:', error);
        return Response.json({ success: false, error: 'Failed to fetch insights data' }, { status: 500 });
    }
}

async function handlePerformance(env: Env): Promise<Response> {
    try {
        const results = await env.DSE_DB.prepare('SELECT * FROM dse_performance ORDER BY total_candidates DESC').all();
        return Response.json({ success: true, data: results.results });
    } catch (error) {
        console.error('Error fetching performance:', error);
        return Response.json({ success: false, error: 'Failed to fetch performance data' }, { status: 500 });
    }
}

async function handleRegistration(env: Env): Promise<Response> {
    try {
        const results = await env.DSE_DB.prepare('SELECT * FROM dse_registration ORDER BY registered_candidates DESC').all();
        return Response.json({ success: true, data: results.results });
    } catch (error) {
        console.error('Error fetching registration:', error);
        return Response.json({ success: false, error: 'Failed to fetch registration data' }, { status: 500 });
    }
}

async function handleSubjects(env: Env): Promise<Response> {
    try {
        const results = await env.DSE_DB.prepare('SELECT * FROM subject_trends ORDER BY popularity_rank ASC').all();
        return Response.json({ success: true, data: results.results });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        return Response.json({ success: false, error: 'Failed to fetch subjects data' }, { status: 500 });
    }
}

async function handleDataPage(env: Env): Promise<Response> {
    try {
        const [performance, registration, subjects, insights] = await Promise.all([
            env.DSE_DB.prepare('SELECT * FROM dse_performance ORDER BY total_candidates DESC').all(),
            env.DSE_DB.prepare('SELECT * FROM dse_registration ORDER BY registered_candidates DESC').all(),
            env.DSE_DB.prepare('SELECT * FROM subject_trends ORDER BY popularity_rank ASC').all(),
            env.DSE_DB.prepare('SELECT * FROM dse_insights ORDER BY created_at DESC').all()
        ]);

        const data = {
            performance: performance.results,
            registration: registration.results,
            subjects: subjects.results,
            insights: insights.results
        };

        return Response.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching data:', error);
        return Response.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
    }
}