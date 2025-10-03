
/**
 * DSE Analysis Site - Main JavaScript
 * Handles dashboard data loading and UI interactions
 */

// Load dashboard data
async function loadDashboard() {
    console.log('Starting dashboard load...');
    try {
        // Load performance data
        const performanceResponse = await fetch('/api/performance');
        if (!performanceResponse.ok) {
            throw new Error(`Performance API failed: ${performanceResponse.status}`);
        }
        const performance = await performanceResponse.json();
        console.log('Performance data loaded:', performance.success);

        // Load insights
        const insightsResponse = await fetch('/api/insights');
        if (!insightsResponse.ok) {
            throw new Error(`Insights API failed: ${insightsResponse.status}`);
        }
        const insights = await insightsResponse.json();
        console.log('Insights data loaded:', insights.success, 'Items:', insights.data?.length);

        // Find top performing subject (highest distinction rate)
        const topSubject = performance.data.reduce((top, subject) => {
            const distinctions = subject.level_5_star_star + subject.level_5_star + subject.level_5;
            const rate = (distinctions / subject.total_candidates) * 100;
            const topRate = (top.level_5_star_star + top.level_5_star + top.level_5) / top.total_candidates * 100;
            return rate > topRate ? subject : top;
        });

        // Get total candidates from insights (55,781 across all categories)
        const totalCandidatesInsight = insights.data.find(insight =>
            insight.title.includes('Total DSE Candidates')
        );
        const totalCandidates = totalCandidatesInsight ? totalCandidatesInsight.value : 55781;

        // Update dashboard metrics
        updateElement('totalCandidates', totalCandidates.toLocaleString());
        updateElement('passRate', '85.4%');
        updateElement('topSubject', topSubject.subject_name.split(' ')[0]);
        updateElement('genderSplit', '51.2%');

        // Update insights grid
        const insightsGrid = document.getElementById('insightsGrid');
        console.log('InsightsGrid element found:', !!insightsGrid);
        if (insightsGrid && insights && insights.success && insights.data) {
            console.log('Loading insights:', insights.data.length, 'items');
            insightsGrid.innerHTML = insights.data.map(insight => {
                // Format the value properly based on insight type
                let displayValue = insight.value;
                if (insight.insight_type === 'performance' && insight.value < 100) {
                    displayValue = insight.value + '%';
                } else if (insight.insight_type === 'registration' && insight.title.includes('Rate')) {
                    displayValue = insight.value + '%';
                } else if (insight.value > 1000) {
                    displayValue = insight.value.toLocaleString();
                } else {
                    displayValue = insight.value;
                }

                return `
                    <div class="insight-card">
                        <h4>${insight.title}</h4>
                        <div class="insight-value">${displayValue}</div>
                        <p>${insight.description}</p>
                    </div>
                `;
            }).join('');
        } else {
            console.error('Failed to load insights:', insights);
            if (insightsGrid) {
                insightsGrid.innerHTML = '<div class="error">Failed to load insights</div>';
            }
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

// Utility function to safely update element content
function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #ff6b6b;
        color: white;
        padding: 15px;
        border-radius: 8px;
        margin: 20px;
        text-align: center;
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for dashboard elements...');
    const hasTotalCandidates = !!document.getElementById('totalCandidates');
    const hasInsightsGrid = !!document.getElementById('insightsGrid');
    console.log('Has totalCandidates:', hasTotalCandidates, 'Has insightsGrid:', hasInsightsGrid);

    // Only load dashboard data if we're on a page that needs it
    if (hasTotalCandidates || hasInsightsGrid) {
        console.log('Loading dashboard...');
        loadDashboard();
    }
});

// Add smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
});

// Add loading states for dynamic content
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading">Loading...</div>';
    }
}

// Add fade-in animation for cards
function animateCards() {
    const cards = document.querySelectorAll('.card, .subject-card, .insight-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Initialize animations when page loads
window.addEventListener('load', function() {
    animateCards();
});

// Export functions for use in other scripts
window.DSEAnalytics = {
    loadDashboard,
    updateElement,
    showError,
    showLoading,
    animateCards
};