const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const portRoutes = require('./routes/port');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8000;

// Check environment variables on startup
console.log('🚀 Starting Port PR Chart Backend...');
console.log('📋 Environment Check:');
console.log(`   PORT_API_TOKEN_PRIMARY: ${process.env.PORT_API_TOKEN_PRIMARY ? 'Set' : 'Not Set'}`);
console.log(`   PORT_API_TOKEN_SECONDARY: ${process.env.PORT_API_TOKEN_SECONDARY ? 'Set' : 'Not Set'}`);
console.log(`   PORT_SERVICE_TOKEN: ${process.env.PORT_SERVICE_TOKEN ? 'Set' : 'Not Set'}`);
console.log(`   PORT_CLIENT_ID: ${process.env.PORT_CLIENT_ID ? 'Set' : 'Not Set'}`);
console.log(`   PORT_CLIENT_SECRET: ${process.env.PORT_CLIENT_SECRET ? 'Set' : 'Not Set'}`);
console.log(`   PORT_API_REGION: ${process.env.PORT_API_REGION || 'us (default)'}`);

// Validate that both client credentials are required
const hasClientId = !!process.env.PORT_CLIENT_ID;
const hasClientSecret = !!process.env.PORT_CLIENT_SECRET;

if (!hasClientId || !hasClientSecret) {
    console.error('❌ ERROR: PORT_CLIENT_ID and PORT_CLIENT_SECRET are required!');
    if (!hasClientId) {
        console.error('   Missing: PORT_CLIENT_ID');
    }
    if (!hasClientSecret) {
        console.error('   Missing: PORT_CLIENT_SECRET');
    }
    console.error('   Please set both: export PORT_CLIENT_ID="your_id" PORT_CLIENT_SECRET="your_secret"');
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8001'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/port', portRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Serve frontend (for development)
app.use(express.static(path.join(__dirname, '../frontend')));

// Catch-all handler for frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend served at http://localhost:${PORT}`);
});
