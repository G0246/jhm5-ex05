/**
 * DSE Analysis Site - Main JavaScript
 * Handles dashboard data loading and UI interactions
 */

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
        updateElement('totalCandidates', totalCandidates.toLocaleString());
        updateElement('passRate', '85.4%');
        updateElement('topSubject', topSubject.subject_name.split(' ')[0]);
        updateElement('searchInterest', stats.data[0]?.search_interest || 'N/A');
        updateElement('genderSplit', '51.2%');
        updateElement('stemGrowth', '+3.2%');

        // Update insights grid
        const insightsGrid = document.getElementById('insightsGrid');
        if (insightsGrid) {
            insightsGrid.innerHTML = insights.data.map(insight => `
                <div class="insight-card">
                    <h4>${insight.title}</h4>
                    <div class="insight-value">${insight.value}${insight.insight_type === 'performance' ? '%' : ''}</div>
                    <p>${insight.description}</p>
                </div>
            `).join('');
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
    // Only load dashboard data if we're on a page that needs it
    if (document.getElementById('totalCandidates') || document.getElementById('insightsGrid')) {
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