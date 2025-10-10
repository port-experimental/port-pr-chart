const express = require('express');
const router = express.Router();
const tokenManager = require('../services/tokenManager');

// POST /api/auth/validate - Validate current environment token
router.post('/validate', async (req, res) => {
    try {
        const tokenManager = require('../services/tokenManager');
        const token = tokenManager.getCurrentToken();
        
        if (!token) {
            return res.status(400).json({ 
                error: 'No token configured',
                message: 'Please set PORT_API_TOKEN_PRIMARY environment variable'
            });
        }

        const isValid = await tokenManager.validateToken(token);
        
        res.json({
            success: true,
            valid: isValid,
            message: isValid ? 'Environment token is valid' : 'Environment token is invalid or expired'
        });
        
    } catch (error) {
        console.error('Error validating token:', error);
        res.status(500).json({
            error: 'Validation Error',
            message: error.message
        });
    }
});

// GET /api/auth/status - Get current token status
router.get('/status', (req, res) => {
    try {
        const status = tokenManager.getStatus();
        
        res.json({
            success: true,
            data: status
        });
        
    } catch (error) {
        console.error('Error getting token status:', error);
        res.status(500).json({
            error: 'Status Error',
            message: error.message
        });
    }
});

// POST /api/auth/rotate - Manually rotate token
router.post('/rotate', (req, res) => {
    try {
        tokenManager.rotateToken();
        
        res.json({
            success: true,
            message: 'Token rotated successfully',
            data: tokenManager.getStatus()
        });
        
    } catch (error) {
        console.error('Error rotating token:', error);
        res.status(500).json({
            error: 'Rotation Error',
            message: error.message
        });
    }
});

// POST /api/auth/generate - Generate new token programmatically
router.post('/generate', async (req, res) => {
    try {
        const newToken = await tokenManager.generateNewToken();
        
        res.json({
            success: true,
            message: 'New token generated successfully',
            data: {
                token: newToken,
                status: tokenManager.getStatus()
            }
        });
        
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({
            error: 'Token Generation Error',
            message: error.message
        });
    }
});

module.exports = router;
