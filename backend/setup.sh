#!/bin/bash

# Port PR Chart Setup Script
echo "🚀 Setting up Port PR Chart Backend..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Port API Configuration
# Replace 'your_token_here' with your actual Port API token

PORT_API_TOKEN_PRIMARY=your_token_here
PORT_API_TOKEN_SECONDARY=your_backup_token_here
PORT_SERVICE_TOKEN=your_service_token_here

# Port API Region (us, eu, us-api, eu-api)
PORT_API_REGION=us

# Server Configuration
PORT=8000
EOF
    echo "✅ .env file created!"
    echo "⚠️  Please edit .env file and add your actual Port API tokens"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your Port API tokens"
echo "2. Run: npm start"
echo "3. Open: http://localhost:8000"
