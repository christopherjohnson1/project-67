# Cursor Rules for Treasure Hunt Application

This directory contains focused, actionable rules for the Cursor AI agent to follow when working on different parts of the treasure hunt application.

## Rule Structure

Each rule is a folder containing a `RULE.md` file with frontmatter metadata that controls when and how the rule is applied.

## Available Rules

### 1. Frontend Angular (`frontend-angular/`)
**Applies to:** `frontend/**/*.ts`, `frontend/**/*.html`, `frontend/**/*.scss`

Standards for Angular development including:
- Component structure and lifecycle patterns
- Service layer with RxJS observables
- Routing and guards
- Mobile-first SCSS styling with BEM naming
- State management patterns
- Error handling and HTTP interceptors
- Testing standards

**Key Principles:**
- Use standalone components
- Early returns to avoid nesting
- Type safety with TypeScript strict mode
- Proper subscription cleanup with `takeUntil`
- Mobile-first responsive design

### 2. Backend API (`backend-api/`)
**Applies to:** `backend/**/*.ts`, `backend/**/*.js`

Standards for Node.js/TypeScript Express backend:
- Server setup and middleware configuration
- Route/Controller/Service layer separation
- Database query patterns with pg
- Authentication with JWT
- Error handling middleware
- Validation with Zod
- Transaction patterns

**Key Principles:**
- Early returns for validation
- Fail fast with descriptive errors
- Use async/await consistently
- Parameterized queries only (SQL injection prevention)
- Keep controllers thin, services fat
- Single responsibility principle

### 3. Database PostgreSQL (`database-postgres/`)
**Applies to:** `database/**/*.sql`, `backend/src/config/database.ts`, `backend/src/**/*service*.ts`

PostgreSQL best practices:
- Schema design with proper naming conventions
- Complete table definitions with constraints
- Index strategy for query optimization
- Query patterns (SELECT, INSERT, UPDATE, DELETE)
- Transaction handling
- Migration patterns
- Security and permissions

**Key Principles:**
- Use snake_case for all identifiers
- Never use `SELECT *` in application code
- Always use parameterized queries
- Add indexes based on query patterns
- Use transactions for multi-step operations
- Explicit JOIN types

### 4. Docker Infrastructure (`docker-infrastructure/`)
**Applies to:** `**/Dockerfile`, `**/docker-compose*.yml`, `**/.dockerignore`, `**/nginx.conf`

Docker and deployment standards:
- Multi-stage Dockerfile patterns for Node and Angular
- docker-compose configuration with health checks
- NGINX configuration for frontend and proxying
- .dockerignore patterns
- Environment variable management
- Health check implementations
- Deployment scripts for Raspberry Pi

**Key Principles:**
- Multi-stage builds for smaller images
- Run as non-root user
- Pin specific versions
- Layer caching optimization
- Comprehensive health checks
- Security headers and best practices

## How Rules Work

Rules are automatically applied based on the file patterns (globs) specified in their frontmatter. When you work on files matching a rule's pattern, Cursor will include that rule's guidance in the AI context.

### Rule Application Types

- **Always Apply** (`alwaysApply: true`): Applied to every chat session
- **Apply Intelligently** (`alwaysApply: false` with description): Agent decides based on relevance
- **Apply to Specific Files** (`globs: [...]`): Applied when working on matching files
- **Apply Manually**: Reference with `@rule-name` in chat

## Common Patterns Across All Rules

All rules emphasize these coding principles:

1. **Early Returns**: Exit functions early to avoid deeply nested conditionals
   ```typescript
   // Good
   if (!userId) {
     return error;
   }
   // Continue with main logic
   
   // Bad - deeply nested
   if (userId) {
     if (puzzleId) {
       if (answer) {
         // deeply nested logic
       }
     }
   }
   ```

2. **Type Safety**: Use TypeScript strict mode, type all parameters and returns

3. **Fail Fast**: Validate inputs immediately, throw descriptive errors

4. **Single Responsibility**: Each function/component does one thing well

5. **Explicit Over Implicit**: Be clear and obvious in your code

6. **Security First**: Never expose sensitive data, use parameterized queries, validate inputs

## Using These Rules

### In Cursor Chat

The rules will automatically apply when you edit files in their scope. You can also manually reference them:

```
@frontend-angular How should I structure this component?
@backend-api Show me the correct pattern for database transactions
@database-postgres What indexes should I add for this query?
@docker-infrastructure How do I configure health checks?
```

### During Development

- Rules guide code generation and suggestions
- Follow the checklist at the end of each rule
- Use the concrete examples as templates
- Refer to the principles when making design decisions

## Updating Rules

When updating rules:
1. Keep rules focused and under 500 lines
2. Provide concrete, copy-paste-able examples
3. Write like internal documentation
4. Update this README if adding new rules

## Related Files

- `.env.example` - Environment variable template
- `docker-compose.yml` - Service orchestration
- `database/init.sql` - Database schema
- Project plan at `~/.cursor/plans/treasure_hunt_app_setup_79f9810a.plan.md`

## Best Practices Summary

### Frontend
✓ Mobile-first design  
✓ Standalone components  
✓ Early returns  
✓ Proper cleanup (takeUntil)  
✓ BEM naming for CSS  

### Backend
✓ Early validation  
✓ Parameterized queries  
✓ Use transactions  
✓ Thin controllers  
✓ Descriptive errors  

### Database
✓ snake_case naming  
✓ Explicit column names  
✓ Index foreign keys  
✓ Use constraints  
✓ Transaction safety  

### Docker
✓ Multi-stage builds  
✓ Non-root user  
✓ Health checks  
✓ Pin versions  
✓ Layer caching  

---

For more information on Cursor rules, see: https://cursor.com/docs/context/rules

