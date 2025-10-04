/**
 * Performance Page JavaScript
 * Enhanced performance analysis with modern UI integration
 */

class PerformanceAnalytics {
    constructor() {
        this.performanceData = null;
        this.chart = null;
    }

    async init() {
        try {
            await this.loadPerformanceData();
            this.renderPerformanceOverview();
            this.renderDetailedAnalysis();
            this.renderPerformanceChart();
            this.renderDifficultyAnalysis();
        } catch (error) {
            console.error('Failed to initialize performance analytics:', error);
            this.showError('Failed to load performance data');
        }
    }

    async loadPerformanceData() {
        const response = await fetch('/api/subjects/performance');
        const data = await response.json();

        if (!data.success) {
            throw new Error('Failed to load performance data');
        }

        this.performanceData = data.data;
    }

    renderPerformanceOverview() {
        const container = document.getElementById('performance-overview');
        if (!container || !this.performanceData) return;

        const overview = this.calculateOverviewStats();

        container.innerHTML = `
            <div class="stat-card primary">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                    <div class="stat-value">${overview.totalSubjects}</div>
                    <div class="stat-label">Analyzed Subjects</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                    <div class="stat-value">${overview.totalCandidates.toLocaleString()}</div>
                    <div class="stat-label">Total Candidates</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-content">
                    <div class="stat-value">${overview.avgMeanScore}</div>
                    <div class="stat-label">Average Mean Score</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-content">
                    <div class="stat-value">${overview.avgDistinctionRate}%</div>
                    <div class="stat-label">Avg Distinction Rate</div>
                </div>
            </div>
        `;
    }

    renderDetailedAnalysis() {
        const container = document.getElementById('subject-analysis');
        if (!container || !this.performanceData) return;

        container.innerHTML = this.performanceData.map(subject => {
            const total = subject.total_candidates;
            const distinctionCount = subject.level_5_star_star + subject.level_5_star + subject.level_5;
            const distinctionRate = (distinctionCount * 100 / total).toFixed(1);
            const passCount = total - (subject.level_u || 0);
            const passRate = (passCount * 100 / total).toFixed(1);

            return `
                <div class="subject-analysis-card">
                    <div class="subject-header">
                        <h3 class="subject-name">${subject.subject_name}</h3>
                        <div class="subject-difficulty ${this.getDifficultyClass(subject.mean_score)}">
                            ${this.getDifficultyLabel(subject.mean_score)}
                        </div>
                    </div>

                    <div class="subject-stats">
                        <div class="stat-row">
                            <div class="stat-item">
                                <div class="stat-value">${total.toLocaleString()}</div>
                                <div class="stat-label">Candidates</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${subject.mean_score}</div>
                                <div class="stat-label">Mean Score</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${distinctionRate}%</div>
                                <div class="stat-label">Distinction Rate</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${passRate}%</div>
                                <div class="stat-label">Pass Rate</div>
                            </div>
                        </div>
                    </div>

                    <div class="grade-distribution">
                        <h4>Grade Distribution</h4>
                        <div class="grade-bars">
                            ${this.renderGradeBars(subject)}
                        </div>
                        <div class="grade-legend">
                            ${this.renderGradeLegend(subject)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderGradeBars(subject) {
        const total = subject.total_candidates;
        const grades = [
            { level: '5**', count: subject.level_5_star_star, class: 'grade-5ss' },
            { level: '5*', count: subject.level_5_star, class: 'grade-5s' },
            { level: '5', count: subject.level_5, class: 'grade-5' },
            { level: '4', count: subject.level_4, class: 'grade-4' },
            { level: '3', count: subject.level_3, class: 'grade-3' },
            { level: '2', count: subject.level_2, class: 'grade-2' },
            { level: '1', count: subject.level_1, class: 'grade-1' }
        ];

        return grades.map(grade => {
            const percentage = (grade.count * 100 / total).toFixed(1);
            return `
                <div class="grade-bar ${grade.class}"
                     style="width: ${percentage}%;"
                     title="${grade.level}: ${grade.count} candidates (${percentage}%)">
                </div>
            `;
        }).join('');
    }

    renderGradeLegend(subject) {
        const total = subject.total_candidates;
        const grades = [
            { level: '5**', count: subject.level_5_star_star },
            { level: '5*', count: subject.level_5_star },
            { level: '5', count: subject.level_5 },
            { level: '4', count: subject.level_4 },
            { level: '3', count: subject.level_3 },
            { level: '2', count: subject.level_2 },
            { level: '1', count: subject.level_1 }
        ];

        return grades.map(grade => {
            const percentage = (grade.count * 100 / total).toFixed(1);
            return `
                <span class="grade-legend-item">
                    ${grade.level}: ${percentage}%
                </span>
            `;
        }).join(' • ');
    }

    renderPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas || !this.performanceData) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }

        const labels = this.performanceData.map(subject => subject.subject_name);
        const meanScores = this.performanceData.map(subject => parseFloat(subject.mean_score));
        const distinctionRates = this.performanceData.map(subject => {
            const total = subject.total_candidates;
            const distinctionCount = subject.level_5_star_star + subject.level_5_star + subject.level_5;
            return (distinctionCount * 100 / total);
        });

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Mean Score',
                        data: meanScores,
                        backgroundColor: 'rgba(99, 102, 241, 0.7)',
                        borderColor: 'rgb(99, 102, 241)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Distinction Rate (%)',
                        data: distinctionRates,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Mean Score'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Distinction Rate (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Subject Performance Comparison'
                    }
                }
            }
        });
    }

    renderDifficultyAnalysis() {
        const container = document.getElementById('difficulty-analysis');
        if (!container || !this.performanceData) return;

        const analysis = this.analyzeDifficulty();

        container.innerHTML = `
            <div class="difficulty-categories">
                <div class="difficulty-category high">
                    <h4>🔴 High Difficulty (Mean Score < 3.5)</h4>
                    <ul>
                        ${analysis.high.map(subject => `
                            <li>${subject.subject_name} (${subject.mean_score})</li>
                        `).join('')}
                    </ul>
                </div>
                <div class="difficulty-category medium">
                    <h4>🟡 Medium Difficulty (Mean Score 3.5-4.0)</h4>
                    <ul>
                        ${analysis.medium.map(subject => `
                            <li>${subject.subject_name} (${subject.mean_score})</li>
                        `).join('')}
                    </ul>
                </div>
                <div class="difficulty-category low">
                    <h4>🟢 Lower Difficulty (Mean Score > 4.0)</h4>
                    <ul>
                        ${analysis.low.map(subject => `
                            <li>${subject.subject_name} (${subject.mean_score})</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    calculateOverviewStats() {
        if (!this.performanceData) return {};

        const totalSubjects = this.performanceData.length;
        const totalCandidates = this.performanceData.reduce((sum, subject) => sum + subject.total_candidates, 0);
        const avgMeanScore = (this.performanceData.reduce((sum, subject) => sum + parseFloat(subject.mean_score), 0) / totalSubjects).toFixed(2);

        const avgDistinctionRate = (this.performanceData.reduce((sum, subject) => {
            const total = subject.total_candidates;
            const distinctionCount = subject.level_5_star_star + subject.level_5_star + subject.level_5;
            return sum + (distinctionCount * 100 / total);
        }, 0) / totalSubjects).toFixed(1);

        return {
            totalSubjects,
            totalCandidates,
            avgMeanScore,
            avgDistinctionRate
        };
    }

    analyzeDifficulty() {
        if (!this.performanceData) return { high: [], medium: [], low: [] };

        return this.performanceData.reduce((analysis, subject) => {
            const meanScore = parseFloat(subject.mean_score);
            if (meanScore < 3.5) {
                analysis.high.push(subject);
            } else if (meanScore <= 4.0) {
                analysis.medium.push(subject);
            } else {
                analysis.low.push(subject);
            }
            return analysis;
        }, { high: [], medium: [], low: [] });
    }

    getDifficultyClass(meanScore) {
        const score = parseFloat(meanScore);
        if (score < 3.5) return 'difficulty-high';
        if (score <= 4.0) return 'difficulty-medium';
        return 'difficulty-low';
    }

    getDifficultyLabel(meanScore) {
        const score = parseFloat(meanScore);
        if (score < 3.5) return 'High Difficulty';
        if (score <= 4.0) return 'Medium Difficulty';
        return 'Lower Difficulty';
    }

    showError(message) {
        const containers = ['performance-overview', 'subject-analysis', 'difficulty-analysis'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">⚠️</div>
                        <p>${message}</p>
                    </div>
                `;
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const performanceAnalytics = new PerformanceAnalytics();
    performanceAnalytics.init();
});