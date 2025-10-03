/**
 * DSE Analysis Site - Cloudflare Workers with D1 Database
 * Clean version with separated static content
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

// Serve static files
async function serveStaticFile(path: string): Promise<Response> {
    const filePath = path.startsWith('/') ? path.slice(1) : path;

    const staticFiles = getStaticFiles();
    const file = staticFiles[filePath];

    if (file) {
        return new Response(file.content, {
            headers: {
                'Content-Type': file.contentType,
                'Cache-Control': 'public, max-age=3600'
            }
        });
    }

    return new Response('File not found', { status: 404 });
}

// Static file contents
function getStaticFiles(): Record<string, { content: string; contentType: string }> {
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
        'performance.html': {
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSE Performance Analysis</title>
    <link rel="stylesheet" href="/css/main.css">
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
        <div class="performance-grid" id="performanceGrid">
            <div class="loading">Loading performance data...</div>
        </div>
    </div>
    <script src="/js/main.js"></script>
    <script src="/js/performance.js"></script>
</body>
</html>`,
            contentType: 'text/html; charset=utf-8'
        },
        'subjects.html': {
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSE Subject Analysis</title>
    <link rel="stylesheet" href="/css/main.css">
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
        <div class="subjects-grid" id="subjectsGrid">
            <div class="loading">Loading subjects data...</div>
        </div>
    </div>
    <script src="/js/main.js"></script>
    <script src="/js/subjects.js"></script>
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
.loading { text-align: center; padding: 20px; color: #666; }
.performance-grid, .subjects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
.subject-card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); position: relative; }
.rank-badge { position: absolute; top: -10px; right: -10px; background: #ff6b6b; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.subject-name { color: #667eea; font-size: 1.4rem; margin-bottom: 15px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px; }
.stat-mini { text-align: center; padding: 10px; background: #f1f3f4; border-radius: 8px; }
@media (max-width: 768px) { .container { padding: 10px; } .header h1 { font-size: 2rem; } .dashboard, .performance-grid, .subjects-grid { grid-template-columns: 1fr; } }`,
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
        },
        'js/performance.js': {
            content: `// Performance Page JavaScript
async function loadPerformanceData() {
    try {
        const response = await fetch('/api/performance');
        const data = await response.json();

        const performance = data.data;
        const grid = document.getElementById('performanceGrid');
        if (!grid) return;

        grid.innerHTML = performance.map(subject => {
            const total = subject.total_candidates;
            const distinctionRate = ((subject.level_5_star_star + subject.level_5_star + subject.level_5) * 100 / total).toFixed(1);

            return \`
            <div class="subject-card">
                <h4>\${subject.subject_name}</h4>
                <p><strong>Candidates:</strong> \${total.toLocaleString()}</p>
                <p><strong>Mean Score:</strong> \${subject.mean_score}</p>
                <p><strong>Distinction Rate:</strong> \${distinctionRate}%</p>
            </div>
            \`;
        }).join('');
    } catch (error) {
        console.error('Error loading performance data:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadPerformanceData);`,
            contentType: 'application/javascript; charset=utf-8'
        },
        'js/subjects.js': {
            content: `// Subjects Page JavaScript
async function loadSubjectsData() {
    try {
        const response = await fetch('/api/subjects');
        const data = await response.json();

        const subjects = data.data;
        const grid = document.getElementById('subjectsGrid');
        if (!grid) return;

        grid.innerHTML = subjects.map(subject => \`
            <div class="subject-card">
                <div class="rank-badge">#\${subject.popularity_rank}</div>
                <h3 class="subject-name">\${subject.subject_name}</h3>
                <p><strong>Code:</strong> \${subject.subject_code}</p>
                <p><strong>Pass Rate:</strong> \${subject.pass_rate}%</p>
                <p><strong>Distinction Rate:</strong> \${subject.distinction_rate}%</p>
                <p><strong>Difficulty:</strong> \${subject.difficulty_index}/10</p>
            </div>
        \`).join('');
    } catch (error) {
        console.error('Error loading subjects data:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadSubjectsData);`,
            contentType: 'application/javascript; charset=utf-8'
        }
    };
}

// API Handlers
async function handleStatistics(env: Env): Promise<Response> {
    try {
        const result = await env.DSE_DB.prepare(
            'SELECT * FROM dse_statistics ORDER BY date DESC LIMIT 100'
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
            'SELECT * FROM dse_insights ORDER BY insight_type, created_at DESC'
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

        return new Response(JSON.stringify({
            success: true,
            monthly_analysis: monthlyAvg.results
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

async function handleDataPage(env: Env): Promise<Response> {
    try {
        const stats = await env.DSE_DB.prepare(
            'SELECT * FROM dse_statistics ORDER BY date DESC LIMIT 50'
        ).all();

        const insights = await env.DSE_DB.prepare(
            'SELECT * FROM dse_insights ORDER BY insight_type, created_at DESC'
        ).all();

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DSE Data Explorer</title>
            <link rel="stylesheet" href="/css/main.css">
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔍 DSE Data Explorer</h1>
                    <div class="nav-links">
                        <a href="/" class="nav-link">← Back to Dashboard</a>
                    </div>
                </div>

                <div class="chart-container">
                    <h2>📊 Recent Statistics</h2>
                    <p>Records: ${stats.results.length}</p>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #1e40af; color: white;">
                                    <th style="padding: 12px; text-align: left;">Date</th>
                                    <th style="padding: 12px; text-align: left;">Search Interest</th>
                                    <th style="padding: 12px; text-align: left;">Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${stats.results?.map((stat: any) => `
                                    <tr style="border-bottom: 1px solid #ddd;">
                                        <td style="padding: 12px;">${stat.date}</td>
                                        <td style="padding: 12px;">${stat.search_interest}</td>
                                        <td style="padding: 12px;">${stat.created_at}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="3" style="padding: 20px; text-align: center;">No data available</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="chart-container">
                    <h2>💡 Analysis Insights</h2>
                    <div class="insights-grid">
                        ${insights.results?.map((insight: any) => `
                            <div class="insight-card">
                                <h4>${insight.title}</h4>
                                <div class="insight-value">${insight.value}${insight.insight_type === 'performance' ? '%' : ''}</div>
                                <p>${insight.description}</p>
                            </div>
                        `).join('') || '<p>No insights available</p>'}
                    </div>
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