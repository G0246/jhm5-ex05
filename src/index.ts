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

        // Handle different routes
        switch (path) {
            case '/':
                return handleHomePage(env);
            case '/api/statistics':
                return handleStatistics(env);
            case '/api/insights':
                return handleInsights(env);
            case '/api/analysis':
                return handleAnalysis(env);
            case '/data':
                return handleDataPage(env);
            default:
                return new Response('Not Found', { status: 404 });
        }
    },
} satisfies ExportedHandler<Env>;

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
                <a href="/data" class="nav-link">Raw Data</a>
                <a href="/api/statistics" class="nav-link">API Stats</a>
                <a href="/api/insights" class="nav-link">API Insights</a>
            </div>

            <div class="dashboard">
                <div class="card">
                    <h3>📈 Current Interest Level</h3>
                    <div class="metric" id="currentInterest">Loading...</div>
                    <p>Latest search interest score</p>
                </div>

                <div class="card">
                    <h3>📊 Average Interest</h3>
                    <div class="metric" id="avgInterest">Loading...</div>
                    <p>Historical average score</p>
                </div>

                <div class="card">
                    <h3>🏆 Peak Interest</h3>
                    <div class="metric" id="peakInterest">Loading...</div>
                    <p>Highest recorded score</p>
                </div>

                <div class="card">
                    <h3>📅 Data Points</h3>
                    <div class="metric" id="totalPoints">Loading...</div>
                    <p>Total records in database</p>
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
                    // Load statistics
                    const statsResponse = await fetch('/api/statistics');
                    const stats = await statsResponse.json();

                    // Load insights
                    const insightsResponse = await fetch('/api/insights');
                    const insights = await insightsResponse.json();

                    // Update dashboard metrics
                    const currentInterest = stats.data[0]?.search_interest || 0;
                    const avgInterest = Math.round(stats.data.reduce((sum, item) => sum + item.search_interest, 0) / stats.data.length);
                    const peakInterest = Math.max(...stats.data.map(item => item.search_interest));

                    document.getElementById('currentInterest').textContent = currentInterest;
                    document.getElementById('avgInterest').textContent = avgInterest;
                    document.getElementById('peakInterest').textContent = peakInterest;
                    document.getElementById('totalPoints').textContent = stats.data.length;

                    // Update insights grid
                    const insightsGrid = document.getElementById('insightsGrid');
                    insightsGrid.innerHTML = insights.data.map(insight => \`
                        <div class="insight-card">
                            <h4>\${insight.title}</h4>
                            <div class="insight-value">\${insight.value}%</div>
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
