---
sidebar_position: 1
title: Changelog
---

# Changelog

All notable changes are documented in this file. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versioning follows [Semantic Versioning](https://semver.org/).

## [1.3.1] - 2026-07-14

### Added
- **Persistence context strategy** — `AbstractBulkOperationSpec.persistenceStrategy()` and `MergeSpec.persistenceStrategy()` support `PersistenceContextStrategy.DEFER_TO_CALLER`, allowing callers to manage flush/clear after bulk operations; default remains `AUTO_CLEAR` for backward compatibility
- **Thread-safe bulk update/delete limits** — Enhanced row limit checking thread safety, fixing limit bypass under concurrency

### Changed
- **Caffeine cache unification** — All hand-written cache implementations replaced with Caffeine, eliminating ~1000 lines of manual cache code
  - `SampledEvictionCache`: internal implementation changed from ConcurrentHashMap + sampling eviction to Caffeine (13+ references)
  - `QueryCacheManager`: from 847 lines hand-written to ~300 lines Caffeine-backed
  - `EncryptionKeyManager`: key cache from ConcurrentHashMap + RWLock + manual LRU to Caffeine
  - `DialectDetector`: dialect cache from ConcurrentHashMap + manual eviction to Caffeine
  - `QueryMetricsCollector`: metrics storage from ConcurrentHashMap + manual eviction to Caffeine
  - 13 `ConcurrentReferenceHashMap` weak-reference caches replaced with `Caffeine.newBuilder().weakKeys()`
  - Removed `ReentrantReadWriteLock` and manual LRU eviction from `EncryptionKeyManager`
- **CteSpec UNION SELECT detection removed** — Removed UNION SELECT / UNION ALL SELECT injection detection patterns; they are legal syntax in non-recursive and recursive CTEs (e.g., `WITH cte AS (SELECT 1 UNION ALL SELECT 2)`) and caused false positives
- **BulkTransactionHelper clear timing** — `em.clear()` moved to after `tx.commit()`, fixing L1 cache loss after commit in new transactions
- **CacheEvictionHelper Hibernate detection** — Added `hibernateSessionClass.isInstance()` null-safe check to prevent `ClassCastException` in non-Hibernate environments

### Fixed
- **EncryptConverter Cipher pool RuntimeException leak** — Cipher not returned to pool when `cipher.init()` threw RuntimeException; added `cipherReturned` flag ensuring return on all exception paths
- **DefaultMyJpaRepository bulk operations ignore AUTO_FILTER_OVERRIDE** — `update()` and `delete()` default methods now delegate to `shouldApplySoftDeleteFilter()`
- **SoftDeleteHelper.isSoftDeleted NPE** — Added defensive null check when weak reference cache rebuilds
- **SoftDeleteBulkExecutor count query** — Fixed active row count for boolean-type soft-delete entities
- **SoftDeleteHelper.clearCaches dialect cache** — Added `cachedDialect = null` clearing for context switching
- **DeleteSpec.executeAsSoftDelete row limit** — COUNT query now includes soft-delete filter for accurate matching
- **DeleteSpec JTA rollback** — Added `IllegalStateException` catch before `rollback()` for JTA environments
- **executeCountQuery missing AUTO_FILTER_OVERRIDE** — Fixed pagination count query not checking ThreadLocal
- **Batch save exception handling and cache cleanup** — Fixed cache not cleaned on batch save failure
- **Condition node null handling** — Fixed inconsistent null handling, added 71 test coverage
- **Bulk operation security vulnerabilities** — Fixed SQL injection and row-limit bypass issues
- **Bulk operation duplicate row processing** — Fixed unstable sort leading to duplicate processing in cursor-based batches
- **17 correctness fixes** — Covering data integrity, concurrency safety, security vulnerabilities, and crash risks
- **EntityManagerHelper multi-datasource race condition** — Fixed concurrent registration race
- **SQL identifier quoting** — Fixed identifier quoting and multi-datasource support

### Optimized
- **Query performance and encrypt converter** — Optimized multiple components for performance and thread safety
- **Batch save template version handling** — Fixed version method handling and security warning logs

## [1.3.0] - 2026-07-04

### Added
- **executeWithCallbacks** — `MergeSpec.executeWithCallbacks(em)` flushes the persistence context to trigger JPA lifecycle callbacks before executing the native UPSERT
- **Multi-row UPSERT batching** — `MergeSpec.executeBatch()` automatically uses `INSERT INTO ... VALUES (...), (...) ON CONFLICT ...` multi-row syntax (MySQL/PostgreSQL), falls back to row-by-row when dialect doesn't support it
- **supportsBatchUpsert()** — `DialectStrategy` adds capability detection method; `MergeSpec` uses capability check instead of try-catch
- **SoftDeleteBulkExecutor** — Extracted bulk soft-delete operations from `SoftDeleteHelper` (~450 lines), Helper reduced to ~740 lines, all public APIs preserved via delegation for backward compatibility
- **Lambda convenience overloads** — `MyJpaRepository` and `MyJpaTemplate` add `Consumer<QuerySpec<T>>` Lambda overloads, no need for `new QuerySpec<>()`
  - `findAll(consumer)`, `findOne(consumer)`, `count(consumer)`, `exists(consumer)`
  - `MyJpaTemplate` adds corresponding Lambda overloads
- **QuerySpec.of() factory method** — `QuerySpec.of(consumer)` static factory reduces 3-line creation to 1 line
- **Virtual thread compatibility** — `SoftDeleteContext` and `DefaultMyJpaRepository` fully compatible with Java 21+ virtual threads
  - `withIgnore(Runnable)` and `withIgnore(Supplier)` convenience methods with automatic lifecycle management
  - Virtual thread isolation verification tests
- **UPSERT dialect expansion** — `MergeSpec` supports 4 database dialects
  - `OracleDialect` (`MERGE INTO ... USING ... ON ... WHEN MATCHED/NOT MATCHED`)
  - `SqlServerDialect` (`[bracket]` escaping + `MERGE INTO`)
  - `DialectDetector` registers postgresql, mysql, oracle, sqlserver by default
  - `removeDialect()` for runtime dialect removal
- **QueryAggregates** — Standalone `count`/`sum`/`avg`/`max`/`min` aggregate expression factory methods
- **softDeleteAll row protection** — `SoftDeleteHelper.softDeleteAll()` adds `maxRows` parameter, defaults to 10000 rows max
- **multiLike nested field validation** — `multiLike(keyword, "address.city")` now validates each segment via `IdentifierValidator.validateColumnName()`
- **EncryptConverter transaction cleanup** — `registerTransactionCleanupIfNeeded()` auto-registers `afterCompletion` callback to clean Cipher ThreadLocal in virtual thread scenarios
- **CacheAdapter SPI** — Pluggable cache adapter interface for Redis/Caffeine/Hazelcast
  - `CacheAdapter` interface, `DisabledCacheAdapter` no-op implementation
  - `QueryCacheManager` implements `CacheAdapter` (backward compatible)
  - `MyJpaTemplate` uses `CacheAdapter` internally, adds `setCacheAdapter()`/`getCacheAdapter()`
  - `CacheInvalidationListener` accepts `CacheAdapter`
- **Java module system compatibility** — Complete `--add-opens` fix guide
- **Op.resolve() strategy pattern** — `Op` enum as single source of truth for predicate building

### Optimized
- **EncryptionKeyManager LRU cache eviction** — Key cache changed from FIFO to LRU strategy with access timestamp tracking
- **SlowQueryDataSourceProxy lock removal** — Removed `ReentrantLock`, uses `SampledEvictionCache.computeIfAbsent()` atomicity
- **QuerySpec split** — From 1265 lines to 887 lines + 7 helper classes
- **Deprecated API cleanup** — Removed 11 deprecated methods
- **QuerySpec.copy() performance** — Fast path for empty condition trees, skips deep copy

### Fixed
- **EncryptConverter Cipher pool leak** — Cipher objects returned to pool on encryption/decryption failure paths
- **BulkOperationTemplate iteration count** — Fixed double-increment in failed batch iteration
- **MergeSpec transaction management** — Extracted `safeRollback()` to unify rollback logic
- **QuerySpec.copy() deep copy** — Fixed shallow copy causing shared mutable state in nested conditions
- **NodeResolver LEFT JOIN soft-delete** — Moved soft-delete condition from WHERE to ON clause
- **EncryptConverter GCM state corruption** — Removed ThreadLocal Cipher cache, create new instance per operation (JDK-8201324)
- **CacheKeyBuilder recursion protection** — 128-level depth limit prevents StackOverflowError
- Plus 20+ additional bug fixes (see source CHANGELOG.md for full list)

## [1.2.0] - 2026-06-12

### Added
- **UPSERT/MERGE support** — `MergeSpec` builder for PostgreSQL `ON CONFLICT`, MySQL `ON DUPLICATE KEY`, H2 `MERGE`
- **CTE support** — `CteSpec` for non-recursive and recursive Common Table Expressions
- **SQL slow query monitoring** — `SqlSlowQueryInterceptor` + `myjpa-plus.monitoring` configuration
- **Field encryption** — `@Encrypt` annotation + `EncryptConverter` (AES/GCM, random IV)
- **Field masking** — `@Mask` annotation + `MaskSerializer` (Jackson, supports PHONE/EMAIL/ID_CARD/NAME)
- **Optimistic lock retry** — `@RetryOnOptimisticLock` annotation with exponential backoff
- **Query result caching** — `QueryCacheManager` with TTL expiration
- **Database function calls** — `func(field, functionName, comparisonOp, value)` condition method
- **Case-insensitive string queries** — `eqIgnoreCase`, `neIgnoreCase`, `likeIgnoreCase`
- **Multi-field LIKE search** — `multiLike(keyword, "field1", "field2")` with string field names
- **String soft delete** — `@SoftDelete` supports String type deletedValue
- **EntityManagerFactory support** — Improved `EntityManagerFactory` integration

### Changed
- **Removed H2 database support** — Tests unified on MySQL
- **Removed BaseEntity class** — Audit fields via `AuditEntityListener` without base class
- **Refactored entity field extraction and dialect detection**
- **Refactored bulk operation template** — Optimized transaction management and memory control
- **Refactored condition builder interfaces** — Split into 8 sub-interfaces

### Fixed
- **not() semantics** — Fixed negation condition group semantics
- **Cache eviction** — Fixed cache eviction in bulk operations
- **LIKE wildcard escaping** — Fixed `likeSafe()` wildcard escaping
- **null validation** — Unified condition method null validation

## [1.1.0] - 2026-05-31

### Added
- **Enum conversion support** — `@CodeEnum` + `@CodeEnumValue` annotations for Hibernate 6 enum mapping
  - CHAR(1) storage for enum codes (e.g., '0', '1', 'M', 'F')
  - Supports int, long, String code fields
  - No converter class needed
- **multiLike string field names** — `multiLike(keyword, "field1", "field2")` for dynamic field name scenarios
- **Integer soft delete** — `@SoftDelete(deletedIntValue = 1)` for integer-based delete markers
- **MyJpaTemplate.count()** — Convenience count method
- **Aggregate functions API** — New aggregate query functionality

### Changed
- `ConditionBuilder` adds `notBetween` and `likeIgnoreCase` condition variants
- `SubQuerySpec` and `AbstractBulkOperationSpec` add more condition convenience methods
- Optimized `LambdaUtils` cache eviction with CAS operations
- Optimized `InClauseBuilder` batch processing

### Fixed
- EXISTS subquery association limitation
- `MyJpaTemplate.findAllStream` deprecation strategy
- `DefaultMyJpaRepository.deleteById` for soft-deleted entities

## [1.0.0] - 2026-05-28

### Breaking Changes
- `DeleteSpec` now requires explicit WHERE conditions
- Fixed `resolveOr()` empty group semantics

### Added
- `eqIgnoreCase` / `likeIgnoreCase` — Case-insensitive string conditions
- `groupBy(SFunction...)` — GROUP BY clause support
- `having(BiFunction)` — HAVING clause for aggregate queries
- `not(Consumer)` — Negation condition groups
- `startsWith` / `endsWith` / `contains` — Convenience LIKE methods
- Consumer pattern: `or(Consumer)` / `join(field, Consumer)` / `leftJoin(field, Consumer)`
- Spring Boot auto-configuration
- `ProjectionSpec` — DTO projection queries
- `MyJpaTemplate` streaming API and batch operations
- Conditional (guarded) methods for all condition builders
- `EntityGraphHelper` — Dynamic JPA EntityGraph builder
- `PageableHelper` — QuerySpec/Pageable sort integration

### Fixed
- `SubQuerySpec` conditions no longer override each other
- Race condition in `SoftDeleteHelper.findSoftDeleteField()`

## [0.0.2] - 2026-05-28

### Added
- **Batch operation LIMIT support** — `executeWithMaxRows()` for max affected rows
- **Large IN clause handling** — Auto-split IN clauses exceeding database parameter limits
- **GroupBy + Having support** — `groupBy(SFunction...)` and `having(BiFunction)`
- **SubQuerySpec correlation** — `correlate(root)` for subquery correlation
- **Spring Boot auto-configuration** — Auto-register `MyJpaTemplate` and components

## [0.0.1] - 2026-05-26

### Initial Release
- Lambda API based type-safe JPA `Specification` builder
- `QuerySpec<T>`: eq, ne, gt, ge, lt, le, like, notLike, in, notIn, between, isNull, isNotNull
- JOIN support: `join()`, `leftJoin()` with `JoinGroup`
- OR groups: `or()` with `OrGroup`
- EXISTS subqueries with `SubQuerySpec`
- Multi-field LIKE search via `multiLike`
- Jackson serializer for Hibernate lazy proxies
