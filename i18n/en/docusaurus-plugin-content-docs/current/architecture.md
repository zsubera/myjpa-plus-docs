---
sidebar_position: 1
title: Architecture Overview
---

# Architecture Overview

This document describes the internal architecture of MyJpa-Plus, including module relationships, data flow, and security defense layers.

## Module Map

```
com.zsubera.jpa
├── spec/              # Query specification builder (core)
│   ├── SFunction        — Serializable functional interface for lambda property extraction
│   ├── QuerySpec        — Main entry point (implements Specification<T> + ConditionBuilder)
│   ├── SubQuerySpec     — EXISTS/IN subquery builder (eager evaluation)
│   ├── CteSpec          — CTE builder (native SQL)
│   ├── ConditionBuilder — 40+ default condition methods (lazy evaluation)
│   ├── ConditionNode    — Sealed AST hierarchy (11 node types)
│   ├── NodeResolver     — AST → JPA Predicate resolver
│   ├── PredicateHelper  — Shared static predicate builder
│   ├── FunctionWhitelist — Function whitelist (startup ConcurrentHashMap → frozen snapshot)
│   ├── Spec             — Specification combinator (and/or/not static methods)
│   ├── QueryAggregates  — count/sum/avg/max/min expression factory
│   ├── JoinGroup / OrJoinGroup / OrGroup / NotGroup — Condition grouping builders
│   ├── BulkConditionSupport — Bulk operation condition method interface
│   ├── CacheKeyBuilder     — Query cache key building (recursive depth protection)
│   ├── AggregateSFunction  — Aggregate function serializable interface
│   ├── AggregateHelper     — Aggregate expression utility
│   └── QueryHavingSupport / QueryConditionSupport / QueryCompositionSupport
│       / QuerySubQuerySupport / QueryJoinSupport / QueryAggregateSupport
│       / QueryOrderBySupport — QuerySpec decomposition helpers
│
├── update/            # Bulk operations
│   ├── UpdateSpec       — Bulk UPDATE builder
│   ├── DeleteSpec       — Bulk DELETE builder
│   ├── MergeSpec        — UPSERT/MERGE builder (4 dialects + multi-row batch)
│   ├── AbstractBulkOperationSpec — Bulk operation condition tree + row limit checks
│   ├── OrConditionBuilder — OR condition group builder
│   ├── BulkTransactionHelper — Shared transaction management utility
│   ├── AuditUtils       — Audit logging and stack trace extraction
│   ├── DialectDetector  — Auto-detect database dialect from EntityManager
│   ├── DialectStrategy  — Dialect-specific UPSERT SQL generation SPI
│   ├── AbstractDialectStrategy — Shared quoting logic
│   ├── MysqlDialect / PostgresDialect / OracleDialect / SqlServerDialect
│   ├── PersistenceContextStrategy — Post-bulk-operation persistence context management strategy (AUTO_CLEAR / DEFER_TO_CALLER)
│   ├── CoalesceUpsertTransformer — UPSERT SQL parameter merging transformer
│   ├── SqlWithParams       — Native SQL + parameter binding pair
│   └── EntityFieldExtractor — Reflect entity fields → column name/value pairs
│
├── template/          # Query execution & caching
│   ├── MyJpaTemplate    — Main query/bulk template (Spring Bean)
│   ├── MyJpaTemplateOperations — Template operations interface (lambda query overloads)
│   ├── QueryCacheManager — Caffeine-based TTL cache (implements CacheAdapter)
│   ├── CacheAdapter     — Pluggable cache backend SPI
│   ├── CacheInvalidationListener — Auto-evict cache after entity modifications
│   ├── BulkOperationTemplate — Bulk execution with transaction management
│   ├── BatchSaveTemplate — Batch persist/merge with flush/clear cycles
│   ├── KeysetPaginationHelper — Keyset (cursor) pagination helper
│   ├── QueryBuildHelper — Query construction helper (Specification merge, count queries)
│   ├── DeepPaginationGuard — Deep pagination protection
│   ├── CachedQueryResult  — Cached query result wrapper
│   ├── DisabledCacheAdapter — No-op cache adapter
│   └── EntityModifiedEvent — Entity modification event
│
├── projection/        # DTO & Tuple projection (removed — functionality migrated to QueryProjectionSupport)
│   └── ProjectionSpec   — Removed
│
├── repository/        # Extended Spring Data Repository
│   ├── MyJpaRepository   — Repository interface with Lambda DSL
│   ├── DefaultMyJpaRepository — Base implementation with soft delete
│   ├── MyJpaRepositoryFactoryBean — Custom RepositoryFactoryBean
│   ├── SoftDeleteContext  — @IgnoreSoftDelete ThreadLocal stack
│   ├── EntityManagerHelper / EntityManagerResolver — Multi-datasource resolver
│   ├── IgnoreSoftDeleteAdvisor — @IgnoreSoftDelete AOP advice
│   └── OptimisticLockRetryAdvisor — @RetryOnOptimisticLock AOP advice
│
├── softdelete/        # Soft delete features
│   ├── SoftDeleteHelper  — Soft delete field/annotation/Specification cache
│   └── SoftDeleteBulkExecutor — Bulk delete via native SQL / CriteriaUpdate
│
├── annotation/        # Custom annotations
│   ├── @SoftDelete       — Mark field as soft delete flag
│   ├── @IgnoreSoftDelete — Disable automatic soft delete filtering
│   ├── @Encrypt          — AES/GCM transparent encryption
│   ├── @Mask             — JSON output masking
│   └── @RetryOnOptimisticLock — AOP annotation with exponential backoff retry
│
├── converter/         # Type converters
│   ├── @CodeEnum / @CodeEnumValue — Code-based enum annotations
│   ├── CodeEnumType      — Hibernate UserType for code-based enums
│   ├── CodeEnumHelper    — Enum code resolution helper
│   ├── EncryptConverter  — AES/GCM AttributeConverter
│   ├── EncryptionKeyManager — PBKDF2 key derivation, multi-version rotation
│   └── MaskSerializer    — Jackson serializer for @Mask
│
├── monitor/           # SQL monitoring
│   ├── SlowQueryDataSourceProxy — JDBC proxy-based slow query detection
│   ├── SlowQueryDataSourceProxyPostProcessor — DataSource post-processing proxy
│   ├── QueryMetricsCollector — Singleton metrics (count, average, max)
│   ├── SqlSanitizer     — Remove sensitive data from SQL logs
│   └── SlowQueryListener — Slow query event listener interface
│
├── autoconfigure/     # Spring Boot auto-configuration
│   ├── MyJpaPlusAutoConfiguration — Main @AutoConfiguration
│   ├── MyJpaPlusGlobalConfig — Global config bean
│   ├── MyJpaPlusProperties — @ConfigurationProperties
│   ├── GlobalConfigHolder — Centralized config with volatile fields
│   ├── EnvironmentHelper — Environment detection utility
│   └── SoftDeleteFilterBean — Soft delete JPA Specification injection
│
├── codegen/           # Code generation
│   └── EntityCodeGenerator — Generate JPA entity source from table metadata
│
├── exception/         # Custom exceptions
│   ├── MyJpaPlusException — Base exception with ErrorCode + context cleanup
│   ├── QueryBuildException / BulkOperationException / MyJpaDataAccessException
│   └── SecurityViolationException
│
└── util/              # Shared utilities
    ├── LambdaUtils        — SerializedLambda → property name extraction
    ├── IdentifierValidator — SQL identifier validation + Unicode homoglyph detection
    ├── InClauseBuilder    — IN/NOT IN clause auto-batching
    ├── SampledEvictionCache — Caffeine-based bounded cache utility
    ├── CacheEvictionHelper — L1 cache selective eviction
    ├── PageableHelper     — Pagination parameter helper
    └── EntityClassResolver / StringHelper / EntityGraphHelper
```

## Data Flow: Lambda Query Execution

```
User Code                   Library                        JPA Provider
──────────                   ───────                        ────────────
repository.findAll(s ->     QuerySpec.of(consumer)
  s.eq(User::getName,       │
    "John")                 │
                            │ LambdaUtils.resolveProperty(User::getName)
                            │ → SerializedLambda → "name"
                            │
                            │ QuerySpec.eq("name", "John")
                            │ → Append SimpleNode to condition list
                            │
                            │ QuerySpec.toPredicate(root, cb, query)
                            │ → NodeResolver.resolve(conditionTree)
                            │ → Recursively traverse ConditionNode tree
                            │ → SimpleNode.resolve() → cb.equal(root.get("name"), "John")
                            │
                            │ Return JPA Predicate
                            │
                            │ JPA CriteriaQuery.where(predicate)
                            └──────────────────────────────────→ SELECT * FROM users WHERE name = 'John'
```

## Data Flow: Single-row UPSERT

```
MergeSpec.withEntity(user)
  .onConflict(User::getEmail)
  .updateOnConflict(User::getName)
  .execute(em)
    │
    ├── DialectDetector.detectDialect(em)
    │   ├── Priority 1: JDBC URL property
    │   ├── Priority 2: Connection.getMetaData().getDatabaseProductName()
    │   ├── Priority 3: Hibernate Session reflection
    │   └── Priority 4: System property myjpa-plus.dialect
    │
    ├── DialectStrategy.buildUpsertSql(...)
    │   ├── MysqlDialect:     INSERT INTO t (...) VALUES (...) ON DUPLICATE KEY UPDATE col = VALUES(col)
    │   ├── PostgresDialect:  INSERT INTO t (...) VALUES (...) ON CONFLICT (...) DO UPDATE SET col = EXCLUDED.col
    │   ├── OracleDialect:    MERGE INTO t USING (SELECT ? AS col FROM DUAL) ON (...) WHEN NOT MATCHED ...
    │   └── SqlServerDialect: MERGE INTO t USING (VALUES (?)) AS new_row(col) ON (...) WHEN NOT MATCHED ...
    │
    └── em.createNativeQuery(sql).executeUpdate()
```

## Data Flow: Multi-row Batch UPSERT

When `MergeSpec.executeBatch()` detects batch mode support via `supportsBatchUpsert()`:

```
MergeSpec.executeBatch([user1, user2, user3], em)
  │
  ├── DialectStrategy.supportsBatchUpsert()? → true
  │   ├── MysqlDialect:     true
  │   └── PostgresDialect:  true
  │
  ├── EntityFieldExtractor.extractFieldValues() per entity
  │   → [user1: (name→"A", email→"a@x"), user2: (name→"B", email→"b@x"), ...]
  │
  ├── DialectStrategy.buildBatchUpsertSql(...)
  │   ├── MysqlDialect:
  │   │     INSERT INTO t (name, email) VALUES (?, ?), (?, ?), (?, ?)
  │   │     ON DUPLICATE KEY UPDATE name = VALUES(name)
  │   ├── PostgresDialect:
  │   │     INSERT INTO t (name, email) AS _new VALUES (?, ?), (?, ?), (?, ?)
  │   │     ON CONFLICT (email) DO UPDATE SET name = _new.name
  │   └── (Non-batch dialects fall back to row-by-row loop)
  │
  └── em.createNativeQuery(sql).executeUpdate()
     → N rows in 1 network round trip (vs N trips for row-by-row)
```

## Security Defense Layers

The library implements defense-in-depth with multiple security layers:

### Layer 1: Input Validation (Trust Boundary)

```
User Lambda Reference
  → LambdaUtils.resolveProperty()
    → IdentifierValidator.validateColumnName()
      → Regex: ^[a-zA-Z_][a-zA-Z0-9_]*$ (ASCII) or Unicode mode
      → Unicode homoglyph detection (Cyrillic, Greek, Armenian, fullwidth chars)
      → Max length: 128 characters
```

### Layer 2: Function Whitelist (Code Injection Defense)

```
QuerySpec.func(field, "functionName", params...)
  → Three-tier validation:
    1. SAFE_FIELD_NAME_PATTERN regex
    2. SAFE_FUNCTION_NAMES set (CONCAT, COALESCE, IFNULL, etc.)
    3. BOOLEAN_FUNCTION_NAMES set (IS_NULL, IS_EMPTY, etc.)
  → WHITELIST_ENFORCED = true (hardcoded, cannot be disabled)
```

### Layer 3: SQL Injection Detection (CTE Module)

```
CteSpec.as(sql)
  → CTE name reserved word validation
  → Dangerous keyword detection (DROP, TRUNCATE, GRANT, etc.), word-boundary matching
  → SQL injection pattern detection (comments, semicolons, WAITFOR DELAY)
  → Unbound parameter detection
  → strictMode = true (hardcoded, cannot be disabled)
  → Note: UNION SELECT / UNION ALL SELECT are legal syntax in non-recursive and recursive CTEs, not detected as injection signatures
```

### Layer 4: LIKE Wildcard Escaping

```
QuerySpec.like(field, "pattern%_")
  → PredicateHelper.escapeLikeWildcards()
    → Escape order: \ → \\, then _ → \_, then % → \%
    → LIKE escape character: \
```

### Layer 5: Data Sanitization (Output)

```
MyJpaPlusException.toString()
  → Regex detection: password=, token=, key=, secret=, credential=, ssn, credit_card
  → Replace with *** (word-boundary assertions prevent "primaryKey" false positives)
  → Truncate to 200 characters

SqlSanitizer.sanitize(sql)
  → Remove: string literals, numeric literals, comments, dollar-quoted strings
  → Preserve: LIMIT/OFFSET numbers (for debugging)
  → Unicode Private Use Area sentinels during protection
```

### Layer 6: Safety Guards (Runtime Limits)

```
Query max results:        10,000 rows (configurable)
Deep pagination limit:    1,000,000 offset (configurable)
Bulk operation rows:      10,000 rows (configurable)
IN clause hard limit:     5,000 parameters (configurable)
Unconditional operations: Must explicitly pass allowUnconditional(true)
Optimistic lock retry:    Max 20 attempts, max 60s total timeout
Recursion depth:          NodeResolver=50, CacheKeyBuilder=128
```

### Layer 7: Cryptographic Security (Encryption)

```
@Encrypt fields
  → Algorithm: AES/GCM/NoPadding (authenticated encryption, 128-bit tag)
  → Key derivation: PBKDF2WithHmacSHA256 (600,000 iterations)
  → Multi-version key rotation: v1:key1,v2:key2 format
  → Salt verification: Blocks startup if no salt in production
  → Plaintext cleanup: Arrays.fill(plaintextBytes, 0) after encryption
  → Key material cleanup: Arrays.fill(keyChars, '\0') after PBKDF2
```

## Thread Safety Summary

| Component | Thread-Safe | Mechanism |
|-----------|------------|-----------|
| QuerySpec | No | Declared as mutable builder |
| SubQuerySpec | No | Declared as mutable builder |
| ProjectionSpec | Removed | Functionality migrated to `QueryProjectionSupport` |
| EntityGraphHelper | No | Declared as mutable builder |
| FunctionWhitelist | Yes | ConcurrentHashMap + AtomicReference frozen snapshot |
| SoftDeleteContext | Yes | ThreadLocal&lt;Integer&gt; counter |
| EntityManagerHelper | Yes | ConcurrentHashMap + volatile fields |
| SoftDeleteBulkExecutor | Yes | Stateless (pure static methods, no shared mutable state) |
| QueryCacheManager | Yes | Caffeine built-in segment lock |
| DialectDetector | Yes | Caffeine cache |
| EncryptConverter | Yes | ConcurrentLinkedDeque Cipher object pool (bounded, 64 capacity), atomic borrow/return |
| InClauseBuilder | Yes | AtomicReference&lt;Config&gt; |
| LambdaUtils | Yes | Caffeine cache (SampledEvictionCache backend) |
| IdentifierValidator | Yes | Volatile flags (write-once at configuration time) |
| SampledEvictionCache | Yes | Caffeine built-in concurrency safety |

