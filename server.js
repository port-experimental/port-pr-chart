const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const server = http.createServer((req, res) => {
    // Log all requests for debugging
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request');
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Proxy API requests to Port
    if (req.url.startsWith('/api/')) {
        const apiPath = req.url.replace('/api', '');
        const targetUrl = `https://api.port.io${apiPath}`;
        
        console.log(`Proxying API request to: ${targetUrl}`);
        
        const options = {
            method: req.method,
            headers: {
                'Authorization': req.headers.authorization,
                'Content-Type': req.headers['content-type'] || 'application/json'
            }
        };
        
        const proxyReq = https.request(targetUrl, options, (proxyRes) => {
            console.log(`API Response: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
            
            // Set CORS headers for API responses
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });
        
        proxyReq.on('error', (err) => {
            console.error('Proxy error:', err);
            res.writeHead(500);
            res.end('Proxy error: ' + err.message);
        });
        
        // Forward request body if present
        req.pipe(proxyReq);
        return;
    }
    
    // Serve the HTML file
    if (req.url === '/' || req.url === '/index.html') {
        const filePath = path.join(__dirname, 'index.html');
        console.log(`Serving file: ${filePath}`);
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.writeHead(404);
                res.end('File not found');
                return;
            }
            console.log('File served successfully');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        console.log(`404 - Not found: ${req.url}`);
        res.writeHead(404);
        res.end('Not found');
    }
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('CORS headers are enabled for API calls');
});
