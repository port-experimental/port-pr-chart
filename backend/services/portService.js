const axios = require('axios');

class PortService {
    constructor() {
        // Support different regions via environment variable
        const region = process.env.PORT_API_REGION || 'us';
        this.baseURL = this.getBaseURL(region);
        this.timeout = 30000; // 30 seconds
        
        console.log(`🌍 Port API Region: ${region.toUpperCase()}`);
        console.log(`🔗 Base URL: ${this.baseURL}`);
    }

    getBaseURL(region) {
        const regions = {
            'us': 'https://api.port.io',
            'eu': 'https://api.eu.port.io',
            'us-api': 'https://api.port.io',
            'eu-api': 'https://api.eu.port.io'
        };
        
        const normalizedRegion = region.toLowerCase();
        return regions[normalizedRegion] || regions['us'];
    }

    async makeAuthenticatedRequest(url, options = {}) {
        const tokenManager = require('./tokenManager');
        
        // Wait for token initialization if it's in progress
        let token = tokenManager.getCurrentToken();
        if (!token && tokenManager.getIsInitializing()) {
            // Wait for initialization to complete (with timeout)
            const maxWait = 10000; // 10 seconds
            const startTime = Date.now();
            while (!token && tokenManager.getIsInitializing() && (Date.now() - startTime) < maxWait) {
                await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
                token = tokenManager.getCurrentToken();
            }
        }
        
        // If still no token, try to trigger initialization
        const credentials = tokenManager.getClientCredentials();
        if (!token && credentials?.clientId && credentials?.clientSecret) {
            await tokenManager.initializeToken();
            token = tokenManager.getCurrentToken();
        }
        
        if (!token) {
            throw new Error('No valid Port API token available. Please ensure PORT_CLIENT_ID and PORT_CLIENT_SECRET are set correctly, or set PORT_API_TOKEN_PRIMARY.');
        }

        const requestOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: this.timeout,
            ...options
        };

        try {
            const response = await axios(url, requestOptions);
            return response;
        } catch (error) {
            console.error('Port API Error:', error.response?.status, error.response?.data);
            
            // If it's an authentication error, try to refresh the token
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('🔄 Authentication error detected, attempting token refresh...');
                try {
                    await tokenManager.rotateToken();
                    // Retry the request with the new token
                    const newToken = tokenManager.getCurrentToken();
                    if (newToken && newToken !== token) {
                        console.log('🔄 Retrying request with refreshed token...');
                        const retryOptions = {
                            ...requestOptions,
                            headers: {
                                ...requestOptions.headers,
                                'Authorization': `Bearer ${newToken}`
                            }
                        };
                        const retryResponse = await axios(url, retryOptions);
                        return retryResponse;
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError.message);
                }
            }
            
            throw error;
        }
    }

    async getEntities(blueprint) {
        const response = await this.makeAuthenticatedRequest(`${this.baseURL}/v1/blueprints/${blueprint}/entities`);
        return response.data.entities || [];
    }

    async getBlueprints() {
        const response = await this.makeAuthenticatedRequest(`${this.baseURL}/v1/blueprints`);
        return response.data.blueprints || [];
    }

    extractProperties(entities) {
        const properties = new Set();
        
        entities.forEach(entity => {
            this.extractNestedProperties(entity, '', properties);
        });

        return Array.from(properties).sort();
    }

    extractNestedProperties(obj, prefix, properties) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    // Recursively extract nested properties
                    this.extractNestedProperties(obj[key], fullKey, properties);
                } else {
                    // Add the property
                    properties.add(fullKey);
                }
            }
        }
    }

    getPropertyValues(entities, propertyPath) {
        const values = new Set();
        
        entities.forEach(entity => {
            const value = this.getPropertyValue(entity, propertyPath);
            if (value !== null && value !== undefined) {
                values.add(String(value));
            }
        });

        return Array.from(values).sort();
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

    // Process entities for chart data
    processEntitiesForChart(entities, jsonProperty = 'default', propertyValue = 'all') {
        let filteredEntities = entities;

        // Apply property filter if specified
        if (jsonProperty !== 'default' && propertyValue !== 'all') {
            filteredEntities = entities.filter(entity => {
                const value = this.getPropertyValue(entity, jsonProperty);
                return String(value) === propertyValue;
            });
        }

        // Calculate metrics
        const chartData = filteredEntities.map(entity => {
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
}

module.exports = new PortService();
