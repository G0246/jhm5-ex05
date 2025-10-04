/**
 * University Readiness Page JavaScript
 * Enhanced university readiness analysis with comprehensive metrics
 */

class UniversityReadinessAnalytics {
    constructor() {
        this.readinessData = null;
        this.chart = null;
    }

    async init() {
        try {
            await this.loadReadinessData();
            this.renderReadinessOverview();
            this.renderReadinessChart();
            this.renderGradePointAnalysis();
            this.renderAdmissionInsights();
            this.renderCoreRequirements();
        } catch (error) {
            console.error('Failed to initialize university readiness analytics:', error);
            this.showError('Failed to load university readiness data');
        }
    }

    async loadReadinessData() {
        const response = await fetch('/api/university/readiness');
        const data = await response.json();

        if (!data.success) {
            throw new Error('Failed to load university readiness data');
        }

        this.readinessData = data.data;
    }

    renderReadinessOverview() {
        const container = document.getElementById('readiness-overview');
        if (!container || !this.readinessData) return;

        const overview = this.calculateOverviewStats();

        container.innerHTML = `
            <div class="stat-card primary">
                <div class="stat-icon">🎓</div>
                <div class="stat-content">
                    <div class="stat-value">${overview.totalCandidates.toLocaleString()}</div>
                    <div class="stat-label">Total Candidates</div>
                </div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                    <div class="stat-value">${overview.universityReady.toLocaleString()}</div>
                    <div class="stat-label">University Ready</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                    <div class="stat-value">${overview.readinessRate}%</div>
                    <div class="stat-label">Overall Readiness Rate</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-content">
                    <div class="stat-value">${overview.competitiveReady.toLocaleString()}</div>
                    <div class="stat-label">Competitive Programs Ready</div>
                </div>
            </div>
        `;
    }

    renderReadinessChart() {
        const canvas = document.getElementById('readinessChart');
        if (!canvas || !this.readinessData) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }

        const labels = this.readinessData.map(tier => tier.tier_name);
        const candidates = this.readinessData.map(tier => tier.candidate_count);
        const percentages = this.readinessData.map(tier => parseFloat(tier.percentage));

        // Create gradient colors
        const colors = [
            'rgba(239, 68, 68, 0.8)',   // Red for lowest
            'rgba(245, 101, 101, 0.8)',
            'rgba(251, 146, 60, 0.8)',  // Orange
            'rgba(253, 186, 116, 0.8)',
            'rgba(254, 240, 138, 0.8)', // Yellow
            'rgba(163, 230, 53, 0.8)',  // Light green
            'rgba(34, 197, 94, 0.8)',   // Green
            'rgba(16, 185, 129, 0.8)'   // Dark green for highest
        ];

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: candidates,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: colors.slice(0, labels.length).map(color => color.replace('0.8', '1')),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            generateLabels: function(chart) {
                                const data = chart.data;
                                return data.labels.map((label, index) => {
                                    const value = data.datasets[0].data[index];
                                    const percentage = percentages[index];
                                    return {
                                        text: `${label}: ${value.toLocaleString()} (${percentage}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[index],
                                        strokeStyle: data.datasets[0].borderColor[index],
                                        lineWidth: data.datasets[0].borderWidth,
                                        hidden: false,
                                        index: index
                                    };
                                });
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'University Readiness Distribution by Grade Point Range'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label;
                                const value = context.parsed;
                                const percentage = percentages[context.dataIndex];
                                return `${label}: ${value.toLocaleString()} candidates (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderGradePointAnalysis() {
        const container = document.getElementById('grade-point-analysis');
        if (!container || !this.readinessData) return;

        container.innerHTML = `
            <div class="grade-point-grid">
                ${this.readinessData.map(tier => {
                    const readinessLevel = this.getReadinessLevel(tier.tier_name);
                    return `
                        <div class="grade-point-card ${readinessLevel.class}">
                            <div class="tier-header">
                                <h3 class="tier-name">${tier.tier_name}</h3>
                                <div class="tier-badge ${readinessLevel.class}">${readinessLevel.label}</div>
                            </div>
                            <div class="tier-stats">
                                <div class="stat-row">
                                    <div class="stat-item">
                                        <div class="stat-value">${tier.candidate_count.toLocaleString()}</div>
                                        <div class="stat-label">Candidates</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-value">${tier.percentage}%</div>
                                        <div class="stat-label">Percentage</div>
                                    </div>
                                </div>
                            </div>
                            <div class="tier-description">
                                <p>${this.getTierDescription(tier.tier_name)}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderAdmissionInsights() {
        const container = document.getElementById('admission-insights');
        if (!container || !this.readinessData) return;

        const insights = this.generateAdmissionInsights();

        container.innerHTML = `
            <div class="insights-grid">
                <div class="insight-card competitive">
                    <div class="insight-header">
                        <h3>🏆 Competitive Programs</h3>
                        <div class="insight-stat">${insights.competitive.count.toLocaleString()} candidates</div>
                    </div>
                    <div class="insight-content">
                        <p>Candidates with ${insights.competitive.percentage}% eligibility for highly competitive programs (Medicine, Law, Engineering at top universities)</p>
                        <ul>
                            <li>Minimum core subjects: Level 4 or above</li>
                            <li>Strong elective performance required</li>
                            <li>Additional requirements may apply</li>
                        </ul>
                    </div>
                </div>

                <div class="insight-card standard">
                    <div class="insight-header">
                        <h3>🎓 Standard University Entry</h3>
                        <div class="insight-stat">${insights.standard.count.toLocaleString()} candidates</div>
                    </div>
                    <div class="insight-content">
                        <p>Candidates with ${insights.standard.percentage}% meeting standard university admission requirements</p>
                        <ul>
                            <li>Core subjects: Level 3 or above</li>
                            <li>Eligible for most undergraduate programs</li>
                            <li>Good selection of study options</li>
                        </ul>
                    </div>
                </div>

                <div class="insight-card foundation">
                    <div class="insight-header">
                        <h3>📚 Foundation Programs</h3>
                        <div class="insight-stat">${insights.foundation.count.toLocaleString()} candidates</div>
                    </div>
                    <div class="insight-content">
                        <p>Candidates suitable for foundation or associate degree programs</p>
                        <ul>
                            <li>Bridge programs to university</li>
                            <li>Associate degree pathways</li>
                            <li>Vocational training options</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    renderCoreRequirements() {
        const container = document.getElementById('core-requirements');
        if (!container) return;

        container.innerHTML = `
            <div class="requirements-grid">
                <div class="requirement-card">
                    <h3>🔤 Chinese Language</h3>
                    <div class="requirement-details">
                        <p><strong>University Requirement:</strong> Level 3 or above</p>
                        <p><strong>Competitive Programs:</strong> Level 4 or above</p>
                        <div class="requirement-note">
                            Essential for all local university programs. Strong foundation required for academic success.
                        </div>
                    </div>
                </div>

                <div class="requirement-card">
                    <h3>🔤 English Language</h3>
                    <div class="requirement-details">
                        <p><strong>University Requirement:</strong> Level 3 or above</p>
                        <p><strong>Competitive Programs:</strong> Level 4 or above</p>
                        <div class="requirement-note">
                            Critical for academic communication and international opportunities. Higher levels preferred.
                        </div>
                    </div>
                </div>

                <div class="requirement-card">
                    <h3>🔢 Mathematics</h3>
                    <div class="requirement-details">
                        <p><strong>University Requirement:</strong> Level 2 or above</p>
                        <p><strong>STEM Programs:</strong> Level 4 or above</p>
                        <div class="requirement-note">
                            Basic requirement for most programs. Higher levels essential for STEM and business studies.
                        </div>
                    </div>
                </div>

                <div class="requirement-card">
                    <h3>🌐 Liberal Studies / Citizenship</h3>
                    <div class="requirement-details">
                        <p><strong>University Requirement:</strong> Level 2 or above</p>
                        <p><strong>General Requirement:</strong> All programs</p>
                        <div class="requirement-note">
                            Develops critical thinking and civic awareness. Required component of core curriculum.
                        </div>
                    </div>
                </div>
            </div>

            <div class="requirements-summary">
                <h4>Summary of University Admission Requirements</h4>
                <div class="summary-content">
                    <div class="summary-item">
                        <strong>Minimum Entry:</strong> 3-3-2-2 (Chinese, English, Math, LS/Citizenship)
                    </div>
                    <div class="summary-item">
                        <strong>Competitive Entry:</strong> 4-4-4-3 or better with strong electives
                    </div>
                    <div class="summary-item">
                        <strong>Additional Requirements:</strong> Subject-specific requirements vary by program
                    </div>
                </div>
            </div>
        `;
    }

    calculateOverviewStats() {
        if (!this.readinessData) return {};

        const totalCandidates = this.readinessData.reduce((sum, tier) => sum + tier.candidate_count, 0);

        // University ready: candidates with reasonable chance (assuming 3322 minimum)
        const universityReady = this.readinessData
            .filter(tier => this.isUniversityReady(tier.tier_name))
            .reduce((sum, tier) => sum + tier.candidate_count, 0);

        // Competitive ready: top tier candidates
        const competitiveReady = this.readinessData
            .filter(tier => this.isCompetitiveReady(tier.tier_name))
            .reduce((sum, tier) => sum + tier.candidate_count, 0);

        const readinessRate = ((universityReady * 100) / totalCandidates).toFixed(1);

        return {
            totalCandidates,
            universityReady,
            competitiveReady,
            readinessRate
        };
    }

    generateAdmissionInsights() {
        if (!this.readinessData) return {};

        const totalCandidates = this.readinessData.reduce((sum, tier) => sum + tier.candidate_count, 0);

        const competitive = this.readinessData
            .filter(tier => this.isCompetitiveReady(tier.tier_name))
            .reduce((acc, tier) => ({
                count: acc.count + tier.candidate_count,
                percentage: acc.percentage
            }), { count: 0, percentage: 0 });
        competitive.percentage = ((competitive.count * 100) / totalCandidates).toFixed(1);

        const standard = this.readinessData
            .filter(tier => this.isUniversityReady(tier.tier_name) && !this.isCompetitiveReady(tier.tier_name))
            .reduce((acc, tier) => ({
                count: acc.count + tier.candidate_count,
                percentage: acc.percentage
            }), { count: 0, percentage: 0 });
        standard.percentage = ((standard.count * 100) / totalCandidates).toFixed(1);

        const foundation = this.readinessData
            .filter(tier => !this.isUniversityReady(tier.tier_name))
            .reduce((acc, tier) => ({
                count: acc.count + tier.candidate_count,
                percentage: acc.percentage
            }), { count: 0, percentage: 0 });
        foundation.percentage = ((foundation.count * 100) / totalCandidates).toFixed(1);

        return { competitive, standard, foundation };
    }

    getReadinessLevel(tierName) {
        if (this.isCompetitiveReady(tierName)) {
            return { class: 'competitive', label: 'Highly Competitive' };
        } else if (this.isUniversityReady(tierName)) {
            return { class: 'ready', label: 'University Ready' };
        } else {
            return { class: 'foundation', label: 'Foundation Level' };
        }
    }

    isCompetitiveReady(tierName) {
        // Assuming higher grade point ranges indicate competitive readiness
        return tierName.includes('20-24') || tierName.includes('16-19') || tierName.includes('Above');
    }

    isUniversityReady(tierName) {
        // Assuming mid-range and above indicate university readiness
        return !tierName.includes('0-7') && !tierName.includes('8-11');
    }

    getTierDescription(tierName) {
        const descriptions = {
            '20-24': 'Excellent performance across all core subjects. Ready for the most competitive university programs.',
            '16-19': 'Strong academic performance. Suitable for most university programs with good prospects.',
            '12-15': 'Good performance meeting standard university entry requirements.',
            '8-11': 'Adequate performance. May benefit from foundation programs or targeted improvement.',
            '4-7': 'Basic performance level. Foundation programs recommended for university pathway.',
            '0-3': 'Additional support needed. Consider alternative education pathways.'
        };

        // Find matching description based on tier name
        for (const [range, description] of Object.entries(descriptions)) {
            if (tierName.includes(range)) {
                return description;
            }
        }

        return 'Performance level analysis based on core subject grade points.';
    }

    showError(message) {
        const containers = ['readiness-overview', 'grade-point-analysis', 'admission-insights', 'core-requirements'];
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
    const universityAnalytics = new UniversityReadinessAnalytics();
    universityAnalytics.init();
});