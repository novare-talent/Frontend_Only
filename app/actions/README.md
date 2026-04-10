# Server Actions Architecture

## Overview

This directory contains server-side actions organized by domain with a service layer pattern for improved cohesion and maintainability.

## Structure

```
app/actions/
├── services/           # Service layer - encapsulates database operations
│   ├── auth.service.ts
│   ├── candidate.service.ts
│   ├── assignment.service.ts
│   ├── job.service.ts
│   └── index.ts
├── types.ts           # Shared types and interfaces
├── auth.ts            # Authentication actions
├── candidates.ts      # Candidate management actions
├── assignments.ts     # Assignment management actions
└── jobs.ts            # Job management actions
```

## Design Principles

### 1. Service Layer Pattern
- **Services** handle direct database interactions
- **Actions** handle business logic, validation, and error handling
- Clear separation between data access and business logic

### 2. Domain-Driven Organization
Each file focuses on a single domain:
- `auth.ts` - Authentication and password management
- `candidates.ts` - Candidate mapping and retrieval
- `assignments.ts` - Assignment creation and management
- `jobs.ts` - Job creation and file uploads

### 3. Type Safety
- Shared types in `types.ts` reduce duplication
- Consistent `ActionResult<T>` return type for all actions
- Strong typing throughout the service layer

## Benefits

✅ **Higher Cohesion**: Related operations are grouped together
✅ **Better Testability**: Services can be mocked easily
✅ **Easier Maintenance**: Changes to database schema only affect services
✅ **Consistent Error Handling**: Standardized error responses
✅ **Type Safety**: Shared types prevent inconsistencies

## Usage Example

```typescript
// In a component or page
import { createCandidateMappings } from '@/app/actions/candidates'

const result = await createCandidateMappings({
  job_id: '123',
  session_id: '456',
  candidates: [{ cid: '1', name: 'John', email: 'john@example.com' }]
})

if (result.success) {
  console.log(result.data.mappings)
} else {
  console.error(result.error)
}
```

## Migration Notes

### Before (Low Cohesion - 18%)
- All actions directly used Supabase client
- Mixed concerns (auth + candidates + jobs)
- Difficult to test and maintain

### After (Expected High Cohesion - 60%+)
- Service layer encapsulates database operations
- Clear domain boundaries
- Easy to test and maintain
- Consistent patterns across all actions

## Testing Strategy

1. **Unit Tests**: Test services independently with mocked Supabase client
2. **Integration Tests**: Test actions with real database
3. **E2E Tests**: Test complete user flows

## Future Improvements

- [ ] Add caching layer in services
- [ ] Implement request deduplication
- [ ] Add comprehensive error logging
- [ ] Create service-level middleware for common operations
