---
description: "PostgreSQL database standards - schema design, query optimization, migrations, indexes, and transaction patterns"
alwaysApply: false
globs:
  - "database/**/*.sql"
  - "backend/src/config/database.ts"
  - "backend/src/**/*service*.ts"
---

# PostgreSQL Database Standards

You are an expert in PostgreSQL, database design, query optimization, and data integrity.

## Core Principles

- **Normalize first, denormalize strategically**: Start with normalized schema
- **Index intelligently**: Add indexes based on query patterns, not assumptions
- **Use transactions**: Ensure data consistency for multi-step operations
- **Parameterized queries only**: Prevent SQL injection - never concatenate SQL
- **Explicit is better**: Always specify column names, JOIN types, and constraints
- **Early validation**: Check constraints and validations at database level.

## Naming Conventions

### Tables
- Use **snake_case** for all identifiers
- Use **plural** for tables: `users`, `puzzles`, `hints`
- Use **singular** for junction tables: `user_progress` (not `users_progresses`)

### Columns
- **Primary keys**: `id` (SERIAL or UUID)
- **Foreign keys**: `{table_singular}_id` (e.g., `user_id`, `puzzle_id`)
- **Timestamps**: `created_at`, `updated_at`, `deleted_at`, `completed_at`
- **Booleans**: Use `is_` prefix or past tense: `is_active`, `completed`
- **Enums**: Use descriptive names: `difficulty_level`, `user_role`

## Data Types

- `SERIAL` or `UUID` for primary keys
- `VARCHAR(n)` for constrained strings, `TEXT` for unlimited
- `TIMESTAMP WITH TIME ZONE` for all timestamps (never without timezone)
- `NUMERIC(p,s)` for monetary values (never FLOAT)
- `BOOLEAN` for flags (never integers 0/1)
- `JSONB` for flexible data structures (with GIN indexes)
- `INET` for IP addresses
- Use `CHECK` constraints for validation

## Schema Design Best Practices

### Table Structure
- Always include `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
- Add `updated_at` for mutable data with UPDATE trigger
- Use `CHECK` constraints for enum-like values
- Add `COMMENT ON TABLE/COLUMN` for documentation
- Use `IF NOT EXISTS` for idempotent migrations

### Foreign Keys
- Always specify `ON DELETE` behavior (CASCADE, SET NULL, RESTRICT)
- Use `ON UPDATE CASCADE` when appropriate
- Index all foreign key columns for JOIN performance

### Primary Keys
- Prefer `UUID DEFAULT gen_random_uuid()` for distributed systems
- Use `SERIAL` for single-server deployments
- For composite keys, order columns by selectivity (most unique first)

## Query Best Practices

### SELECT
- **Never use `SELECT *`** in application code - always specify columns
- Use explicit JOIN types: `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN` (never implicit joins)
- Order WHERE conditions by selectivity (most restrictive first)
- Always use `ORDER BY` for predictable results
- Use `LIMIT` to cap result sets
- Use **parameterized queries** ($1, $2) to prevent SQL injection

### INSERT
- Always specify column names explicitly
- Use `RETURNING` to get generated IDs/timestamps
- Use multi-row INSERT for bulk operations
- Use `ON CONFLICT ... DO UPDATE` for upsert patterns
- Validate data with CHECK constraints, not application code

### UPDATE
- **Always use WHERE clause** (prevent accidental full table updates)
- Use `RETURNING` to confirm changes
- Auto-update `updated_at` with triggers
- Check `rowCount` to verify operation succeeded
- Use `WHERE column != $1` to avoid unnecessary updates

### DELETE
- **Prefer soft deletes** with `deleted_at` for audit trails
- Always use WHERE clause
- Consider archiving before deletion
- Use `ON DELETE CASCADE` judiciously
- Add `deleted_at IS NULL` to indexes for active records

## Transactions

### Key Principles
- Use transactions for **multi-step operations** that must succeed or fail together
- Keep transactions **short** to minimize lock contention
- Use `FOR UPDATE` to lock rows when concurrent access matters
- Always handle errors with `ROLLBACK`
- Use appropriate isolation level (usually READ COMMITTED)
- Avoid long-running transactions in web requests

### Transaction Pattern
```typescript
// In application code
return await transaction(async (client) => {
  // 1. Lock and validate
  const row = await client.query('SELECT ... FOR UPDATE');
  if (!isValid(row)) throw new Error('Validation failed');
  
  // 2. Perform updates
  await client.query('UPDATE ... WHERE ...');
  await client.query('INSERT INTO ... VALUES ...');
  
  // 3. Return result (auto-commits on success, rolls back on error)
  return result;
});
```

## Indexes

### Index Strategy
- **Single column**: For equality searches and foreign keys
- **Composite**: For multi-column queries (order by selectivity)
- **Partial**: Add WHERE clause to index only relevant rows
- **Unique**: Enforce uniqueness at database level
- **GIN**: For JSONB, arrays, and full-text search
- **GiST**: For geometric data and complex searches

### Indexing Rules
- Index all foreign key columns
- Index columns in WHERE, JOIN, ORDER BY clauses
- Put most selective column first in composite indexes
- Use partial indexes for common filtered queries
- Monitor with `pg_stat_user_indexes` - remove unused indexes
- Each index adds write overhead - don't over-index
- Rebuild indexes periodically with `REINDEX`

## Performance Optimization

### Query Analysis
- Use `EXPLAIN ANALYZE` to identify bottlenecks
- Look for seq scans on large tables (add indexes)
- Check for high cost operations
- Monitor query execution time in logs

### Optimization Techniques
- **CTEs**: Use for complex queries and readability
- **Window Functions**: Prefer over subqueries for rankings/aggregations
- **JOINs over N+1**: Always fetch related data in single query
- **Limit Early**: Apply WHERE filters before JOINs when possible
- **Materialized Views**: For expensive, frequently-run queries
- **Connection Pooling**: Reuse connections (pg Pool with max: 20)

## Migrations

### Best Practices
- **Naming**: `YYYYMMDD_description.sql` (e.g., `20240101_create_users.sql`)
- **Idempotent**: Use `IF NOT EXISTS`, `IF EXISTS`
- **Transactional**: Wrap in `BEGIN; ... COMMIT;`
- **Rollback Scripts**: Create corresponding `_down.sql` files
- **Never Modify**: Don't change past migrations - create new ones
- **Test First**: Run on copy of production data

### Migration Structure
```sql
-- migrations/001_initial_schema.sql
BEGIN;
  CREATE TABLE IF NOT EXISTS users (...);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  COMMENT ON TABLE users IS 'Application users';
COMMIT;
```

## Database Functions & Triggers

### Auto-Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trigger_name
BEFORE UPDATE ON table_name
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### When to Use Functions
- Complex business logic that should be centralized
- Computed columns or validation
- Reusable query logic
- Keep functions simple and testable

## Security

### Permission Management
- **Principle of Least Privilege**: Grant only necessary permissions
- **Application User**: Create dedicated role with limited permissions
- **Never**: Grant SUPERUSER, CREATE DATABASE, or TRUNCATE to app

### SQL Injection Prevention
- **Always use parameterized queries** ($1, $2, etc.)
- Never concatenate user input into SQL strings
- Validate data types at application layer

### Data Protection
- Hash passwords with bcrypt (bcrypt.hash with 10+ rounds)
- Never store plain text passwords or secrets
- Use Row-Level Security (RLS) for multi-tenant applications
- Encrypt sensitive columns with pgcrypto if needed

## Maintenance & Monitoring

### Regular Tasks
- `VACUUM ANALYZE` weekly on active tables
- `REINDEX` monthly or when performance degrades
- Monitor table/index sizes with `pg_stat` views
- Remove unused indexes (check `pg_stat_user_indexes`)
- Archive old data (soft delete + periodic cleanup)

### Performance Monitoring
```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND indexname NOT LIKE '%_pkey';
```

## Development Checklist

### Schema Design
- [ ] Use snake_case for all identifiers (tables, columns, indexes)
- [ ] Add `created_at TIMESTAMP WITH TIME ZONE` to all tables
- [ ] Use `updated_at` with trigger for mutable data
- [ ] Add CHECK constraints for validation
- [ ] Document with COMMENT ON TABLE/COLUMN
- [ ] Specify ON DELETE behavior for all foreign keys
- [ ] Use appropriate data types (NUMERIC for money, BOOLEAN for flags)

### Query Writing
- [ ] Specify column names explicitly (never SELECT *)
- [ ] Use parameterized queries ($1, $2) - never concatenate SQL
- [ ] Add WHERE clause to all UPDATEs and DELETEs
- [ ] Use explicit JOIN types (INNER, LEFT, RIGHT)
- [ ] Use RETURNING to get generated values
- [ ] Order WHERE conditions by selectivity

### Performance
- [ ] Index all foreign key columns
- [ ] Create indexes for WHERE, JOIN, ORDER BY columns
- [ ] Use EXPLAIN ANALYZE for slow queries
- [ ] Keep transactions short
- [ ] Use connection pooling
- [ ] Monitor index usage and remove unused indexes

### Security
- [ ] Hash passwords with bcrypt (never plain text)
- [ ] Grant minimum necessary permissions
- [ ] Use parameterized queries only
- [ ] Validate input at database level (CHECK constraints)
- [ ] Audit permissions regularly

### Migrations
- [ ] Use descriptive filenames with dates
- [ ] Wrap in transactions (BEGIN/COMMIT)
- [ ] Use IF NOT EXISTS for idempotency
- [ ] Create rollback scripts
- [ ] Test on copy of production data first
- [ ] Never modify past migrations

