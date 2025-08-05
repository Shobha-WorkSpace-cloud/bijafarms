/**
 * API Configuration Examples
 *
 * This file demonstrates different ways to configure your application
 * to call external APIs instead of local development APIs.
 */

import {
  setApiBaseUrl,
  configureForEnvironment,
  addApiHeader,
  getApiConfig,
  ApiError,
} from "@/lib/api-config";
import { fetchAnimals, fetchAnimalSummary } from "@/lib/animal-api";

// ============================================================================
// Example 1: Simple URL Configuration
// ============================================================================

export const configureForProduction = () => {
  // Set the production API URL
  setApiBaseUrl("https://api.bijafarms.com/api");

  console.log("��� Configured for production API");
};

export const configureForStaging = () => {
  // Set the staging API URL
  setApiBaseUrl("https://staging-api.bijafarms.com/api");

  console.log("✅ Configured for staging API");
};

export const configureForLocalhost = () => {
  // Set local development API URL
  setApiBaseUrl("http://localhost:8080/api");

  console.log("✅ Configured for localhost API");
};

// ============================================================================
// Example 2: Environment-Based Configuration
// ============================================================================

export const configureBasedOnEnvironment = () => {
  const environment = import.meta.env.NODE_ENV || "development";

  switch (environment) {
    case "production":
      configureForEnvironment("production");
      break;
    case "staging":
      configureForEnvironment("staging");
      break;
    default:
      configureForEnvironment("development");
      break;
  }

  console.log(`✅ Configured for ${environment} environment`);
};

// ============================================================================
// Example 3: Dynamic URL Detection
// ============================================================================

export const configureBasedOnDomain = () => {
  const hostname = window.location.hostname;

  if (hostname.includes("localhost")) {
    setApiBaseUrl("/api");
  } else if (hostname.includes("staging")) {
    setApiBaseUrl("https://staging-api.bijafarms.com/api");
  } else {
    setApiBaseUrl("https://api.bijafarms.com/api");
  }

  console.log(`✅ Configured API for domain: ${hostname}`);
};

// ============================================================================
// Example 4: Authentication Configuration
// ============================================================================

export const configureWithAuthentication = (
  apiKey: string,
  userToken?: string,
) => {
  // Set production API URL
  setApiBaseUrl("https://api.bijafarms.com/api");

  // Add API key header
  addApiHeader("X-API-Key", apiKey);

  // Add user token if provided
  if (userToken) {
    addApiHeader("Authorization", `Bearer ${userToken}`);
  }

  // Add application identifier
  addApiHeader("X-Client-App", "bija-farms-web");

  console.log("✅ Configured API with authentication");
};

// ============================================================================
// Example 5: Docker/Container Configuration
// ============================================================================

export const configureForDocker = (containerName = "bija-api") => {
  // When running in Docker, use container networking
  setApiBaseUrl(`http://${containerName}:3000/api`);

  console.log(`✅ Configured for Docker container: ${containerName}`);
};

// ============================================================================
// Example 6: Cloud Provider Configuration
// ============================================================================

export const configureForAWS = (apiGatewayUrl: string, stage = "prod") => {
  setApiBaseUrl(`${apiGatewayUrl}/${stage}/api`);
  addApiHeader("X-Cloud-Provider", "aws");

  console.log(`✅ Configured for AWS API Gateway: ${stage}`);
};

export const configureForAzure = (functionAppUrl: string) => {
  setApiBaseUrl(`${functionAppUrl}/api`);
  addApiHeader("X-Cloud-Provider", "azure");

  console.log("✅ Configured for Azure Functions");
};

export const configureForGCP = (cloudRunUrl: string) => {
  setApiBaseUrl(`${cloudRunUrl}/api`);
  addApiHeader("X-Cloud-Provider", "gcp");

  console.log("✅ Configured for Google Cloud Run");
};

// ============================================================================
// Example 7: Configuration Validation
// ============================================================================

export const validateApiConfiguration = async (): Promise<boolean> => {
  try {
    console.log("🔍 Validating API configuration...");

    // Get current configuration
    const config = getApiConfig();
    console.log("Current config:", config);

    // Test a simple API call
    const summary = await fetchAnimalSummary();
    console.log("✅ API validation successful:", summary);

    return true;
  } catch (error) {
    console.error("❌ API validation failed:", error);

    if (error instanceof ApiError) {
      console.error(`Status: ${error.status}`);
      console.error(`Details: ${error.details}`);
    }

    return false;
  }
};

// ============================================================================
// Example 8: Automatic Fallback Configuration
// ============================================================================

export const configureWithFallback = async () => {
  const primaryUrl = "https://api.bijafarms.com/api";
  const fallbackUrl = "https://backup-api.bijafarms.com/api";

  try {
    // Try primary API
    setApiBaseUrl(primaryUrl);
    await fetchAnimalSummary();
    console.log("✅ Using primary API");
  } catch (error) {
    console.warn("⚠️ Primary API failed, trying fallback...");

    try {
      // Try fallback API
      setApiBaseUrl(fallbackUrl);
      await fetchAnimalSummary();
      console.log("✅ Using fallback API");
    } catch (fallbackError) {
      console.error("❌ Both APIs failed");
      throw new Error("All API endpoints are unavailable");
    }
  }
};

// ============================================================================
// Example 9: Multi-API Configuration
// ============================================================================

interface MultiApiConfig {
  animals: string;
  expenses: string;
  reports: string;
}

export const configureMultipleAPIs = (config: MultiApiConfig) => {
  // This would require extending the api-config to support multiple base URLs
  // For now, this is a conceptual example

  console.log("📡 Multi-API configuration:", config);

  // You could store these in a global state and modify the api calls to use
  // the appropriate base URL for each service
};

// ============================================================================
// Example 10: Runtime Environment Detection
// ============================================================================

export const autoConfigureBasedOnEnvironment = () => {
  // Check for environment variables
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const environment = import.meta.env.VITE_ENVIRONMENT;

  if (apiUrl) {
    // Use explicit URL from environment
    setApiBaseUrl(apiUrl);
    console.log(`✅ Using environment API URL: ${apiUrl}`);
  } else if (environment) {
    // Use predefined environment configuration
    configureForEnvironment(environment as any);
    console.log(`✅ Using predefined ${environment} configuration`);
  } else {
    // Auto-detect based on location
    configureBasedOnDomain();
  }

  // Add environment identifier header
  addApiHeader("X-Environment", environment || "auto-detected");
};

// ============================================================================
// Usage Examples
// ============================================================================

// 1. Simple production setup
// configureForProduction();

// 2. Authentication setup
// configureWithAuthentication('your-api-key', 'user-jwt-token');

// 3. Automatic configuration
// autoConfigureBasedOnEnvironment();

// 4. Validate configuration
// validateApiConfiguration().then(isValid => {
//   if (isValid) {
//     console.log('Ready to use APIs!');
//   } else {
//     console.log('Please check your API configuration');
//   }
// });

export default {
  configureForProduction,
  configureForStaging,
  configureWithAuthentication,
  validateApiConfiguration,
  autoConfigureBasedOnEnvironment,
};
