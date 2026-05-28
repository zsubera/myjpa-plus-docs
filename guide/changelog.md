# Changelog

## v0.0.3

### Features

- Lambda type-safe query builder (`QuerySpec`)
- Fluent API with AND/OR/NOT condition groups
- Conditional (guarded) methods for dynamic query building
- JOIN support (INNER, LEFT, FETCH, LEFT_FETCH) with nested conditions
- EXISTS/NOT EXISTS correlated subqueries with `correlatedEq` shortcut
- Bulk update and delete operations (`UpdateSpec`, `DeleteSpec`)
- Conditional SET in UpdateSpec
- Soft delete support with `@SoftDelete` annotation
- `MyJpaRepository` base interface with soft delete methods
- `MyJpaTemplate` convenience class with streaming API
- `ProjectionSpec` for DTO projection queries
- `EntityGraphHelper` for dynamic fetch strategies
- `PageableHelper` for pagination integration
- `InClauseBuilder` with auto-batching (Oracle-compatible)
- `BaseEntity` with audit fields (createdAt, updatedAt)
- Null-safe operations (eq/eq(null) → IS NULL)
- Multi-field LIKE search (`multiLike`)
- Case-insensitive comparisons (`eqIgnoreCase`, `likeIgnoreCase`)
- Consumer-based API for automatic group closing
- Query timeout and lock mode support
- Spring Boot auto-configuration
- Configurable max results and deep pagination warnings
