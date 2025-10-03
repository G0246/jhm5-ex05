/**
 * Subjects Page JavaScript
 * Handles loading and displaying subject analysis data
 */

async function loadSubjectsData() {
    try {
        // Load subject trends
        const subjectsResponse = await fetch('/api/subjects');
        const subjectsData = await subjectsResponse.json();

        // Load performance data for additional metrics
        const performanceResponse = await fetch('/api/performance');
        const performanceData = await performanceResponse.json();

        if (!subjectsData.success || !performanceData.success) {
            throw new Error('Failed to load subjects data');
        }

        // Merge data
        const subjects = subjectsData.data.map(subject => {
            const performance = performanceData.data.find(p => p.subject_code === subject.subject_code);
            return {
                ...subject,
                total_candidates: performance?.total_candidates || 0,
                mean_score: performance?.mean_score || 0
            };
        });

        renderSubjectsGrid(subjects);

    } catch (error) {
        console.error('Error loading subjects data:', error);
        DSEAnalytics.showError('Failed to load subjects data');
    }
}

function renderSubjectsGrid(subjects) {
    const grid = document.getElementById('subjectsGrid');
    if (!grid) return;

    grid.innerHTML = subjects.map(subject => {
        const difficultyPercentage = (subject.difficulty_index / 10) * 100;
        const difficultyClass = subject.difficulty_index <= 3 ? 'difficulty-easy' :
                              subject.difficulty_index <= 7 ? 'difficulty-medium' : 'difficulty-hard';

        return `
        <div class="subject-card" style="position: relative;">
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
    }).join('');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadSubjectsData);