# Changelog

## [1.0.1] - 2026-05-28

### Added
- `@IgnoreSoftDelete` annotation to skip auto soft-delete filtering on methods or types
- `MyJpaTemplate.findById(Class, Object)` for direct entity lookup by ID
- `MyJpaTemplate.findOne(Class, QuerySpec)` for single entity queries
- `EntityGraphHelper.nest(String)` for chaining nested attribute paths
- `@SoftDelete(deletedValue)` attribute for enum-based soft delete
- `QuerySpec.having(Function<Path, Predicate>)` convenience overload
- `ConditionBuilder.where(Function<Root, Predicate>)` overload
- System property `myjpa-plus.in-clause-max-size` for configuring IN clause batch size
- System property `myjpa-plus.lambda-cache-size` for configuring LambdaUtils cache size

### Fixed
- `rawLike` description corrected: auto-escapes wildcards and wraps with `%...%`

## [1.0.0] - 2026-05-28

### Breaking Changes
- `DeleteSpec` now requires explicit WHERE conditions. Calling `execute()` or `toDelete()` without conditions throws `IllegalStateException`. Use `deleteAll(EntityManager)` for unconditional delete.
- Fixed `resolveOr()` empty group semantics: now returns `cb.disjunction()` (1=0) instead of `cb.conjunction()` (1=1).

### Added
- `eqIgnoreCase` / `likeIgnoreCase` - Case-insensitive string conditions (UPPER-based)
- `groupBy(SFunction...)` - GROUP BY clause support
- `having(BiFunction)` - HAVING clause for aggregate queries
- `where(BiFunction)` - Raw Predicate injection as escape hatch
- `not(Consumer)` - Negation condition groups
- `startsWith` / `endsWith` / `contains` - Convenience LIKE methods
- `in(Collection)` / `notIn(Collection)` overloads
- Consumer pattern: `or(Consumer)` / `join(field, Consumer)` / `leftJoin(field, Consumer)`
- Spring Boot auto-configuration
- Subquery correlation via `correlate(root)`
- `SubQuerySpec.correlatedEq()` - Typed correlation predicate builder
- `LambdaUtils` property name cache (by implClass + methodName)
- Empty value validation for `in` / `notIn`
- `eq(field, null)` auto-converts to `IS NULL`
- `endOr()` throws `IllegalStateException` on mismatched calls
- `DeleteSpec.deleteAll(EntityManager)` / `deleteAllInTransaction(EntityManager)` - Safe unconditional delete
- SoftDeleteHelper Specification caching (by entityClass)
- `ProjectionSpec` - DTO projection queries with Tuple and constructor support
- `BaseEntity` - Abstract base entity with audit fields (id, createdAt, updatedAt)
- `MyJpaTemplate` streaming API (`findAllStream`)
- `MyJpaTemplate` batch operations (`executeBatch`)
- Conditional (guarded) methods for all condition builders
- `QuerySpec.timeout()` / `lockMode()` / `applyQuerySettings()` - Query hint support
- `EntityGraphHelper` - Dynamic JPA EntityGraph builder
- `PageableHelper` - QuerySpec/Pageable sort integration
- `InClauseBuilder` - IN clause auto-batching (Oracle-compatible)

### Fixed
- `SubQuerySpec` conditions no longer override each other
- `select()` no longer silently overridden by `resolveExists`
- `resolveSimple` correctly handles Collection values in IN/NOT_IN
- Race condition in `SoftDeleteHelper.findSoftDeleteField()` (get + computeIfAbsent)
- `AbstractBulkOperationSpec.executeInTransaction()` now catches `Exception` (not just `RuntimeException`)

### Changed
- Eliminated three-layer duplication of condition methods: created `PredicateHelper` shared utility
- `ConditionNode` → sealed interface; all implementations are `final`
- SpotBugs threshold set to Medium
- JaCoCo minimum coverage 60% (excluding autoconfigure)
- Enabled doclint (`reference,html`)
- Version upgraded from `0.0.1` to `1.0.0` (semantic versioning)

### Infrastructure
- GitHub Actions CI (JDK 17/21 matrix + v* tag triggered release deploy)
- Dependabot automatic dependency updates
- CODE_OF_CONDUCT, ISSUE_TEMPLATE, PR_TEMPLATE, .editorconfig

## [0.0.1] - 2026-05-20 (Original jpa-extensions branch)

### Initial Release
- Lambda API based type-safe JPA `Specification` builder
- `QuerySpec<T>`: eq, ne, gt, ge, lt, le, like, notLike, in, notIn, between, isNull, isNotNull
- JOIN support: `join()`, `leftJoin()` with `JoinGroup`
- OR groups: `or()` with `OrGroup`, nested `OrJoinGroup` in joins
- EXISTS subqueries with `SubQuerySpec`
- Multi-field LIKE search via `multiLike`
- Spring MVC parameter resolvers: `@SearchParam`, `@ListParam`
- Jackson serializer for Hibernate lazy proxies
