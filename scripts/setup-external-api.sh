#!/bin/bash

# Quick setup script for external API configuration
# Usage: ./scripts/setup-external-api.sh <api-url>

set -e

API_URL=${1:-"https://api.bijafarms.com/api"}
ENV_FILE="client/.env"

echo "🚀 Setting up external API configuration..."
echo "API URL: $API_URL"

# Create .env file if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Creating .env file from template..."
    cp client/.env.example "$ENV_FILE"
fi

# Update or add API base URL
if grep -q "VITE_API_BASE_URL" "$ENV_FILE"; then
    echo "🔄 Updating existing API base URL..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=$API_URL|" "$ENV_FILE"
    else
        # Linux
        sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=$API_URL|" "$ENV_FILE"
    fi
else
    echo "➕ Adding API base URL..."
    echo "VITE_API_BASE_URL=$API_URL" >> "$ENV_FILE"
fi

# Set production environment
if grep -q "VITE_ENVIRONMENT" "$ENV_FILE"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|VITE_ENVIRONMENT=.*|VITE_ENVIRONMENT=production|" "$ENV_FILE"
    else
        sed -i "s|VITE_ENVIRONMENT=.*|VITE_ENVIRONMENT=production|" "$ENV_FILE"
    fi
else
    echo "VITE_ENVIRONMENT=production" >> "$ENV_FILE"
fi

echo "✅ Configuration updated!"
echo "📋 Current .env configuration:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep "VITE_" "$ENV_FILE" || echo "No VITE_ variables found"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "🔧 Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Test API connectivity to: $API_URL"
echo "3. Check browser console for any CORS issues"
echo "4. Verify all endpoints are working correctly"
echo ""
echo "📚 For more details, see: docs/EXTERNAL_API_CONFIGURATION.md"
