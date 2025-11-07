#!/bin/bash

# Port PR Chart Setup Script
echo "🚀 Setting up Port PR Chart Backend..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Port API Configuration
# Replace with your actual Port client credentials

PORT_CLIENT_ID=your_client_id_here
PORT_CLIENT_SECRET=your_client_secret_here

# Optional: Port API Region (us, eu, us-api, eu-api)
PORT_API_REGION=us

# Optional: Server Configuration
PORT=8000
EOF
    echo "✅ .env file created!"
    echo "⚠️  Please edit .env file and add your actual Port client credentials (PORT_CLIENT_ID and PORT_CLIENT_SECRET)"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your Port client credentials (PORT_CLIENT_ID and PORT_CLIENT_SECRET)"
echo "2. Run: npm start"
echo "3. Open: http://localhost:8000"
