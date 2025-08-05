# Testing Documentation

## Overview

This project includes comprehensive unit tests for all API endpoints and client-side functions. Tests run automatically after every build to ensure code quality and prevent regressions.

## Test Structure

### Client-Side Tests (`client/lib/`)

- **api.test.ts** - Tests for expense API functions
- **animal-api.test.ts** - Tests for animal API functions
- **utils.spec.ts** - Tests for utility functions

### Server-Side Tests (`server/tests/`)

- **api.test.ts** - Unit tests for API endpoints
- **integration.test.ts** - Integration tests for file operations

## Test Coverage

### API Endpoints Tested

#### Expenses API

- ✅ GET `/api/expenses` - Fetch all expenses
- ✅ POST `/api/expenses` - Create new expense
- ✅ PUT `/api/expenses/:id` - Update expense
- ✅ DELETE `/api/expenses/:id` - Delete expense
- ✅ POST `/api/expenses/bulk-delete` - Delete multiple expenses
- ✅ GET `/api/expenses/backup` - Create backup
- ✅ GET `/api/expenses/categories` - Fetch categories
- ✅ POST `/api/expenses/categories` - Save categories
- ✅ POST `/api/expenses/populate-categories` - Auto-populate categories

#### Animals API

- ✅ GET `/api/animals` - Fetch all animals
- ✅ POST `/api/animals` - Create new animal
- ✅ PUT `/api/animals/:id` - Update animal
- ✅ DELETE `/api/animals/:id` - Delete animal
- ✅ GET `/api/animals/summary` - Get statistics summary
- ✅ GET `/api/animals/backup` - Create animals backup

#### Animal Records API

- ✅ GET `/api/weight-records` - Fetch weight records
- ✅ POST `/api/weight-records` - Create weight record
- ✅ GET `/api/breeding-records` - Fetch breeding records
- ✅ POST `/api/breeding-records` - Create breeding record
- ✅ GET `/api/vaccination-records` - Fetch vaccination records
- ✅ POST `/api/vaccination-records` - Create vaccination record
- ✅ GET `/api/health-records` - Fetch health records
- ✅ POST `/api/health-records` - Create health record

#### Tasks API

- ✅ GET `/api/tasks` - Fetch all tasks
- ✅ POST `/api/tasks` - Create new task
- ✅ PUT `/api/tasks/:id` - Update task
- ✅ DELETE `/api/tasks/:id` - Delete task
- ✅ POST `/api/tasks/bulk-delete` - Delete multiple tasks
- ✅ GET `/api/tasks/backup` - Create tasks backup
- ✅ POST `/api/tasks/import` - Import tasks

### Test Scenarios Covered

#### Successful Operations

- ✅ CRUD operations for all entities
- ✅ Data filtering by parameters
- ✅ File operations and persistence
- ✅ Bulk operations
- ✅ Export/backup functionality

#### Error Handling

- ✅ Missing required fields validation
- ✅ Invalid data format handling
- ✅ Network error handling
- ✅ 404 Not Found errors
- ✅ 500 Server errors
- ✅ Malformed JSON requests

#### Data Validation

- ✅ Required field validation
- ✅ Data type validation
- ✅ ID generation and uniqueness
- ✅ Timestamp handling
- ✅ Relationship integrity

## Running Tests

### All Tests

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ci       # Run client tests (used in build)
npm run test:all      # Run all tests including server
```

### Specific Test Suites

```bash
npm run test:coverage # Run with coverage report
npm run test:server   # Run server tests only
npm run test:watch    # Run in watch mode
```

### Build Integration

Tests automatically run after every build:

```bash
npm run build         # Builds and runs tests
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

- **Environment**: Node.js for server tests
- **Globals**: Enabled for test utilities
- **Coverage**: V8 provider with HTML/JSON/text reports
- **Timeout**: 30 seconds for long-running tests
- **Setup**: Custom setup file for mocking

### Mock Strategy

- **Fetch API**: Mocked for client-side API tests
- **File System**: Mocked for server-side file operations
- **Console Methods**: Suppressed during tests for cleaner output

## Coverage Thresholds

- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

## Adding New Tests

### For New API Endpoints

1. Add endpoint test to appropriate test file
2. Include success and error scenarios
3. Test data validation and edge cases
4. Verify response format and status codes

### For New Client Functions

1. Mock fetch responses appropriately
2. Test all parameter combinations
3. Verify error handling
4. Test data transformation logic

## Best Practices

### Test Structure

- Use descriptive test names
- Group related tests in describe blocks
- Follow Arrange-Act-Assert pattern
- Keep tests isolated and independent

### Mocking

- Mock external dependencies
- Use realistic test data
- Verify mock calls with correct parameters
- Clean up mocks between tests

### Error Testing

- Test all error conditions
- Verify error messages and status codes
- Test network failures and timeouts
- Validate error handling paths

## Continuous Integration

Tests are integrated into the build process to ensure:

- ✅ No regressions in existing functionality
- ✅ All new code is tested
- ✅ Build fails if tests fail
- ✅ Quality gates are enforced

This testing strategy ensures robust, reliable API endpoints and client-side functionality across the entire Bija Farm Management System.
