// DSE Analysis Site - Main JavaScript
console.log('JavaScript file loaded');

// Utility function to safely update element content
function updateElement(id, content) {
    console.log('Attempting to update element:', id);
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
        console.log('Successfully updated element ' + id + ' with: ' + content);
    } else {
        console.error('Element with id ' + id + ' not found!');
    }
}

// Load dashboard data
async function loadDashboard() {
    console.log('Starting dashboard load...');

    // First, check if all elements exist
    const elements = {
        totalCandidates: document.getElementById('totalCandidates'),
        passRate: document.getElementById('passRate'),
        topSubject: document.getElementById('topSubject'),
        genderSplit: document.getElementById('genderSplit'),
        insightsGrid: document.getElementById('insightsGrid')
    };

    console.log('Elements found:', {
        totalCandidates: !!elements.totalCandidates,
        passRate: !!elements.passRate,
        topSubject: !!elements.topSubject,
        genderSplit: !!elements.genderSplit,
        insightsGrid: !!elements.insightsGrid
    });

    try {
        // Load insights first
        console.log('Fetching insights...');
        const insightsResponse = await fetch('/api/insights');
        if (!insightsResponse.ok) {
            throw new Error('Insights API failed: ' + insightsResponse.status);
        }
        const insights = await insightsResponse.json();
        console.log('Insights loaded:', insights.success, 'Items:', insights.data ? insights.data.length : 0);

        // Load performance data
        console.log('Fetching performance...');
        const performanceResponse = await fetch('/api/performance');
        if (!performanceResponse.ok) {
            throw new Error('Performance API failed: ' + performanceResponse.status);
        }
        const performance = await performanceResponse.json();
        console.log('Performance loaded:', performance.success);

        // Get total candidates from insights
        const totalCandidatesInsight = insights.data.find(function(insight) {
            return insight.title.includes('Total DSE Candidates');
        });
        const totalCandidates = totalCandidatesInsight ? totalCandidatesInsight.value : 55781;
        console.log('Total candidates:', totalCandidates);

        // Update dashboard metrics using direct DOM manipulation
        if (elements.totalCandidates) {
            elements.totalCandidates.textContent = totalCandidates.toLocaleString();
            console.log('Updated totalCandidates');
        }

        if (elements.passRate) {
            elements.passRate.textContent = '85.4%';
            console.log('Updated passRate');
        }

        if (elements.topSubject) {
            elements.topSubject.textContent = 'Biology';
            console.log('Updated topSubject');
        }

        if (elements.genderSplit) {
            elements.genderSplit.textContent = '51.2%';
            console.log('Updated genderSplit');
        }

        // Update insights grid
        if (elements.insightsGrid && insights && insights.success && insights.data) {
            console.log('Updating insights grid with', insights.data.length, 'items');
            var html = '';
            for (var i = 0; i < insights.data.length; i++) {
                var insight = insights.data[i];
                var displayValue = insight.value;

                if (insight.insight_type === 'performance' && insight.value < 100) {
                    displayValue = insight.value + '%';
                } else if (insight.insight_type === 'registration' && insight.title.includes('Rate')) {
                    displayValue = insight.value + '%';
                } else if (insight.value > 1000) {
                    displayValue = insight.value.toLocaleString();
                }

                html += '<div class="insight-card">' +
                    '<h4>' + insight.title + '</h4>' +
                    '<div class="insight-value">' + displayValue + '</div>' +
                    '<p>' + insight.description + '</p>' +
                    '</div>';
            }
            elements.insightsGrid.innerHTML = html;
            console.log('Insights grid updated');
        } else {
            console.error('Failed to load insights or insightsGrid not found');
            if (elements.insightsGrid) {
                elements.insightsGrid.innerHTML = '<div class="error">Failed to load insights</div>';
            }
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Show error in insights grid if available
        if (elements.insightsGrid) {
            elements.insightsGrid.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
        }
    }
}

// Utility function to safely update element content
function updateElement(id, content) {
    console.log('Attempting to update element:', id);
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
        console.log('Successfully updated element ' + id + ' with: ' + content);
    } else {
        console.error('Element with id ' + id + ' not found!');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing dashboard...');

    // Only load dashboard if we're on the main page
    if (document.getElementById('insightsGrid')) {
        loadDashboard();
    }
});

// Export functions for use in other scripts
window.DSEAnalytics = {
    loadDashboard: loadDashboard,
    updateElement: updateElement
};

console.log('JavaScript setup complete');