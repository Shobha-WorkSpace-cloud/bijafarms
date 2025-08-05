# External API Configuration Guide

This guide explains how to configure your Bija Farms application to call APIs hosted on external servers instead of the local development server.

## 🔧 Configuration Methods

### Method 1: Environment Variables (Recommended)

The easiest way to configure external APIs is using environment variables:

1. **Create a `.env` file** in your client directory:

```bash
# Copy the example file
cp client/.env.example client/.env
```

2. **Configure the API base URL** in `.env`:

```bash
# For production API
VITE_API_BASE_URL=https://api.bijafarms.com/api

# For staging API
VITE_API_BASE_URL=https://staging-api.bijafarms.com/api

# For local development (default)
VITE_API_BASE_URL=/api
```

3. **Optional configurations**:

```bash
# API timeout (default: 30000ms)
VITE_API_TIMEOUT=20000

# API key for authentication
VITE_API_KEY=your-api-key-here

# Environment identifier
VITE_ENVIRONMENT=production
```

### Method 2: Runtime Configuration

For production builds where you can't rebuild for different environments:

1. **Add a script to your `index.html`**:

```html
<script>
  // Set API base URL at runtime
  window.__API_BASE_URL__ = "https://api.bijafarms.com/api";
</script>
```

2. **The application will automatically use this URL** if no environment variable is set.

### Method 3: Programmatic Configuration

Configure the API programmatically in your application:

```typescript
import { setApiBaseUrl, configureForEnvironment } from "@/lib/api-config";

// Option 1: Set URL directly
setApiBaseUrl("https://api.bijafarms.com/api");

// Option 2: Use predefined environment configs
configureForEnvironment("production");
```

## 🌐 Environment-Specific Configurations

### Development

```bash
VITE_API_BASE_URL=/api
VITE_API_TIMEOUT=30000
VITE_ENVIRONMENT=development
```

### Staging

```bash
VITE_API_BASE_URL=https://staging-api.bijafarms.com/api
VITE_API_TIMEOUT=20000
VITE_ENVIRONMENT=staging
```

### Production

```bash
VITE_API_BASE_URL=https://api.bijafarms.com/api
VITE_API_TIMEOUT=15000
VITE_ENVIRONMENT=production
```

## 🔐 Authentication & Headers

### Adding API Keys

```typescript
import { addApiHeader } from "@/lib/api-config";

// Add API key header
addApiHeader("X-API-Key", "your-api-key");

// Add authorization header
addApiHeader("Authorization", "Bearer your-jwt-token");
```

### Custom Headers

```typescript
import { addApiHeader } from "@/lib/api-config";

// Add custom headers
addApiHeader("X-Client-Version", "1.0.0");
addApiHeader("X-Environment", "production");
```

## 🚨 CORS Configuration

When calling external APIs, ensure your API server has proper CORS configuration:

### Backend CORS Setup (Express.js example)

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:3000", // Development
      "https://bijafarms.com", // Production
      "https://staging.bijafarms.com", // Staging
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  }),
);
```

## 📊 Error Handling

The system includes enhanced error handling for external APIs:

```typescript
import { ApiError } from "@/lib/api-config";

try {
  const animals = await fetchAnimals();
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error: ${error.status} - ${error.message}`);
    console.error(`Details: ${error.details}`);
  }
}
```

## 🔍 Debugging & Monitoring

### View Current Configuration

```typescript
import { getApiConfig } from "@/lib/api-config";

console.log("Current API Config:", getApiConfig());
```

### Monitor API Calls

All API calls include:

- Automatic timeout handling
- Request/response logging in development
- Error details for debugging
- Retry logic for network failures

## 📋 Example Configurations

### 1. Localhost Development

```bash
# .env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 2. Docker Container

```bash
# .env
VITE_API_BASE_URL=http://api-container:3000/api
```

### 3. Cloud Hosting (AWS/Azure/GCP)

```bash
# .env
VITE_API_BASE_URL=https://your-api-gateway.amazonaws.com/prod/api
```

### 4. Custom Domain

```bash
# .env
VITE_API_BASE_URL=https://api.yourfarm.com/v1
```

## 🚀 Deployment Considerations

### Build Time Configuration

For most deployments, set environment variables before building:

```bash
# Set environment variables
export VITE_API_BASE_URL=https://api.bijafarms.com/api
export VITE_ENVIRONMENT=production

# Build the application
npm run build
```

### Runtime Configuration

For dynamic environments or when you can't rebuild:

```javascript
// In your index.html or main.js
window.__API_BASE_URL__ =
  process.env.API_URL || "https://api.bijafarms.com/api";
```

### Docker Configuration

```dockerfile
# Dockerfile
ENV VITE_API_BASE_URL=https://api.bijafarms.com/api
ENV VITE_ENVIRONMENT=production
```

## 📝 Migration Checklist

When moving from local to external APIs:

- [ ] Set up external API server with proper CORS
- [ ] Configure environment variables
- [ ] Test all API endpoints work with new configuration
- [ ] Update any hardcoded URLs in the codebase
- [ ] Test authentication/authorization flows
- [ ] Verify error handling works correctly
- [ ] Test timeout scenarios
- [ ] Update documentation and deployment scripts

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**

   - Solution: Configure CORS on your API server
   - Check: Browser console for CORS error messages

2. **Network Timeouts**

   - Solution: Increase timeout or check API server performance
   - Check: `VITE_API_TIMEOUT` environment variable

3. **Authentication Failures**

   - Solution: Verify API keys and authentication headers
   - Check: Network tab in browser dev tools

4. **Environment Variable Not Loading**

   - Solution: Ensure variables start with `VITE_`
   - Check: Restart development server after .env changes

5. **Mixed Content (HTTP/HTTPS)**
   - Solution: Ensure all URLs use HTTPS in production
   - Check: Browser console for mixed content warnings

### Debug Commands

```bash
# Check environment variables
echo $VITE_API_BASE_URL

# Test API connectivity
curl -v https://api.bijafarms.com/api/animals

# Check CORS headers
curl -H "Origin: https://bijafarms.com" -v https://api.bijafarms.com/api/animals
```

## 📚 API Endpoints Reference

All current endpoints support external hosting:

### Animal API

- `GET /animals` - List all animals
- `POST /animals` - Create new animal
- `PUT /animals/:id` - Update animal
- `DELETE /animals/:id` - Delete animal
- `GET /animals/summary` - Get dashboard summary

### Weight Records

- `GET /weight-records` - List weight records
- `GET /weight-records?animalId=:id` - Get records for specific animal
- `POST /weight-records` - Create weight record

### Health Records

- `GET /health-records` - List health records
- `GET /health-records?animalId=:id` - Get records for specific animal
- `POST /health-records` - Create health record

### Expense API

- `GET /expenses` - List all expenses
- `POST /expenses` - Create new expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

## 🔄 Example Migration

Before (local API):

```typescript
const response = await fetch("/api/animals");
```

After (external API - automatic):

```typescript
const animals = await fetchAnimals(); // Uses configured API_BASE_URL
```

The migration is transparent - your existing code continues to work without changes!
