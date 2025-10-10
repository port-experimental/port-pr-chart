// Main application logic
class App {
    constructor() {
        this.rawEntities = [];
        this.availableProperties = [];
        this.propertyValues = [];
        this.currentData = [];
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.updateStatus('Loading data...');
        
        // Auto-load data on startup
        this.loadData();
    }

    setupEventListeners() {
        // Chart controls
        document.getElementById('chartType').addEventListener('change', () => this.updateChart());
        document.getElementById('metric').addEventListener('change', () => this.updateChart());
        document.getElementById('timeRange').addEventListener('change', () => this.updateChart());
        
        // Filter controls
        document.getElementById('jsonProperty').addEventListener('change', () => this.updatePropertyValues());
        document.getElementById('propertyValue').addEventListener('change', () => this.updateSelectionDisplay());
    }

    async loadData() {
        console.log('App.loadData() called');
        this.showLoading();
        this.hideError();

        try {
            console.log('Validating token...');
            // Validate environment token first
            await apiClient.validateToken();
            console.log('Token validated successfully');
            
            console.log('Loading entities...');
            // Load entities
            const response = await apiClient.getEntities('githubPullRequest');
            console.log('Entities loaded:', response.data.length);
            this.rawEntities = response.data;
            
            console.log('Extracting properties...');
            // Extract properties
            const propertiesResponse = await apiClient.getProperties('githubPullRequest');
            console.log('Properties extracted:', propertiesResponse.data.length);
            this.availableProperties = propertiesResponse.data;
            
            // Initialize UI
            this.populateJsonPropertyDropdown();
            this.updatePropertyValues();
            this.updateChart();
            
            this.updateStatus(`✅ Loaded ${this.rawEntities.length} entities with ${this.availableProperties.length} properties`);
            console.log('Data loading completed successfully');
            
        } catch (error) {
            console.error('Load data error:', error);
            this.showError(`Failed to load data: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }


    populateJsonPropertyDropdown() {
        const dropdown = document.getElementById('jsonProperty');
        dropdown.innerHTML = '<option value="default">Default Metrics</option>';
        
        this.availableProperties.forEach(property => {
            const option = document.createElement('option');
            option.value = property;
            option.textContent = property;
            dropdown.appendChild(option);
        });
    }

    async updatePropertyValues() {
        const jsonProperty = document.getElementById('jsonProperty').value;
        const dropdown = document.getElementById('propertyValue');
        
        if (jsonProperty === 'default') {
            dropdown.innerHTML = '<option value="all">All Values</option>';
            return;
        }

        try {
            const response = await apiClient.getPropertyValues(jsonProperty, 'githubPullRequest');
            
            dropdown.innerHTML = '<option value="all">All Values</option>';
            response.data.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                dropdown.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error updating property values:', error);
            dropdown.innerHTML = '<option value="all">All Values</option>';
        }
    }

    updateSelectionDisplay() {
        const jsonProperty = document.getElementById('jsonProperty').value;
        const propertyValue = document.getElementById('propertyValue').value;
        const display = document.getElementById('selectionDisplay');
        
        if (jsonProperty === 'default') {
            display.value = 'Default metrics (hours, count, avgHours)';
        } else if (propertyValue === 'all') {
            display.value = `${jsonProperty} = All Values`;
        } else {
            display.value = `${jsonProperty} = ${propertyValue}`;
        }
    }

    applyFilter() {
        this.updateChart();
    }

    clearFilter() {
        document.getElementById('propertyValue').value = 'all';
        this.updateSelectionDisplay();
        this.updateChart();
    }

    async updateChart() {
        if (this.rawEntities.length === 0) {
            chartManager.showEmptyChart();
            return;
        }

        const chartType = document.getElementById('chartType').value;
        const metric = document.getElementById('metric').value;
        const timeRange = document.getElementById('timeRange').value;
        const jsonProperty = document.getElementById('jsonProperty').value;
        const propertyValue = document.getElementById('propertyValue').value;

        try {
            let filteredEntities = this.rawEntities;

            // Apply time range filter
            filteredEntities = this.filterDataByTimeRange(filteredEntities, timeRange);

            // Apply property filter
            if (jsonProperty !== 'default' && propertyValue !== 'all') {
                filteredEntities = filteredEntities.filter(entity => {
                    const value = this.getPropertyValue(entity, jsonProperty);
                    return String(value) === propertyValue;
                });
            }

            // Process data for chart
            const chartData = this.processEntitiesForChart(filteredEntities);

            if (chartData.length === 0) {
                chartManager.showEmptyChart();
                this.updateStatus('⚠️ No data matches the current filter');
            } else {
                chartManager.updateChart(chartData, chartType, metric);
                this.updateStatus(`📊 Chart updated with ${chartData.length} data points`);
            }

        } catch (error) {
            console.error('Chart update error:', error);
            this.showError(`Chart update failed: ${error.message}`);
        }
    }

    processEntitiesForChart(entities) {
        const chartData = entities.map(entity => {
            const createdAt = new Date(entity.createdAt);
            const updatedAt = new Date(entity.updatedAt);
            const hours = Math.abs(updatedAt - createdAt) / (1000 * 60 * 60);

            return {
                date: createdAt.toISOString().split('T')[0],
                hours: hours,
                count: 1,
                avgHours: hours
            };
        });

        // Group by date and aggregate
        const groupedData = {};
        chartData.forEach(item => {
            if (!groupedData[item.date]) {
                groupedData[item.date] = {
                    date: item.date,
                    hours: 0,
                    count: 0,
                    avgHours: 0
                };
            }
            groupedData[item.date].hours += item.hours;
            groupedData[item.date].count += item.count;
        });

        // Calculate averages
        Object.values(groupedData).forEach(item => {
            item.avgHours = item.hours / item.count;
        });

        return Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    filterDataByTimeRange(data, timeRange) {
        if (isNaN(timeRange)) {
            // Month-based filtering
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthIndex = monthNames.indexOf(timeRange);
            if (monthIndex === -1) return data;
            
            const currentYear = new Date().getFullYear();
            return data.filter(item => {
                const itemDate = new Date(item.createdAt);
                return itemDate.getMonth() === monthIndex && itemDate.getFullYear() === currentYear;
            });
        } else {
            // Day-based filtering
            return data.slice(-parseInt(timeRange));
        }
    }

    getPropertyValue(entity, propertyPath) {
        const keys = propertyPath.split('.');
        let current = entity;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return null;
            }
        }
        
        return current;
    }

    updateStatus(message) {
        document.getElementById('statusDisplay').innerHTML = `<p>${message}</p>`;
    }

    showError(message) {
        const errorDisplay = document.getElementById('errorDisplay');
        errorDisplay.innerHTML = `<p>❌ ${message}</p>`;
        errorDisplay.style.display = 'block';
    }

    hideError() {
        document.getElementById('errorDisplay').style.display = 'none';
    }

    showLoading() {
        document.body.classList.add('loading');
        // No button to disable since we removed the Load Data button
    }

    hideLoading() {
        document.body.classList.remove('loading');
        // No button to enable since we removed the Load Data button
    }
}

// Global functions for HTML onclick handlers
function updateChart() {
    app.updateChart();
}

function updatePropertyValues() {
    app.updatePropertyValues();
}

function updateSelectionDisplay() {
    app.updateSelectionDisplay();
}

function applyFilter() {
    app.applyFilter();
}

function clearFilter() {
    app.clearFilter();
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    try {
        app = new App();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error initializing app: ' + error.message);
    }
});
