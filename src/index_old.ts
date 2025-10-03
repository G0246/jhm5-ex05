/**
 * DSE Analysis Site - Cloudflare Workers with D1 Database
 *
 * This application provides analysis of Hong Kong DSE (HKDSE) search interest data
 * using Cloudflare D1 database for storage and analytics.
 */

interface DSEStatistic {
    id: number;
    date: string;
    search_interest: number;
    created_at: string;
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

interface AnalysisInsight {
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

        // Serve static files
        if (path.startsWith('/css/') || path.startsWith('/js/')) {
            return serveStaticFile(path);
        }

        // Handle different routes
        switch (path) {
            case '/':
                return serveStaticFile('/index.html');
            case '/performance':
                return serveStaticFile('/performance.html');
            case '/subjects':
                return serveStaticFile('/subjects.html');
            case '/data':
                return handleDataPage(env);
            case '/api/statistics':
                return handleStatistics(env);
            case '/api/insights':
                return handleInsights(env);
            case '/api/analysis':
                return handleAnalysis(env);
            case '/api/performance':
                return handlePerformance(env);
            case '/api/registration':
                return handleRegistration(env);
            case '/api/subjects':
                return handleSubjects(env);
            default:
                return new Response('Not Found', { status: 404 });
        }
    },
} satisfies ExportedHandler<Env>;

// Serve static files from the public directory
async function serveStaticFile(path: string): Promise<Response> {
    const filePath = path.startsWith('/') ? path.slice(1) : path;
    
    try {
        // Import static file contents
        const staticFiles = await getStaticFiles();
        const file = staticFiles[filePath];
        
        if (file) {
            return new Response(file.content, {
                headers: {
                    'Content-Type': file.contentType,
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        }
    } catch (error) {
        console.error('Error serving static file:', error);
    }

    return new Response('File not found', { status: 404 });
}

// Static file contents (in production, these would be served from KV or assets)
async function getStaticFiles(): Promise<Record<string, { content: string; contentType: string }>> {
    return {
        'index.html': {
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSE Analysis Dashboard</title>
    <link rel="stylesheet" href="/css/main.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 DSE Analysis Dashboard</h1>
            <p>Hong Kong Diploma of Secondary Education - Analytics & Performance</p>
        </div>

        <div class="nav-links">
            <a href="/" class="nav-link">Dashboard</a>
            <a href="/performance" class="nav-link">Performance</a>
            <a href="/subjects" class="nav-link">Subjects</a>
            <a href="/data" class="nav-link">Raw Data</a>
            <a href="/api/statistics" class="nav-link">API Stats</a>
        </div>

        <div class="dashboard">
            <div class="card">
                <h3>🎓 Total DSE Candidates</h3>
                <div class="metric" id="totalCandidates">Loading...</div>
                <p>2025 registered candidates</p>
            </div>
            <div class="card">
                <h3>📊 Overall Pass Rate</h3>
                <div class="metric" id="passRate">Loading...</div>
                <p>Level 2 and above achievement</p>
            </div>
            <div class="card">
                <h3>⭐ Top Performing Subject</h3>
                <div class="metric" id="topSubject">Loading...</div>
                <p>Highest distinction rate</p>
            </div>
            <div class="card">
                <h3>📈 Search Interest</h3>
                <div class="metric" id="searchInterest">Loading...</div>
                <p>Current trend analysis</p>
            </div>
            <div class="card">
                <h3>👥 Gender Distribution</h3>
                <div class="metric" id="genderSplit">Loading...</div>
                <p>Female participation rate</p>
            </div>
            <div class="card">
                <h3>🔬 STEM Performance</h3>
                <div class="metric" id="stemGrowth">Loading...</div>
                <p>Science subjects growth</p>
            </div>
        </div>

        <div class="chart-container">
            <h3>📋 Key Insights</h3>
            <div class="insights-grid" id="insightsGrid">
                <div class="loading">Loading insights...</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Powered by Cloudflare Workers & D1 Database | DSE Analysis © 2025</p>
    </div>

    <script src="/js/main.js"></script>
</body>
</html>`,
            contentType: 'text/html; charset=utf-8'
        },
        'css/main.css': {
            content: `/* DSE Analysis Site - Main Stylesheet */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6; color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.header { text-align: center; color: white; margin-bottom: 40px; }
.header h1 { font-size: 3rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
.header p { font-size: 1.2rem; opacity: 0.9; }
.dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-bottom: 40px; }
.card { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
.card:hover { transform: translateY(-5px); }
.card h3 { color: #667eea; margin-bottom: 15px; font-size: 1.5rem; }
.metric { font-size: 2.5rem; font-weight: bold; color: #764ba2; margin: 10px 0; }
.chart-container { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 30px; }
.nav-links { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
.nav-link { background: rgba(255,255,255,0.2); color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; transition: all 0.3s ease; backdrop-filter: blur(10px); }
.nav-link:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
.insights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
.insight-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
.insight-value { font-size: 2rem; font-weight: bold; margin: 10px 0; }
.footer { text-align: center; color: white; padding: 20px; opacity: 0.8; }
.loading { text-align: center; padding: 20px; color: #666; }`,
            contentType: 'text/css; charset=utf-8'
        },
        'js/main.js': {
            content: `// DSE Analysis Site - Main JavaScript
async function loadDashboard() {
    try {
        const [performanceRes, insightsRes, statsRes] = await Promise.all([
            fetch('/api/performance'),
            fetch('/api/insights'),
            fetch('/api/statistics')
        ]);
        
        const [performance, insights, stats] = await Promise.all([
            performanceRes.json(),
            insightsRes.json(),
            statsRes.json()
        ]);

        const coreSubject = performance.data.find(s => s.subject_code === 'CHIN');
        const totalCandidates = coreSubject ? coreSubject.total_candidates : 48542;
        
        const topSubject = performance.data.reduce((top, subject) => {
            const rate = (subject.level_5_star_star + subject.level_5_star + subject.level_5) / subject.total_candidates * 100;
            const topRate = (top.level_5_star_star + top.level_5_star + top.level_5) / top.total_candidates * 100;
            return rate > topRate ? subject : top;
        });

        document.getElementById('totalCandidates').textContent = totalCandidates.toLocaleString();
        document.getElementById('passRate').textContent = '85.4%';
        document.getElementById('topSubject').textContent = topSubject.subject_name.split(' ')[0];
        document.getElementById('searchInterest').textContent = stats.data[0]?.search_interest || 'N/A';
        document.getElementById('genderSplit').textContent = '51.2%';
        document.getElementById('stemGrowth').textContent = '+3.2%';

        const insightsGrid = document.getElementById('insightsGrid');
        if (insightsGrid) {
            insightsGrid.innerHTML = insights.data.map(insight => \`
                <div class="insight-card">
                    <h4>\${insight.title}</h4>
                    <div class="insight-value">\${insight.value}\${insight.insight_type === 'performance' ? '%' : ''}</div>
                    <p>\${insight.description}</p>
                </div>
            \`).join('');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadDashboard);`,
            contentType: 'application/javascript; charset=utf-8'
        }
    };
}

async function handleHomePage(env: Env): Promise<Response> {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DSE Analysis Site</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }

            .header {
                text-align: center;
                color: white;
                margin-bottom: 40px;
            }

            .header h1 {
                font-size: 3rem;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }

            .header p {
                font-size: 1.2rem;
                opacity: 0.9;
            }

            .dashboard {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 30px;
                margin-bottom: 40px;
            }

            .card {
                background: white;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                transition: transform 0.3s ease;
            }

            .card:hover {
                transform: translateY(-5px);
            }

            .card h3 {
                color: #667eea;
                margin-bottom: 15px;
                font-size: 1.5rem;
            }

            .metric {
                font-size: 2.5rem;
                font-weight: bold;
                color: #764ba2;
                margin: 10px 0;
            }

            .chart-container {
                background: white;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                margin-bottom: 30px;
            }

            .nav-links {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-bottom: 30px;
            }

            .nav-link {
                background: rgba(255,255,255,0.2);
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                text-decoration: none;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .nav-link:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
            }

            .insights-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
            }

            .insight-card {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
            }

            .insight-value {
                font-size: 2rem;
                font-weight: bold;
                margin: 10px 0;
            }

            .footer {
                text-align: center;
                color: white;
                padding: 20px;
                opacity: 0.8;
            }

            .loading {
                text-align: center;
                padding: 20px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 DSE Analysis Dashboard</h1>
                <p>Hong Kong Diploma of Secondary Education - Search Interest Analytics</p>
            </div>

            <div class="nav-links">
                <a href="/" class="nav-link">Dashboard</a>
                <a href="/performance" class="nav-link">Performance</a>
                <a href="/subjects" class="nav-link">Subjects</a>
                <a href="/data" class="nav-link">Raw Data</a>
                <a href="/api/statistics" class="nav-link">API Stats</a>
            </div>

            <div class="dashboard">
                <div class="card">
                    <h3>🎓 Total DSE Candidates</h3>
                    <div class="metric" id="totalCandidates">Loading...</div>
                    <p>2025 registered candidates</p>
                </div>

                <div class="card">
                    <h3>📊 Overall Pass Rate</h3>
                    <div class="metric" id="passRate">Loading...</div>
                    <p>Level 2 and above achievement</p>
                </div>

                <div class="card">
                    <h3>⭐ Top Performing Subject</h3>
                    <div class="metric" id="topSubject">Loading...</div>
                    <p>Highest distinction rate</p>
                </div>

                <div class="card">
                    <h3>📈 Search Interest</h3>
                    <div class="metric" id="searchInterest">Loading...</div>
                    <p>Current trend analysis</p>
                </div>

                <div class="card">
                    <h3>� Gender Distribution</h3>
                    <div class="metric" id="genderSplit">Loading...</div>
                    <p>Female participation rate</p>
                </div>

                <div class="card">
                    <h3>🔬 STEM Performance</h3>
                    <div class="metric" id="stemGrowth">Loading...</div>
                    <p>Science subjects growth</p>
                </div>
            </div>

            <div class="chart-container">
                <h3>📋 Key Insights</h3>
                <div class="insights-grid" id="insightsGrid">
                    <div class="loading">Loading insights...</div>
                </div>
            </div>

            <div class="chart-container">
                <h3>📈 Recent Search Interest Trend</h3>
                <div id="trendChart">
                    <p style="text-align: center; padding: 20px; color: #666;">
                        Chart visualization would be displayed here.<br>
                        Data shows DSE search interest typically peaks during exam season (March-April).
                    </p>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Powered by Cloudflare Workers & D1 Database | DSE Analysis © 2025</p>
        </div>

        <script>
            // Load dashboard data
            async function loadDashboard() {
                try {
                    // Load performance data
                    const performanceResponse = await fetch('/api/performance');
                    const performance = await performanceResponse.json();

                    // Load insights
                    const insightsResponse = await fetch('/api/insights');
                    const insights = await insightsResponse.json();

                    // Load search statistics
                    const statsResponse = await fetch('/api/statistics');
                    const stats = await statsResponse.json();

                    // Calculate total candidates (use core subjects since all candidates take them)
                    const coreSubject = performance.data.find(subject => subject.subject_code === 'CHIN');
                    const totalCandidates = coreSubject ? coreSubject.total_candidates : 48542;

                    // Find top performing subject (highest distinction rate)
                    const topSubject = performance.data.reduce((top, subject) => {
                        const distinctions = subject.level_5_star_star + subject.level_5_star + subject.level_5;
                        const rate = (distinctions / subject.total_candidates) * 100;
                        const topRate = (top.level_5_star_star + top.level_5_star + top.level_5) / top.total_candidates * 100;
                        return rate > topRate ? subject : top;
                    });

                    // Update dashboard metrics
                    document.getElementById('totalCandidates').textContent = totalCandidates.toLocaleString();
                    document.getElementById('passRate').textContent = '85.4%';
                    document.getElementById('topSubject').textContent = topSubject.subject_name.split(' ')[0];
                    document.getElementById('searchInterest').textContent = stats.data[0]?.search_interest || 'N/A';
                    document.getElementById('genderSplit').textContent = '51.2%';
                    document.getElementById('stemGrowth').textContent = '+3.2%';

                    // Update insights grid
                    const insightsGrid = document.getElementById('insightsGrid');
                    insightsGrid.innerHTML = insights.data.map(insight => \`
                        <div class="insight-card">
                            <h4>\${insight.title}</h4>
                            <div class="insight-value">\${insight.value}\${insight.insight_type === 'performance' ? '%' : ''}</div>
                            <p>\${insight.description}</p>
                        </div>
                    \`).join('');

                } catch (error) {
                    console.error('Error loading dashboard:', error);
                }
            }

            // Load data when page loads
            document.addEventListener('DOMContentLoaded', loadDashboard);
        </script>
    </body>
    </html>
    `;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
    });
}

async function handleStatistics(env: Env): Promise<Response> {
    try {
        const result = await env.DSE_DB.prepare(
            'SELECT * FROM dse_statistics ORDER BY date DESC LIMIT 50'
        ).all();

        return new Response(JSON.stringify({
            success: true,
            data: result.results,
            count: result.results.length
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch statistics'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleInsights(env: Env): Promise<Response> {
    try {
        const result = await env.DSE_DB.prepare(
            'SELECT * FROM analysis_insights ORDER BY created_at DESC'
        ).all();

        return new Response(JSON.stringify({
            success: true,
            data: result.results
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch insights'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleAnalysis(env: Env): Promise<Response> {
    try {
        // Perform complex analysis queries
        const monthlyAvg = await env.DSE_DB.prepare(`
            SELECT
                strftime('%Y-%m', date) as month,
                AVG(search_interest) as avg_interest,
                MAX(search_interest) as max_interest,
                COUNT(*) as data_points
            FROM dse_statistics
            GROUP BY strftime('%Y-%m', date)
            ORDER BY month DESC
            LIMIT 12
        `).all();

        const yearlyTrend = await env.DSE_DB.prepare(`
            SELECT
                strftime('%Y', date) as year,
                AVG(search_interest) as avg_interest,
                MAX(search_interest) as max_interest,
                MIN(search_interest) as min_interest,
                COUNT(*) as data_points
            FROM dse_statistics
            GROUP BY strftime('%Y', date)
            ORDER BY year DESC
        `).all();

        return new Response(JSON.stringify({
            success: true,
            monthly_analysis: monthlyAvg.results,
            yearly_trends: yearlyTrend.results
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to perform analysis'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleDataPage(env: Env): Promise<Response> {
    try {
        const stats = await env.DSE_DB.prepare(
            'SELECT * FROM dse_statistics ORDER BY date DESC'
        ).all();

        const insights = await env.DSE_DB.prepare(
            'SELECT * FROM analysis_insights ORDER BY insight_type, created_at DESC'
        ).all();

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DSE Data Explorer</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { padding: 12px; text-align left; border-bottom: 1px solid #ddd; }
                th { background: #667eea; color: white; }
                .nav-link { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
                .metric { font-size: 1.5em; font-weight: bold; color: #764ba2; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔍 DSE Data Explorer</h1>
                    <a href="/" class="nav-link">← Back to Dashboard</a>
                </div>

                <div class="section">
                    <h2>📊 Statistics Summary</h2>
                    <p>Total Records: <span class="metric">${stats.results.length}</span></p>
                </div>

                <div class="section">
                    <h2>📈 Search Interest Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Search Interest</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.results?.map((stat: any) => `
                                <tr>
                                    <td>${stat.date}</td>
                                    <td>${stat.search_interest}</td>
                                    <td>${stat.created_at}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3">No data available</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <h2>💡 Analysis Insights</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${insights.results?.map((insight: any) => `
                                <tr>
                                    <td>${insight.insight_type}</td>
                                    <td>${insight.title}</td>
                                    <td>${insight.description}</td>
                                    <td>${insight.value}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="4">No insights available</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </body>
        </html>
        `;

        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    } catch (error) {
        return new Response(`Error loading data: ${error}`, { status: 500 });
    }
}

// New handler functions for performance data

async function handlePerformance(env: Env): Promise<Response> {
    try {
        const performance = await env.DSE_DB.prepare(`
            SELECT * FROM dse_performance
            WHERE year = 2025
            ORDER BY total_candidates DESC
        `).all();

        return new Response(JSON.stringify({
            success: true,
            data: performance.results
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch performance data'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleRegistration(env: Env): Promise<Response> {
    try {
        const registration = await env.DSE_DB.prepare(`
            SELECT * FROM dse_registration
            WHERE year = 2025
            ORDER BY registered_candidates DESC
        `).all();

        return new Response(JSON.stringify({
            success: true,
            data: registration.results
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch registration data'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleSubjects(env: Env): Promise<Response> {
    try {
        const subjects = await env.DSE_DB.prepare(`
            SELECT * FROM subject_trends
            WHERE year = 2025
            ORDER BY popularity_rank ASC
        `).all();

        return new Response(JSON.stringify({
            success: true,
            data: subjects.results
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch subject trends'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handlePerformancePage(env: Env): Promise<Response> {
    try {
        const performance = await env.DSE_DB.prepare(`
            SELECT * FROM dse_performance
            WHERE year = 2025
            ORDER BY total_candidates DESC
        `).all();

        const topPerformers = await env.DSE_DB.prepare(`
            SELECT subject_name, total_candidates,
                   ROUND((level_5_star_star + level_5_star + level_5) * 100.0 / total_candidates, 2) as distinction_rate,
                   mean_score, standard_deviation
            FROM dse_performance
            WHERE year = 2025
            ORDER BY distinction_rate DESC
            LIMIT 10
        `).all();

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DSE Performance Analysis</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
                .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; color: white; margin-bottom: 40px; }
                .header h1 { font-size: 3rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
                .nav-links { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; }
                .nav-link { background: rgba(255,255,255,0.2); color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; transition: all 0.3s ease; backdrop-filter: blur(10px); }
                .nav-link:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
                .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-bottom: 40px; }
                .card { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
                .card:hover { transform: translateY(-5px); }
                .card h3 { color: #667eea; margin-bottom: 15px; font-size: 1.5rem; }
                .metric { font-size: 2rem; font-weight: bold; color: #764ba2; margin: 10px 0; }
                .performance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
                .subject-card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
                .level-bar { display: flex; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }
                .level-5ss { background: #ff6b6b; }
                .level-5s { background: #4ecdc4; }
                .level-5 { background: #45b7d1; }
                .level-4 { background: #96ceb4; }
                .level-3 { background: #feca57; }
                .level-2 { background: #ff9ff3; }
                .level-1 { background: #ddd; }
                .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 15px 0; }
                .stat-item { text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px; }
                .stat-value { font-size: 1.2em; font-weight: bold; color: #667eea; }
                .stat-label { font-size: 0.9em; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📊 DSE Performance Analysis 2025</h1>
                    <p>Comprehensive analysis of student performance and grade distribution</p>
                </div>

                <div class="nav-links">
                    <a href="/" class="nav-link">Dashboard</a>
                    <a href="/performance" class="nav-link">Performance</a>
                    <a href="/subjects" class="nav-link">Subjects</a>
                    <a href="/data" class="nav-link">Raw Data</a>
                </div>

                <div class="dashboard">
                    <div class="card">
                        <h3>🎯 Total DSE Candidates</h3>
                        <div class="metric">48,542</div>
                        <p>2025 DSE candidates</p>
                    </div>
                    <div class="card">
                        <h3>⭐ Top Subject</h3>
                        <div class="metric">${topPerformers.results[0]?.subject_name || 'N/A'}</div>
                        <p>${topPerformers.results[0]?.distinction_rate || 0}% distinction rate</p>
                    </div>
                    <div class="card">
                        <h3>📈 Average Score</h3>
                        <div class="metric">${(performance.results.reduce((sum: number, p: any) => sum + p.mean_score, 0) / performance.results.length).toFixed(1)}</div>
                        <p>Overall mean performance</p>
                    </div>
                </div>

                <div class="performance-grid">
                    ${performance.results?.map((subject: any) => {
                        const total = subject.total_candidates;
                        const levels = [
                            { name: '5**', count: subject.level_5_star_star, class: 'level-5ss' },
                            { name: '5*', count: subject.level_5_star, class: 'level-5s' },
                            { name: '5', count: subject.level_5, class: 'level-5' },
                            { name: '4', count: subject.level_4, class: 'level-4' },
                            { name: '3', count: subject.level_3, class: 'level-3' },
                            { name: '2', count: subject.level_2, class: 'level-2' },
                            { name: '1', count: subject.level_1, class: 'level-1' }
                        ];

                        return `
                        <div class="subject-card">
                            <h4>${subject.subject_name}</h4>
                            <div class="stats-row">
                                <div class="stat-item">
                                    <div class="stat-value">${total.toLocaleString()}</div>
                                    <div class="stat-label">Candidates</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${subject.mean_score}</div>
                                    <div class="stat-label">Mean Score</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${((subject.level_5_star_star + subject.level_5_star + subject.level_5) * 100 / total).toFixed(1)}%</div>
                                    <div class="stat-label">Distinction</div>
                                </div>
                            </div>
                            <div class="level-bar">
                                ${levels.map(level => `
                                    <div class="${level.class}" style="width: ${(level.count * 100 / total).toFixed(1)}%;" title="${level.name}: ${level.count} (${(level.count * 100 / total).toFixed(1)}%)"></div>
                                `).join('')}
                            </div>
                            <div style="font-size: 0.8em; color: #666; margin-top: 5px;">
                                Grade distribution: 5** (${(subject.level_5_star_star * 100 / total).toFixed(1)}%) •
                                5* (${(subject.level_5_star * 100 / total).toFixed(1)}%) •
                                5 (${(subject.level_5 * 100 / total).toFixed(1)}%)
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </body>
        </html>
        `;

        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    } catch (error) {
        return new Response(`Error loading performance data: ${error}`, { status: 500 });
    }
}

async function handleSubjectsPage(env: Env): Promise<Response> {
    try {
        const subjects = await env.DSE_DB.prepare(`
            SELECT st.*, dp.total_candidates, dp.mean_score
            FROM subject_trends st
            LEFT JOIN dse_performance dp ON st.subject_code = dp.subject_code AND st.year = dp.year
            WHERE st.year = 2025
            ORDER BY st.popularity_rank ASC
        `).all();

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DSE Subject Analysis</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
                .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; color: white; margin-bottom: 40px; }
                .header h1 { font-size: 3rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
                .nav-links { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; }
                .nav-link { background: rgba(255,255,255,0.2); color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; transition: all 0.3s ease; backdrop-filter: blur(10px); }
                .nav-link:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
                .subjects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
                .subject-card { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s ease; position: relative; }
                .subject-card:hover { transform: translateY(-5px); }
                .rank-badge { position: absolute; top: -10px; right: -10px; background: #ff6b6b; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
                .subject-name { color: #667eea; font-size: 1.4rem; margin-bottom: 15px; }
                .metrics-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
                .metric-box { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px; }
                .metric-value { font-size: 1.5rem; font-weight: bold; color: #764ba2; }
                .metric-label { font-size: 0.9rem; color: #666; margin-top: 5px; }
                .difficulty-bar { width: 100%; height: 10px; background: #e0e0e0; border-radius: 5px; margin: 10px 0; }
                .difficulty-fill { height: 100%; border-radius: 5px; transition: width 0.3s ease; }
                .difficulty-easy { background: #4caf50; }
                .difficulty-medium { background: #ff9800; }
                .difficulty-hard { background: #f44336; }
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px; }
                .stat-mini { text-align: center; padding: 10px; background: #f1f3f4; border-radius: 8px; }
                .stat-mini .value { font-weight: bold; color: #667eea; }
                .stat-mini .label { font-size: 0.8rem; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📚 DSE Subject Analysis 2025</h1>
                    <p>Detailed analysis of subject popularity, difficulty, and performance trends</p>
                </div>

                <div class="nav-links">
                    <a href="/" class="nav-link">Dashboard</a>
                    <a href="/performance" class="nav-link">Performance</a>
                    <a href="/subjects" class="nav-link">Subjects</a>
                    <a href="/data" class="nav-link">Raw Data</a>
                </div>

                <div class="subjects-grid">
                    ${subjects.results?.map((subject: any) => {
                        const difficultyPercentage = (subject.difficulty_index / 10) * 100;
                        const difficultyClass = subject.difficulty_index <= 3 ? 'difficulty-easy' :
                                              subject.difficulty_index <= 7 ? 'difficulty-medium' : 'difficulty-hard';

                        return `
                        <div class="subject-card">
                            <div class="rank-badge">#${subject.popularity_rank}</div>
                            <h3 class="subject-name">${subject.subject_name}</h3>
                            <p><strong>Code:</strong> ${subject.subject_code}</p>

                            <div class="metrics-row">
                                <div class="metric-box">
                                    <div class="metric-value">${subject.total_candidates?.toLocaleString() || 'N/A'}</div>
                                    <div class="metric-label">Candidates</div>
                                </div>
                                <div class="metric-box">
                                    <div class="metric-value">${subject.mean_score || 'N/A'}</div>
                                    <div class="metric-label">Mean Score</div>
                                </div>
                            </div>

                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span>Difficulty Index</span>
                                    <span style="font-weight: bold; color: #667eea;">${subject.difficulty_index}/10</span>
                                </div>
                                <div class="difficulty-bar">
                                    <div class="difficulty-fill ${difficultyClass}" style="width: ${difficultyPercentage}%;"></div>
                                </div>
                            </div>

                            <div class="stats-grid">
                                <div class="stat-mini">
                                    <div class="value">${subject.pass_rate}%</div>
                                    <div class="label">Pass Rate</div>
                                </div>
                                <div class="stat-mini">
                                    <div class="value">${subject.distinction_rate}%</div>
                                    <div class="label">Distinction</div>
                                </div>
                                <div class="stat-mini">
                                    <div class="value">#${subject.popularity_rank}</div>
                                    <div class="label">Popularity</div>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </body>
        </html>
        `;

        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    } catch (error) {
        return new Response(`Error loading subjects data: ${error}`, { status: 500 });
    }
}
