/**
 * Performance Page JavaScript
 * Handles loading and displaying performance data
 */

async function loadPerformanceData() {
    try {
        const response = await fetch('/api/performance');
        const data = await response.json();

        if (!data.success) {
            throw new Error('Failed to load performance data');
        }

        const performance = data.data;

        // Calculate top performers
        const topPerformers = performance.map(subject => ({
            ...subject,
            distinction_rate: ((subject.level_5_star_star + subject.level_5_star + subject.level_5) * 100 / subject.total_candidates).toFixed(1)
        })).sort((a, b) => b.distinction_rate - a.distinction_rate);

        // Update dashboard cards
        if (topPerformers.length > 0) {
            DSEAnalytics.updateElement('topSubject', topPerformers[0].subject_name);
            DSEAnalytics.updateElement('topSubjectRate', `${topPerformers[0].distinction_rate}% distinction rate`);
        }

        const averageScore = (performance.reduce((sum, p) => sum + p.mean_score, 0) / performance.length).toFixed(1);
        DSEAnalytics.updateElement('averageScore', averageScore);

        // Render performance grid
        renderPerformanceGrid(performance);

    } catch (error) {
        console.error('Error loading performance data:', error);
        DSEAnalytics.showError('Failed to load performance data');
    }
}

function renderPerformanceGrid(performance) {
    const grid = document.getElementById('performanceGrid');
    if (!grid) return;

    grid.innerHTML = performance.map(subject => {
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
    }).join('');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadPerformanceData);