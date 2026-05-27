# Changelog

## v0.1.0-SNAPSHOT (Unreleased)

### Features

- Lambda type-safe query builder (`QuerySpec`)
- Fluent API with AND/OR/NOT condition groups
- JOIN support (INNER, LEFT, FETCH) with nested conditions
- EXISTS/NOT EXISTS correlated subqueries
- Bulk update and delete operations (`UpdateSpec`, `DeleteSpec`)
- Soft delete support with `@SoftDelete` annotation
- `MyJpaRepository` base interface with soft delete methods
- `MyJpaTemplate` convenience class
- `EntityGraphHelper` for dynamic fetch strategies
- `PageableHelper` for pagination integration
- Null-safe operations (eq/eq(null) → IS NULL)
- Multi-field LIKE search (`multiLike`)
- Case-insensitive comparisons (`eqIgnoreCase`, `likeIgnoreCase`)
- Consumer-based API for automatic group closing
- Query timeout and lock mode support
