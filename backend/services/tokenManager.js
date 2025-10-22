const axios = require('axios');

class TokenManager {
    constructor() {
        this.tokens = {
            primary: process.env.PORT_API_TOKEN_PRIMARY,
            secondary: process.env.PORT_API_TOKEN_SECONDARY,
            service: process.env.PORT_SERVICE_TOKEN
        };
        
        // Client credentials for programmatic token generation
        this.clientCredentials = {
            clientId: process.env.PORT_CLIENT_ID,
            clientSecret: process.env.PORT_CLIENT_SECRET
        };
        
        this.currentToken = this.tokens.primary;
        this.lastRotation = Date.now();
        this.rotationInterval = 2.5 * 60 * 60 * 1000; // 2.5 hours
        this.isRotating = false;
        
        // Log token status on startup
        console.log('🔑 Token Manager initialized:');
        console.log(`   Primary Token: ${this.tokens.primary ? 'Set' : 'Not Set'}`);
        console.log(`   Secondary Token: ${this.tokens.secondary ? 'Set' : 'Not Set'}`);
        console.log(`   Service Token: ${this.tokens.service ? 'Set' : 'Not Set'}`);
        console.log(`   Client ID: ${this.clientCredentials.clientId ? 'Set' : 'Not Set'}`);
        console.log(`   Client Secret: ${this.clientCredentials.clientSecret ? 'Set' : 'Not Set'}`);
        
        if (!this.tokens.primary && !this.clientCredentials.clientId) {
            console.warn('⚠️  WARNING: No token or client credentials set!');
            console.warn('   Set token: export PORT_API_TOKEN_PRIMARY="your_token_here"');
            console.warn('   Or set credentials: export PORT_CLIENT_ID="your_id" PORT_CLIENT_SECRET="your_secret"');
        }
        
        // Start automatic rotation
        this.startAutoRotation();
    }

    startAutoRotation() {
        setInterval(() => {
            this.rotateToken();
        }, this.rotationInterval);
    }

    async validateToken(token) {
        try {
            // Use the same region as PortService
            const portService = require('./portService');
            const baseURL = portService.baseURL;
            
            const response = await axios.get(`${baseURL}/v1/blueprints`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            return response.status === 200;
        } catch (error) {
            console.error('Token validation failed:', error.response?.status);
            return false;
        }
    }

    async generateNewToken() {
        if (!this.clientCredentials.clientId || !this.clientCredentials.clientSecret) {
            throw new Error('Client credentials not configured. Set PORT_CLIENT_ID and PORT_CLIENT_SECRET.');
        }

        try {
            const portService = require('./portService');
            const baseURL = portService.baseURL;
            
            const response = await axios.post(`${baseURL}/v1/auth/access_token`, {
                clientId: this.clientCredentials.clientId,
                clientSecret: this.clientCredentials.clientSecret
            }, {
                timeout: 10000
            });

            if (response.status === 200) {
                const { accessToken, expiresIn, tokenType } = response.data;
                console.log(`✅ Generated new token (expires in ${expiresIn} seconds)`);
                return accessToken;
            } else {
                throw new Error(`Failed to generate token: ${response.status}`);
            }
        } catch (error) {
            console.error('Token generation failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async rotateToken() {
        if (this.isRotating) return;
        
        this.isRotating = true;
        
        try {
            // Test current token
            const isValid = await this.validateToken(this.currentToken);
            
            if (!isValid) {
                console.log('🔄 Current token invalid, attempting rotation...');
                
                // Try to generate a new token if client credentials are available
                if (this.clientCredentials.clientId && this.clientCredentials.clientSecret) {
                    try {
                        const newToken = await this.generateNewToken();
                        this.currentToken = newToken;
                        this.lastRotation = Date.now();
                        console.log('✅ Token rotated successfully (programmatically generated)');
                        return;
                    } catch (error) {
                        console.warn('⚠️ Programmatic token generation failed, trying backup tokens');
                    }
                }
                
                // Fallback to backup token rotation
                const newToken = this.currentToken === this.tokens.primary 
                    ? this.tokens.secondary 
                    : this.tokens.primary;
                
                if (newToken && await this.validateToken(newToken)) {
                    this.currentToken = newToken;
                    this.lastRotation = Date.now();
                    console.log('✅ Token rotated successfully (backup token)');
                } else {
                    console.warn('⚠️ All tokens appear to be invalid');
                }
            }
        } catch (error) {
            console.error('Token rotation error:', error.message);
        } finally {
            this.isRotating = false;
        }
    }

    getCurrentToken() {
        return this.currentToken;
    }

    getStatus() {
        return {
            currentToken: this.currentToken ? 'Set' : 'Not Set',
            primaryToken: this.tokens.primary ? 'Set' : 'Not Set',
            secondaryToken: this.tokens.secondary ? 'Set' : 'Not Set',
            serviceToken: this.tokens.service ? 'Set' : 'Not Set',
            lastRotation: new Date(this.lastRotation).toISOString(),
            nextRotation: new Date(this.lastRotation + this.rotationInterval).toISOString(),
            isRotating: this.isRotating
        };
    }

    // Manual rotation for API endpoint
    manualRotate() {
        this.rotateToken();
    }
}

module.exports = new TokenManager();
