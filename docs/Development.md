# Development Guide

This guide covers development best practices, coding standards, and contribution guidelines for Sync Flow.

## Development Environment

### Required Tools
- Node.js 18+ or 20+ (LTS recommended)
- pnpm (preferred) or npm
- Git
- Visual Studio Code (recommended)
- Vercel CLI

### Recommended VS Code Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- GitLens

## Code Style and Standards

### TypeScript Guidelines

1. **Type Safety**
   ```typescript
   // ✅ Good - Explicit types
   export function createTask(title: string, priority?: Priority): Task {
     // ...
   }
   
   // ❌ Bad - Using any
   export function createTask(data: any) {
     // ...
   }
   ```

2. **Type Imports**
   ```typescript
   // ✅ Good - Use type imports
   import type { User } from '../types/user';
   
   // ❌ Bad - Regular import for types
   import { User } from '../types/user';
   ```

3. **Interface vs Type**
   - Use `interface` for object shapes
   - Use `type` for unions, primitives, and complex types

### Code Organization

1. **File Structure**
   - One component/service per file
   - Group related functionality
   - Use index.ts for public exports

2. **Naming Conventions**
   - Files: `kebab-case.ts`
   - Classes/Interfaces: `PascalCase`
   - Functions/Variables: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`
   - Types: `PascalCase`

3. **Import Order**
   ```typescript
   // 1. External dependencies
   import { Hono } from 'hono';
   import { z } from 'zod';
   
   // 2. Internal dependencies  
   import type { User } from '../types/user';
   import { UserService } from '../services/user';
   
   // 3. Local dependencies
   import { validateRequest } from './utils';
   ```

### Error Handling

1. **Use Custom Error Classes**
   ```typescript
   // ✅ Good
   throw new AuthenticationError('Invalid token');
   
   // ❌ Bad
   throw new Error('Invalid token');
   ```

2. **Always Log Errors**
   ```typescript
   try {
     await someOperation();
   } catch (error) {
     console.error('Operation failed:', {
       error: error instanceof Error ? error.message : error,
       stack: error instanceof Error ? error.stack : undefined,
       context: { userId, operation: 'someOperation' }
     });
     throw error;
   }
   ```

### API Design Principles

1. **RESTful Conventions**
   - Use proper HTTP methods (GET, POST, PUT, DELETE)
   - Return appropriate status codes
   - Use consistent URL patterns

2. **Request Validation**
   ```typescript
   // Always validate incoming data
   const schema = z.object({
     title: z.string().min(1),
     priority: z.enum(['None', 'Low', 'Medium', 'High'])
   });
   ```

3. **Response Format**
   ```typescript
   // Success response
   {
     "data": { ... },
     "message": "Operation successful"
   }
   
   // Error response
   {
     "error": "Error message",
     "code": "ERROR_CODE",
     "details": { ... }
   }
   ```

## Testing Guidelines

### Unit Tests (Future Implementation)

```typescript
// Example test structure
describe('UserService', () => {
  describe('getAccessToken', () => {
    it('should return valid access token', async () => {
      // Test implementation
    });
    
    it('should refresh expired token', async () => {
      // Test implementation
    });
  });
});
```

### Manual Testing

1. **Authentication Flow**
   - Test OAuth login/logout
   - Verify token refresh
   - Check error scenarios

2. **API Endpoints**
   - Use tools like Postman or curl
   - Test all CRUD operations
   - Verify error handling

## Git Workflow

### Branch Naming
- Feature: `feature/description`
- Bug fix: `fix/description`
- Refactor: `refactor/description`
- Docs: `docs/description`

### Commit Messages
Follow conventional commits:
```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat(auth): add automatic token refresh
fix(tasks): handle empty metadata correctly
docs(api): update endpoint documentation
```

### Pull Request Process

1. **Before Creating PR**
   - Run linting: `pnpm lint`
   - Run type checking: `pnpm type-check`
   - Format code: `pnpm format`
   - Test manually

2. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Tested locally
   - [ ] Added/updated tests
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-reviewed code
   - [ ] Updated documentation
   ```

## Common Development Tasks

### Adding a New Endpoint

1. **Define Validation Schema** (`/api/index.ts`)
   ```typescript
   const newEndpointSchema = z.object({
     field: z.string()
   });
   ```

2. **Create Handler** (`/api/handlers/new-handler.ts`)
   ```typescript
   export function createNewHandler(services: Dependencies) {
     return async function handleRequest(c: Context) {
       // Implementation
     };
   }
   ```

3. **Add Route** (`/api/index.ts`)
   ```typescript
   app.post(
     '/new-endpoint',
     zValidator('json', newEndpointSchema),
     handleNewEndpoint
   );
   ```

### Adding a New Service

1. Create service file in `/api/services/`
2. Define service class with clear methods
3. Inject dependencies via constructor
4. Add to main dependency injection in `/api/index.ts`

### Modifying Data Models

1. Update TypeScript types in `/api/types/`
2. Update validation schemas
3. Handle migration if needed
4. Update documentation

## Debugging Tips

### Local Development

1. **Enable Detailed Logging**
   ```typescript
   console.log('🔵 Request:', {
     method: c.req.method,
     url: c.req.url,
     headers: c.req.headers,
     body: await c.req.json()
   });
   ```

2. **Use Debugger**
   - Set breakpoints in VS Code
   - Use `debugger` statement
   - Inspect variables and call stack

3. **Vercel Dev Tools**
   ```bash
   # View function logs
   vercel dev --debug
   ```

### Common Issues

1. **Type Errors**
   - Run `pnpm type-check` to find issues
   - Check for missing type imports
   - Verify type compatibility

2. **Redis Issues**
   - Check connection string
   - Verify key format
   - Use Upstash data browser

3. **Google API Errors**
   - Check OAuth scopes
   - Verify API is enabled
   - Monitor quota usage

## Performance Considerations

1. **Minimize Cold Starts**
   - Keep dependencies minimal
   - Use dynamic imports where possible
   - Optimize bundle size

2. **Efficient Redis Usage**
   - Use appropriate data structures
   - Set expiration where applicable
   - Batch operations when possible

3. **API Call Optimization**
   - Cache responses when appropriate
   - Use pagination for large datasets
   - Implement request deduplication

## Security Best Practices

1. **Never Commit Secrets**
   - Use environment variables
   - Check `.gitignore`
   - Review commits before pushing

2. **Validate All Input**
   - Use Zod schemas
   - Sanitize user input
   - Validate URL parameters

3. **Handle Errors Safely**
   - Don't expose internal details
   - Log errors server-side
   - Return generic error messages

## Resources

- [Hono Documentation](https://hono.dev/)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Google Tasks API Reference](https://developers.google.com/tasks/reference/rest)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
