---
sidebar_position: 1
title: API Reference
---

# API Reference

## SFunction\<T, R\>

A serializable `Function<T, R>` for method references (e.g., `Entity::getField`). Enables runtime property name extraction via `SerializedLambda`.

## QuerySpec\<T\>

Core class for building type-safe queries. Implements `Specification<T>`.

### Static Factory

| Method | Description |
|--------|-------------|
| `QuerySpec.of(consumer)` | Create and configure a QuerySpec in one line |

### Condition Methods

| Method | Description | Example |
|--------|-------------|---------|
| `eq(field, value)` | Equals; null value → IS NULL | `.eq(User::getStatus, "ACTIVE")` |
| `ne(field, value)` | Not equals; null value → IS NOT NULL | `.ne(User::getStatus, "DELETED")` |
| `eqStrict(field, value)` | Equals (throws on null value) | `.eqStrict(User::getEmail, email)` |
| `neStrict(field, value)` | Not equals (throws on null value) | `.neStrict(User::getCode, code)` |
| `gt(field, value)` | Greater than | `.gt(User::getAge, 18)` |
| `ge(field, value)` | Greater than or equal | `.ge(User::getAge, 18)` |
| `lt(field, value)` | Less than | `.lt(User::getAge, 65)` |
| `le(field, value)` | Less than or equal | `.le(User::getAge, 65)` |
| `between(field, start, end)` | Between (inclusive) | `.between(User::getAge, 18, 65)` |
| `notBetween(field, start, end)` | Not between | `.notBetween(User::getAge, 0, 17)` |
| `like(field, value)` | LIKE (auto-wraps `%value%`, wildcards auto-escaped) | `.like(User::getName, "John")` |
| `notLike(field, value)` | NOT LIKE (auto-wraps `%value%`, wildcards auto-escaped) | `.notLike(User::getName, "test")` |
| `startsWith(field, value)` | LIKE `value%` with auto-escape | `.startsWith(User::getName, "John")` |
| `endsWith(field, value)` | LIKE `%value` with auto-escape | `.endsWith(User::getName, "son")` |
| `notStartsWith(field, value)` | NOT LIKE `value%` with auto-escape | `.notStartsWith(User::getName, "test")` |
| `notEndsWith(field, value)` | NOT LIKE `%value` with auto-escape | `.notEndsWith(User::getName, "test")` |
| `eqIgnoreCase(field, value)` | UPPER equals; null → IS NULL | `.eqIgnoreCase(User::getName, "john")` |
| `neIgnoreCase(field, value)` | UPPER not equals; null → IS NOT NULL | `.neIgnoreCase(User::getName, "john")` |
| `likeIgnoreCase(field, value)` | UPPER LIKE `%value%` | `.likeIgnoreCase(User::getName, "john")` |
| `in(field, values...)` | IN | `.in(User::getStatus, "A", "B")` |
| `in(field, collection)` | IN (Collection) | `.in(User::getStatus, List.of("A", "B"))` |
| `notIn(field, values...)` | NOT IN | `.notIn(User::getStatus, "C", "D")` |
| `notIn(field, collection)` | NOT IN (Collection) | `.notIn(User::getStatus, List.of("C", "D"))` |
| `isNull(field)` | IS NULL | `.isNull(User::getDeletedAt)` |
| `isNotNull(field)` | IS NOT NULL | `.isNotNull(User::getEmail)` |
| `isEmpty(field)` | IS EMPTY (collection) | `.isEmpty(User::getRoles)` |
| `isNotEmpty(field)` | IS NOT EMPTY (collection) | `.isNotEmpty(User::getRoles)` |
| `multiLike(keyword, fields...)` | Multi-field OR LIKE (SFunction) | `.multiLike("test", User::getName, User::getEmail)` |
| `multiLike(keyword, fieldNames...)` | Multi-field OR LIKE (String) | `.multiLike("test", "name", "email")` |
| `func(field, functionName, params...)` | Database function (whitelisted) | `.func(User::getMetadata, "jsonb_exists", "key")` |
| `inSubQuery(field, subEntity, config)` | IN subquery | `.inSubQuery(User::getDeptId, Department.class, sub -> ...)` |
| `notInSubQuery(field, subEntity, config)` | NOT IN subquery | `.notInSubQuery(User::getDeptId, Department.class, sub -> ...)` |
| `where(BiFunction)` | Raw predicate `(Path, CB) → Predicate` | `.where((path, cb) -> ...)` |
| `where(Function)` | Raw predicate `(Root) → Predicate` | `.where(root -> ...)` |

### Conditional (Guarded) Methods

All condition methods have a `boolean condition` first-parameter variant. Only adds the condition when `true`:

```java
.eq(condition, field, value)
.ne(condition, field, value)
.gt(condition, field, value)
.like(condition, field, pattern)
.in(condition, field, collection)
.between(condition, field, start, end)
.multiLike(condition, keyword, fields...)
.func(condition, field, functionName, params...)
// ... etc
```

### Grouping Methods

| Method | Description |
|--------|-------------|
| `or(config)` | OR group (Consumer pattern, auto-close) |
| `not(config)` | NOT group (Consumer pattern, auto-close) |
| `join(field, config)` | INNER JOIN (Consumer pattern, auto-close) |
| `leftJoin(field, config)` | LEFT JOIN (Consumer pattern, auto-close) |
| `fetchJoin(field, config)` | FETCH JOIN (Consumer pattern, auto-close) |
| `leftFetchJoin(field, config)` | LEFT FETCH JOIN (Consumer pattern, auto-close) |
| `or()` | Open OR group (manual close with `endOr()`) |
| `join(field)` | Open JOIN (manual close with `endJoin()`) |
| `leftJoin(field)` | Open LEFT JOIN |
| `fetchJoin(field)` | Open FETCH JOIN |
| `leftFetchJoin(field)` | Open LEFT FETCH JOIN |
| `exists(class, config)` | EXISTS subquery |
| `notExists(class, config)` | NOT EXISTS subquery |
| `inSubQuery(field, class, config)` | IN subquery |
| `notInSubQuery(field, class, config)` | NOT IN subquery |

### Query Settings

| Method | Description |
|--------|-------------|
| `distinct()` | Enable DISTINCT |
| `groupBy(fields...)` | GROUP BY clause |
| `having(BiFunction)` | HAVING clause `(Path, CB) → Predicate` |
| `having(Function)` | HAVING clause `(Path) → Predicate` |
| `havingCount(field, op, value)` | Type-safe HAVING COUNT |
| `havingSum(field, op, value)` | Type-safe HAVING SUM |
| `havingAvg(field, op, value)` | Type-safe HAVING AVG |
| `havingMax(field, op, value)` | Type-safe HAVING MAX |
| `havingMin(field, op, value)` | Type-safe HAVING MIN |
| `orderByAsc(fields...)` | Order ascending |
| `orderByDesc(fields...)` | Order descending |
| `timeout(seconds)` | Query timeout |
| `lockMode(mode)` | Pessimistic lock mode |

### Conversion Methods

| Method | Description |
|--------|-------------|
| `toSpecification()` | Convert to Specification |
| `toSpecification(external)` | AND-combine with external Specification |
| `toDescription()` | Human-readable query description |
| `and(other)` | AND-combine with another QuerySpec → Specification |
| `or(other)` | OR-combine with another QuerySpec → Specification |
| `then(other)` | Merge another QuerySpec's conditions into this |
| `copy()` | Defensive deep copy of the QuerySpec |
| `getSort()` | Expose ordering as Spring Data Sort |
| `getQueryTimeout()` | Get timeout (null if unset) |
| `getLockMode()` | Get lock mode (null if unset) |
| `applyQuerySettings(query)` | Apply timeout/lock to TypedQuery |
| `cacheKey()` | Generate cache key string (with value hashes) |
| `clearCache()` | Clear internal lambda property cache |

## JoinGroup\<T, J\>

Builder for JOIN conditions. Extends `ConditionBuilder<J>` with all condition methods.

| Method | Description |
|--------|-------------|
| `or(config)` | OR group inside JOIN |
| `or()` | Open OR group (manual close) |
| `join(field)` | Nested JOIN (manual close) |
| `leftJoin(field)` | Nested LEFT JOIN (manual close) |
| `join(field, config)` | Nested JOIN (Consumer pattern) |
| `leftJoin(field, config)` | Nested LEFT JOIN (Consumer pattern) |
| `endJoin()` | Close JOIN and return to QuerySpec |

## OrGroup\<T\>

Builder for OR conditions. Extends `ConditionBuilder<T>` with all condition methods.

| Method | Description |
|--------|-------------|
| `or(config)` | Nested OR group |
| `or()` | Open nested OR (manual close) |
| `join(field)` | JOIN inside OR (manual close) |
| `leftJoin(field)` | LEFT JOIN inside OR (manual close) |
| `join(field, config)` | JOIN inside OR (Consumer pattern) |
| `leftJoin(field, config)` | LEFT JOIN inside OR (Consumer pattern) |
| `endOr()` | Close OR group and return to QuerySpec |

## NotGroup\<T\>

Builder for NOT conditions. Extends `ConditionBuilder<T>` with all condition methods. Used inside `QuerySpec.not(config)`.

| Method | Description |
|--------|-------------|
| `join(field, config)` | INNER JOIN inside NOT (Consumer pattern) |
| `leftJoin(field, config)` | LEFT JOIN inside NOT (Consumer pattern) |

All condition methods are inherited: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `like`, `notLike`, `startsWith`, `endsWith`, `in`, `notIn`, `between`, `isNull`, `isNotNull`, etc.

## SubQuerySpec\<S\>

EXISTS/NOT EXISTS subquery builder with immediate predicate evaluation.

### Condition Methods

| Method | Description |
|--------|-------------|
| `eq`, `ne`, `eqStrict`, `neStrict`, `gt`, `ge`, `lt`, `le` | Comparison operators |
| `like`, `notLike`, `startsWith`, `endsWith`, `notStartsWith`, `notEndsWith` | String operators |
| `eqIgnoreCase`, `neIgnoreCase`, `likeIgnoreCase` | Case-insensitive string operators |
| `in`, `notIn` (varargs and Collection) | Collection operators |
| `between`, `notBetween` | Range operators |
| `isNull`, `isNotNull` | Null checks |
| `isEmpty`, `isNotEmpty` | Collection emptiness |
| `multiLike(keyword, fields...)` | Multi-field LIKE |

### Special Methods

| Method | Description |
|--------|-------------|
| `select(field)` | Custom SELECT clause (for IN subquery) |
| `correlated()` | Get correlated outer Root |
| `correlatedEq(outer, inner)` | Typed correlation predicate |
| `where(Function)` | Raw predicate `(Root) → Predicate` |

## UpdateSpec\<T\>

Bulk UPDATE operation builder. Extends `AbstractBulkOperationSpec`.

| Method | Description |
|--------|-------------|
| `set(field, value)` | SET clause |
| `set(condition, field, value)` | Conditional SET |
| `setAdd(field, amount)` | SET field = field + amount (atomic) |
| `setSubtract(field, amount)` | SET field = field - amount (atomic) |
| `withVersionIncrement(enabled)` | Enable optimistic lock version increment |
| `allowUnconditional(boolean)` | Allow unconditional UPDATE |
| `persistenceStrategy(strategy)` | Set persistence context strategy (v1.3.1+) |
| `execute(em)` | Execute in existing transaction (requires WHERE) |
| `executeInTransaction(em)` | Execute with transaction management |
| `executeLimited(em, limit)` | Execute with row limit (batched via ID subquery) |
| `executeLimited(em, limit, pessimisticLock)` | Execute with row limit and pessimistic lock |
| `updateAll(em)` | Unconditional update (requires `allowUnconditional(true)`) |
| `updateAllInTransaction(em)` | Unconditional update with transaction |
| `toUpdate(em)` | Build CriteriaUpdate without executing |
| `countBeforeExecute(em)` | Count affected rows before executing |

All condition methods are available: `eq`, `ne`, `eqStrict`, `neStrict`, `gt`, `ge`, `lt`, `le`, `like`, `notLike`, `startsWith`, `endsWith`, `notStartsWith`, `notEndsWith`, `eqIgnoreCase`, `neIgnoreCase`, `likeIgnoreCase`, `in`, `notIn`, `between`, `notBetween`, `isNull`, `isNotNull`, `isEmpty`, `isNotEmpty`, `multiLike`, `func`, `where`, `or`, `not`.

### Static Methods

| Method | Description |
|--------|-------------|
| `evictEntityCache(em, entityClass)` | Evict L1 cache for entity type (Hibernate SessionFactory or em.clear() fallback) |

Bulk DELETE operation builder. Extends `AbstractBulkOperationSpec`.

| Method | Description |
|--------|-------------|
| `execute(em)` | Execute in existing transaction (requires WHERE) |
| `executeInTransaction(em)` | Execute with transaction management |
| `executeLimited(em, limit)` | Execute with row limit (batched via ID subquery) |
| `executeLimited(em, limit, pessimisticLock)` | Execute with row limit and pessimistic lock |
| `executeAsSoftDelete(em, fieldName, deletedValue)` | Convert hard delete to soft delete |
| `allowUnconditional(boolean)` | Allow unconditional DELETE |
| `persistenceStrategy(strategy)` | Set persistence context strategy (v1.3.1+) |
| `deleteAll(em)` | Unconditional delete (requires `allowUnconditional(true)`) |
| `deleteAllInTransaction(em)` | Unconditional delete with transaction |
| `toDelete(em)` | Build CriteriaDelete without executing |
| `countBeforeExecute(em)` | Count affected rows before executing |

All condition methods are available (same as UpdateSpec).

## MergeSpec\<T\>

UPSERT operation builder. Supports PostgreSQL, MySQL, Oracle, SQL Server.

| Method | Description |
|--------|-------------|
| `MergeSpec(entityClass)` | Constructor |
| `getEntityClass()` | Get entity class |
| `withEntity(entity)` | Set entity to upsert |
| `onConflict(fields...)` | Specify conflict columns |
| `updateOnConflict(fields...)` | Columns to update on conflict |
| `dialect(strategy)` | Set custom dialect (override auto-detect) |
| `persistenceStrategy(strategy)` | Set persistence context strategy (`AUTO_CLEAR` / `DEFER_TO_CALLER`) |
| `execute(em)` | Execute in existing transaction |
| `executeWithCallbacks(em)` | Execute with JPA lifecycle callbacks |
| `executeInTransaction(em)` | Execute with transaction management |
| `executeBatch(entities, em)` | Batch UPSERT (auto multi-row when supported) |
| `executeBatch(entities, em, batchSize)` | Batch UPSERT with batch size |
| `executeBatchInTransaction(entities, em)` | Batch UPSERT with transaction |
| `executeBatchInSeparateTransactions(entities, em, batchSize)` | Per-batch isolated commit |

### PersistenceContextStrategy (v1.3.1+)

Strategy for managing the persistence context after bulk operations.

| Value | Description |
|-------|-------------|
| `AUTO_CLEAR` | Automatically flush and clear L1 cache after operation (default, backward compatible) |
| `DEFER_TO_CALLER` | Leave persistence context management to the caller |

Available on `UpdateSpec`, `DeleteSpec`, and `MergeSpec` via `persistenceStrategy()`.

## CteSpec

Common Table Expression builder.

| Method | Description |
|--------|-------------|
| `CteSpec.with(name)` | Non-recursive CTE |
| `CteSpec.withRecursive(name)` | Recursive CTE |
| `columns(columns...)` | Set CTE column names |
| `as(sql)` | Set CTE body SQL (unsafe) |
| `asSafe(sqlTemplate, params...)` | Parameterized CTE body (recommended) |
| `and(name)` | Add another CTE |
| `select(sql)` | Set main query |
| `setParameter(name, value)` | Set named parameter |
| `getResultList(em)` | Execute and return `List<Object[]>` |
| `getSingleResult(em)` | Execute and return `Optional<Object[]>` |
| `getResultStream(em, consumer)` | Stream results |
| `buildSql()` | Build SQL without executing |
| `isStrictMode()` | Returns true (always enforced) |

## QuerySpec Projection Methods

Projection queries are built on `QuerySpec` and executed via `MyJpaTemplate`.

| Method | Description |
|--------|-------------|
| `select(fields...)` | Add projection fields (varargs `SFunction`) |
| `selectAs(field, alias)` | Add projection field with custom column alias |
| `asDto(dtoClass)` | Set DTO class for constructor projection |
| `isProjectionMode()` | Returns true if select() fields are configured |

### QuerySpec Aggregate Helpers (static)

| Method | Description |
|--------|-------------|
| `QuerySpec.count()` | `COUNT(*)` aggregate expression |
| `QuerySpec.countDistinct()` | `COUNT(DISTINCT root)` aggregate expression |
| `QuerySpec.sum(field)` | `SUM(field)` aggregate expression |
| `QuerySpec.avg(field)` | `AVG(field)` aggregate expression |
| `QuerySpec.max(field)` | `MAX(field)` aggregate expression |
| `QuerySpec.min(field)` | `MIN(field)` aggregate expression |

### MyJpaTemplate Projection Methods

| Method | Description |
|--------|-------------|
| `find(entityClass, QuerySpec)` | Execute projection query — returns `List<Tuple>` or `List<Dto>` if `asDto()` set |
| `projectionPage(entityClass, QuerySpec, Pageable)` | Paginated projection — returns `Page<Tuple>` |

## MyJpaTemplate

Convenience template for common operations. Auto-configured Spring bean.

### Query Methods

| Method | Description |
|--------|-------------|
| `findById(class, id)` | Find entity by ID (soft-delete aware) |
| `findOne(class, spec)` | Find single entity |
| `findOne(class, consumer)` | Lambda convenience |
| `count(class, spec)` | Count entities |
| `count(class, consumer)` | Lambda convenience |
| `findAll(class, spec)` | Find all (limited by `maxResults`) |
| `findAll(class, spec, maxResults)` | Find with custom limit (-1 = unlimited) |
| `findAll(class, spec, sort)` | Find with sort |
| `findAll(class, spec, entityGraph)` | Find with EntityGraph |
| `findAll(class, spec, entityGraph, maxResults)` | Find with EntityGraph and limit |
| `findAll(class, spec, pageable)` | Paginated query |
| `findAll(class, consumer)` | Lambda convenience |
| `findAll(class, consumer, maxResults)` | Lambda + custom limit |
| `findAll(class, consumer, sort)` | Lambda + sort |
| `findAll(class, consumer, pageable)` | Lambda + paged |
| `findAllStream(class, spec, consumer)` | Managed stream (no memory limit) |
| `findAllStream(class, spec, entityGraph, consumer)` | Stream + EntityGraph |
| `findAllStream(class, consumer, consumer)` | Lambda stream |
| `find(class, spec)` | Find with raw Specification |
| `find(class, spec, maxResults)` | Find with raw Specification and limit |
| `findPage(class, spec, pageable)` | Paginated with raw Specification |
| `findSlice(class, spec, pageable)` | Slice (no count query) |
| `findAllById(class, ids)` | Batch by IDs (auto IN-clause splitting) |
| `findNotDeletedAllById(class, ids)` | IDs excluding soft-deleted |
| `findKeysetPage(class, spec, sort, pageSize, lastValues)` | Cursor-based pagination |
| `findAllCached(class, spec, ttlSeconds)` | Cached query |
| `findAllCached(class, consumer, ttlSeconds)` | Lambda cached |

### Mutation Methods

| Method | Description |
|--------|-------------|
| `update(class)` | Create UpdateSpec |
| `delete(class)` | Create DeleteSpec |
| `execute(UpdateSpec)` | Execute update in transaction |
| `execute(DeleteSpec)` | Execute delete in transaction |
| `execute(MergeSpec)` | Execute upsert in transaction |
| `executeBatch(UpdateSpec, batchSize)` | Batch update with flush/clear |
| `executeBatch(DeleteSpec, batchSize)` | Batch delete with flush/clear |
| `executeBatch(MergeSpec, entities, batchSize)` | Batch upsert |
| `executeWithMaxRows(UpdateSpec, maxRows)` | Update with row limit |
| `executeWithMaxRows(DeleteSpec, maxRows)` | Delete with row limit |
| `executeBatchInSeparateTransactions(UpdateSpec, batchSize)` | Update per-batch commit |
| `executeBatchInSeparateTransactions(DeleteSpec, batchSize)` | Delete per-batch commit |
| `executeBatchInSeparateTransactions(UpdateSpec, batchSize, strategy)` | With failure strategy |
| `executeBatchInSeparateTransactions(DeleteSpec, batchSize, strategy)` | With failure strategy |

### Batch Save Methods

| Method | Description |
|--------|-------------|
| `saveAllBatched(entities, batchSize)` | Merge-based batch save (upsert) |
| `saveAllBatchedPure(entities, batchSize)` | Persist-only batch save (insert only) |
| `saveAllBatchedInSeparateTransactions(entities, batchSize)` | Per-batch commit |

### Constants

| Constant | Default | Description |
|----------|---------|-------------|
| `DEFAULT_MAX_RESULTS` | `10000` | Default max rows for findAll/find |
| `DEFAULT_DEEP_PAGINATION_OFFSET_THRESHOLD` | `100000` | Offset threshold for deep pagination warning |
| `DEFAULT_DEEP_PAGINATION_OFFSET_LIMIT` | `1000000` | Hard limit for deep pagination |

### BatchResult Record

Returned by batch operations with separate transactions.

| Field | Type | Description |
|-------|------|-------------|
| `totalRows` | `int` | Total affected rows |
| `batchCount` | `int` | Number of batches executed |
| `success` | `boolean` | Whether all batches succeeded |
| `failedBatchIndex` | `int` | Index of failed batch (-1 if none) |
| `failureCause` | `Throwable` | Exception if batch failed (null if success) |

### BatchFailureStrategy Enum

| Value | Description |
|-------|-------------|
| `CONTINUE` | Continue processing remaining batches on failure |
| `ABORT` | Stop processing on first batch failure |

### BatchPartialCommitException

Thrown when a batch operation with `CONTINUE` strategy fails partway. Carries information about what was committed before the failure.

| Method | Description |
|--------|-------------|
| `getOperationName()` | Name of the operation (e.g., "UPDATE", "DELETE") |
| `getCommittedRows()` | Number of rows committed before failure |
| `getCompletedBatches()` | Number of batches completed before failure |

```java
try {
    template.executeBatchInSeparateTransactions(updateSpec, 500, BatchFailureStrategy.CONTINUE);
} catch (BatchPartialCommitException e) {
    log.warn("Partial commit: {} rows in {} batches succeeded",
        e.getCommittedRows(), e.getCompletedBatches());
}
```

## MyJpaRepository\<T, ID\>

Base repository interface. Extends `JpaRepository<T, ID>` and `JpaSpecificationExecutor<T>`.

### Query Methods (Lambda Convenience)

| Method | Description |
|--------|-------------|
| `findAll(Consumer<QuerySpec<T>>)` | Find all with lambda |
| `findAll(Consumer<QuerySpec<T>>, Pageable)` | Paged find with lambda |
| `findAll(Consumer<QuerySpec<T>>, Sort)` | Sorted find with lambda |
| `findOne(Consumer<QuerySpec<T>>)` | Find one with lambda |
| `count(Consumer<QuerySpec<T>>)` | Count with lambda |
| `exists(Consumer<QuerySpec<T>>)` | Exists with lambda |

### Query Methods (Specification)

| Method | Description |
|--------|-------------|
| `findAll(Specification<T>)` | Find all with Specification |
| `findAll(Specification<T>, Pageable)` | Paged find with Specification |
| `findAll(Specification<T>, Sort)` | Sorted find with Specification |
| `findOne(Specification<T>)` | Find one with Specification |
| `count(Specification<T>)` | Count with Specification |
| `exists(Specification<T>)` | Exists with Specification |

### Bulk Operation Methods (Lambda)

| Method | Description |
|--------|-------------|
| `update(Consumer<UpdateSpec<T>>)` | Batch update with lambda |
| `delete(Consumer<DeleteSpec<T>>)` | Batch delete with lambda |
| `merge(Consumer<MergeSpec<T>>)` | Batch upsert with lambda |

### Bulk Operation Methods (Execute)

| Method | Description |
|--------|-------------|
| `execute(UpdateSpec<T>)` | Execute pre-built update |
| `execute(DeleteSpec<T>)` | Execute pre-built delete |
| `execute(MergeSpec<T>)` | Execute pre-built merge |

### Soft Delete Methods

| Method | Description |
|--------|-------------|
| `findNotDeletedAll()` | All non-deleted entities |
| `findNotDeletedAll(spec)` | Non-deleted with conditions |
| `findNotDeletedAll(spec, pageable)` | Paginated non-deleted |
| `findNotDeletedOne(spec)` | Single non-deleted entity |
| `findNotDeletedById(id)` | Non-deleted by ID |
| `countNotDeleted()` | Count non-deleted |
| `countNotDeleted(spec)` | Count non-deleted with conditions |

### Static Utility

| Method | Description |
|--------|-------------|
| `withAutoFilterOverride(enable, runnable)` | Temporary override of soft-delete auto-filtering |
| `evictEntityCache(em, entityClass)` | Evict L1 cache for entity type |

## EntityGraphHelper\<T\>

JPA EntityGraph builder helper for eager loading strategies.

| Method | Description |
|--------|-------------|
| `forEntity(class)` | Create new instance |
| `add(path)` | Add attribute path (supports dot notation, e.g. `"roles.permissions"`) |
| `add(paths...)` | Add multiple paths |
| `nest(attribute)` | Chain nested path from last added path |
| `remove(path)` | Remove attribute path |
| `clear()` | Remove all paths |
| `loadGraph()` | Set LOAD graph mode |
| `fetchGraph()` | Set FETCH graph mode (default) |
| `buildGraph(em)` | Build JPA EntityGraph |
| `toHints(em)` | Convert to query hints Map |
| `apply(query, em)` | Apply to TypedQuery |

## SoftDeleteHelper

Soft delete utility class with cached Specifications.

| Method | Description |
|--------|-------------|
| `isNotDeleted(class)` | Specification for non-deleted entities (cached) |
| `isDeleted(class)` | Specification for deleted entities (cached) |
| `notDeletedQuery(class)` | New QuerySpec with soft delete filter |
| `findSoftDeleteField(class)` | Find `@SoftDelete` field name (cached) |
| `isSoftDeleted(class, entity)` | Check if entity instance is soft-deleted |
| `buildNotDeleted(cb, root, fieldName, entityClass)` | Build predicate (for JOIN scenarios) |
| `shutdown()` | Clear all caches |

## SoftDeleteBulkExecutor

Static utility for batch soft-delete operations.

| Method | Description |
|--------|-------------|
| `softDeleteAll(em, class, allowUnconditional)` | Soft-delete all with row protection |
| `softDeleteAll(em, class, allowUnconditional, maxRows)` | Soft-delete all with custom max rows |
| `softDeleteByIds(em, class, ids)` | Soft-delete by IDs (native SQL) |
| `softDeleteAllUsingCriteriaUpdate(em, class, allowUnconditional)` | Use CriteriaUpdate |
| `softDeleteAllUsingCriteriaUpdate(em, class, allowUnconditional, maxRows)` | Use CriteriaUpdate with max rows |
| `softDeleteByIdsUsingEntityManager(em, class, ids)` | Use EntityManager by IDs |
| `setEventPublisher(publisher)` | Set post-delete event publisher |

## SoftDeleteContext

Virtual thread compatible soft-delete context manager.

| Method | Description |
|--------|-------------|
| `isIgnoreSoftDelete()` | Check if soft-delete filtering is currently disabled |
| `withIgnore(Runnable)` | Execute Runnable with soft-delete filtering disabled |
| `withIgnore(Supplier<T>)` | Execute Supplier with soft-delete filtering disabled |
| `ignoreScope()` | Returns AutoCloseable for try-with-resources |
| `pushIgnore()` | Push ignore flag (legacy) |
| `popIgnore()` | Pop ignore flag (legacy) |
| `reset()` | Force reset all ignore flags |
| `captureAndResetForAsync()` | Capture state for async boundary (replaces deprecated `captureAndReset()`) |
| `restoreForAsync(state)` | Restore state in async task |
| `getIgnoreCount()` | Current ignore depth |
| `getMaxIgnoreCount()` | Maximum allowed ignore depth |

## @SoftDelete

Annotation to mark a field as the soft delete flag. Works with `boolean`, `Boolean`, `Integer`, `String`, and `Enum` types.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `deletedValue` | `String` | `""` | Enum constant name for "deleted" state |
| `deletedIntValue` | `int` | `1` | Integer value for "deleted" state |
| `deletedStringValue` | `String` | `"1"` | String value for "deleted" state |
| `deletedTimestampField` | `String` | `""` | Field name for auto-setting deletion timestamp |

- **boolean/Boolean**: `true` = deleted, `false`/`null` = not deleted
- **Integer**: value matching `deletedIntValue` = deleted, `null` = not deleted
- **String**: value matching `deletedStringValue` = deleted, `null` = not deleted
- **Enum**: value matching `deletedValue` = deleted, others = not deleted

## @IgnoreSoftDelete

Annotation to skip automatic soft-delete filtering on a method or type.

- **Target**: `METHOD`, `TYPE`
- **Retention**: `RUNTIME`

## @Encrypt

Marker annotation for AES-GCM field-level encryption. No attributes.

- **Target**: `FIELD`
- **Retention**: `RUNTIME`
- **Requires**: `EncryptConverter` (auto-configured)
- **Field type**: `String` only

## @Mask

Field masking annotation for JSON serialization.

| Attribute | Type | Description |
|-----------|------|-------------|
| `type` | `MaskType` | Masking strategy (required) |

### MaskType

| Value | Example Output |
|-------|---------------|
| `PHONE` | `138****1234` |
| `EMAIL` | `u***@example.com` |
| `ID_CARD` | `110***********1234` |
| `NAME` | `张*` |
| `BANK_CARD` | `6222***********1234` |
| `ADDRESS` | `北京市****` |
| `LICENSE_PLATE` | `京A****` |

## @RetryOnOptimisticLock

Method-level annotation for automatic retry on OptimisticLockException.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `maxRetries` | `int` | `3` | Maximum retry attempts |
| `backoffMs` | `long` | `100` | Initial backoff (exponential: backoffMs * 2^attempt) |

## @CodeEnum / @CodeEnumValue

Enum-to-column-code conversion for Hibernate 6.

- `@CodeEnum` -- marks an enum field for code-based storage
- `@CodeEnumValue` -- marks the field within the enum that holds the DB value

```java
public enum Gender {
    @CodeEnumValue
    MALE('M'),
    FEMALE('F');

    private final char code;
}

@Entity
public class User {
    @CodeEnum
    @Column(columnDefinition = "CHAR(1)")
    private Gender gender;
}
```

## Spec

Static utility for combining `Specification<T>` objects via boolean logic.

| Method | Description |
|--------|-------------|
| `Spec.all(specs...)` | AND-combine multiple Specifications |
| `Spec.any(specs...)` | OR-combine multiple Specifications |
| `Spec.not(spec)` | Negate a Specification |
| `Spec.always()` | Always-true (match all) |
| `Spec.never()` | Always-false (match none) |
| `Spec.when(condition, spec)` | Conditionally apply a Specification |

```java
Specification<User> active = (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE");
Specification<User> adult = (root, query, cb) -> cb.greaterThan(root.get("age"), 18);

// AND: both must match
Specification<User> combined = Spec.all(active, adult);

// OR: either matches
Specification<User> combined = Spec.any(active, adult);

// NOT: negation
Specification<User> combined = Spec.not(active);

// Conditional
Specification<User> combined = Spec.when(includeDeleted, Spec.always());
```

## FunctionWhitelist

Runtime-extensible whitelist for database function names used by `func()`. Functions must pass both the safe whitelist and (for boolean contexts) the boolean whitelist.

| Method | Description |
|--------|-------------|
| `addSafeFunctionNames(collection)` | Add safe function names at startup |
| `addBooleanFunctionNames(collection)` | Add boolean function names at startup |
| `freezeExtraFunctionNames()` | Freeze to immutable snapshot (auto-called after adds) |
| `containsSafeFunction(name)` | Check if function is in safe whitelist (checks frozen snapshot first, falls back to live collection) |
| `containsBooleanFunction(name)` | Check if function is in boolean whitelist (checks frozen snapshot first, falls back to live collection) |
| `reset()` | Clear all extensions (for testing) |
| `isWhitelistFrozen()` | Check if extra function names have been frozen |

```java
// Programmatic registration at startup
FunctionWhitelist.addSafeFunctionNames(List.of("MY_CUSTOM_FUNC", "JSONB_EXTRACT"));
FunctionWhitelist.addBooleanFunctionNames(List.of("MY_CUSTOM_CHECK"));

// Or via configuration (recommended)
// myjpa-plus.query.extra-safe-functions=MY_CUSTOM_FUNC,JSONB_EXTRACT
// myjpa-plus.query.extra-boolean-functions=MY_CUSTOM_CHECK
```

## PageableHelper

Pagination utility class.

| Method | Description |
|--------|-------------|
| `unsorted(page, size)` | PageRequest without sort (preserves QuerySpec ordering) |
| `merge(pageable, spec)` | Merge Pageable sort with QuerySpec sort (QuerySpec first) |
| `sorted(page, size, sort)` | PageRequest with explicit sort |
| `determineFetchSize(em)` | Get dialect-specific fetch size for streaming (PostgreSQL=100, MySQL=MIN_VALUE, others=0) |

## LambdaUtils

Lambda utility class. LRU cache (default 4096, configurable via `-Dmyjpa-plus.lambda-cache-size`).

| Method | Description |
|--------|-------------|
| `getPropertyName(function)` | Extract property name from method reference |

## InClauseBuilder

IN clause batching utility. Auto-splits large IN clauses for Oracle compatibility (max 1000 per batch, configurable via `-Dmyjpa-plus.in-clause-max-size`).

| Method | Description |
|--------|-------------|
| `in(cb, path, values...)` | IN with auto-batching |
| `in(cb, path, collection)` | IN with auto-batching |
| `notIn(cb, path, values...)` | NOT IN with auto-batching |
| `notIn(cb, path, collection)` | NOT IN with auto-batching |

## BaseEntity

`@MappedSuperclass` providing common audit fields with JPA lifecycle callbacks.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `Long` | Auto-generated ID (`@GeneratedValue(IDENTITY)`) |
| `createdAt` | `Instant` | Creation timestamp (auto-set on persist) |
| `updatedAt` | `Instant` | Update timestamp (auto-set on persist/update) |

## QueryCacheManager

Caffeine-based query result cache manager with TTL expiration. Implements `CacheAdapter`.

| Method | Description |
|--------|-------------|
| `get(key)` | Get cached value |
| `put(key, value, ttlSeconds)` | Cache value with TTL |
| `evict(key)` | Evict single entry |
| `evictByPrefix(prefix)` | Evict all entries with prefix |
| `clear()` | Clear all entries |
| `size()` | Current cache size |
| `getHitRate()` | Cache hit rate (0.0-1.0) |
| `getHitCount()` | Cache hit count |
| `getMissCount()` | Cache miss count |
| `resetStats()` | Reset cache statistics |
| `putAll(entries, defaultTtl)` | Batch put |
| `evictAll(keys)` | Batch evict |
| `close()` | Release resources |

## QueryAggregates

Static utility for aggregate expressions.

| Method | Description |
|--------|-------------|
| `count(root, cb)` | COUNT(*) expression |
| `count(root, field, cb)` | COUNT(field) expression |
| `countDistinct(root, field, cb)` | COUNT(DISTINCT field) expression |
| `sum(root, field, cb)` | SUM expression |
| `avg(root, field, cb)` | AVG expression |
| `max(root, field, cb)` | MAX expression |
| `min(root, field, cb)` | MIN expression |

## CacheAdapter

Pluggable cache SPI for query result caching.

| Method | Description |
|--------|-------------|
| `get(key)` | Get cached value |
| `put(key, value, ttlSeconds)` | Put value with TTL |
| `evict(key)` | Remove entry |
| `evictByPrefix(prefix)` | Remove by prefix |
| `clear()` | Clear all entries |
| `size()` | Entry count |
| `getHitRate()` | Hit rate (0.0-1.0) |
| `getHitCount()` | Hit count |
| `getMissCount()` | Miss count |
| `resetStats()` | Reset statistics |
| `putAll(entries, defaultTtl)` | Batch put |
| `evictAll(keys)` | Batch evict |
| `close()` | Release resources |
| `CacheAdapter.disabled()` | Static factory for no-op adapter |

## DeepPaginationGuard

| Method | Description |
|--------|-------------|
| `check(offset, threshold, hardLimit, lastWarnTime)` | Check pagination depth; warns or throws |

## KeysetPage\<T\>

| Method | Description |
|--------|-------------|
| `getContent()` | Page results |
| `hasNext()` | Whether more pages exist |
| `getLastSortValues()` | Cursor for next page |

## MyJpaPlusException

Base runtime exception for MyJpa-Plus. Constructors: `(String message)`, `(String message, Throwable cause)`.

## BulkOperationException

Exception thrown when a bulk operation fails. Extends `MyJpaPlusException`.

## QueryBuildException

Exception thrown when query construction fails. Extends `MyJpaPlusException`.

## SecurityViolationException

Exception thrown when a SQL injection or security check fails. Extends `MyJpaPlusException`.

## DialectStrategy

Interface for database-specific UPSERT SQL generation.

| Method | Description |
|--------|-------------|
| `name()` | Dialect identifier |
| `escapeIdentifier(String)` | Escape SQL identifier |
| `buildUpsertSql(...)` | Build single-row UPSERT SQL |
| `supportsBatchUpsert()` | Check multi-row UPSERT support |
| `buildBatchUpsertSql(...)` | Build multi-row UPSERT SQL |

### Built-in Implementations

| Class | Database |
|-------|----------|
| `PostgresDialect` | PostgreSQL |
| `MysqlDialect` | MySQL |
| `OracleDialect` | Oracle |
| `SqlServerDialect` | SQL Server |

### DialectDetector

| Method | Description |
|--------|-------------|
| `detectDialect(em)` | Auto-detect database dialect from EntityManager |
| `registerDialect(name, strategy)` | Register custom dialect |
| `getDialectStrategy(name)` | Get dialect by name |

## EncryptConverter

Transparent AES/GCM encryption converter. Key from `MYJPA_ENCRYPT_KEY` env var or `myjpa.encrypt.key` system property.

| Method | Description |
|--------|-------------|
| `convertToDatabaseColumn(String)` | Encrypt on write |
| `convertToEntityAttribute(String)` | Decrypt on read |
| `reEncrypt(String)` | Re-encrypt with current key (for key rotation) |
| `clearCaches()` | Clear key caches and cipher pool |
| `warmUpKeyCache()` | Async key warmup |
| `warmUpKeyCacheSync()` | Sync key warmup |
| `refreshKeyVersion()` | Force key version refresh |
| `registerTransactionCleanupIfNeeded()` | Auto-clean Cipher ThreadLocal on transaction completion |
| `validateKeyConfiguration()` | Validate key at startup |
| `setPbkdf2Iterations(int)` | Configure PBKDF2 iterations |
| `setSkipSaltCheck(boolean)` | Dev-mode salt skip |
| `shutdownWarmUpExecutor()` | Cleanup |

## QueryMetricsCollector

Singleton that collects query performance metrics (execution count, total/average/max time, slow query detection).

| Method | Description |
|--------|-------------|
| `getInstance()` | Get singleton instance |
| `setEnabled(boolean)` | Enable/disable metric collection |
| `isEnabled()` | Check if enabled |
| `setSlowQueryThresholdMs(long)` | Set slow query threshold (ms) |
| `recordQuery(name, durationNanos)` | Record a query execution |
| `getStats(name)` | Get stats for a query name |
| `getAllStats()` | Get all query stats |
| `getExecutionCount(name)` | Get execution count for a query |
| `reset()` | Reset all metrics |
| `reset(name)` | Reset metrics for a specific query |

### QueryStats (inner class)

| Method | Description |
|--------|-------------|
| `getExecutionCount()` | Number of executions |
| `getTotalTimeMs()` | Total execution time (ms) |
| `getAverageTimeMs()` | Average execution time (ms) |
| `getMaxTimeMs()` | Maximum execution time (ms) |

```java
QueryMetricsCollector metrics = QueryMetricsCollector.getInstance();
metrics.setSlowQueryThresholdMs(500);

// Record query
long start = System.nanoTime();
try {
    // execute query
} finally {
    metrics.recordQuery("findAll", System.nanoTime() - start);
}

// Get stats
QueryMetricsCollector.QueryStats stats = metrics.getStats("findAll");
```

## SlowQueryDataSourceProxy

DataSource proxy that wraps JDBC connections for slow query detection.

## SlowQueryListener

Callback interface for slow query events.

## EntityModifiedEvent

Spring event published to trigger cache invalidation when entities are modified. Use `ApplicationEventPublisher` to publish manually when cache auto-invalidation is not sufficient.

| Method | Description |
|--------|-------------|
| `EntityModifiedEvent(entityClass, affectedRows)` | Construct by entity class |
| `EntityModifiedEvent(entityName, affectedRows)` | Construct by entity name |
| `EntityModifiedEvent(entityClass, affectedRows, cause)` | Construct with failure cause |
| `getEntityName()` | Get entity name |
| `getAffectedRows()` | Get affected row count |

```java
@Autowired
private ApplicationEventPublisher publisher;

// Trigger cache invalidation after custom bulk operation
publisher.publishEvent(new EntityModifiedEvent(User.class, 500));
```

## SampledEvictionCache\<K, V\>

Caffeine-based bounded cache, used internally by `LambdaUtils` and available as a standalone cache.

| Method | Description |
|--------|-------------|
| `SampledEvictionCache(maxSize)` | Constructor with max size |
| `get(key)` | Get value by key |
| `computeIfAbsent(key, mappingFunction)` | Compute-if-absent |
| `put(key, value)` | Put key-value pair |
| `size()` | Current cache size (Caffeine estimated size) |
| `setMaxSize(maxSize)` | Dynamically adjust max capacity |
| `clear()` | Clear all entries |

## MaskSerializer

Jackson serializer for `@Mask` annotation. Provides both a Jackson module and a static utility method.

| Method | Description |
|--------|-------------|
| `MaskSerializer()` | Default constructor (uses `MaskType.NAME`) |
| `MaskSerializer(maskType)` | Constructor with specific mask type |
| `mask(value, maskType)` | Static masking utility (usable standalone) |

### MaskModule (inner class)

Jackson module that auto-discovers `@Mask` annotations. Register on your `ObjectMapper`:

```java
ObjectMapper mapper = new ObjectMapper();
mapper.registerModule(new MaskSerializer.MaskModule());
```

Or use `@Mask` annotation directly on entity fields — auto-configured with Spring Boot.

## EntityCodeGenerator

Static utility for generating entity and repository code from table definitions (experimental).

| Method | Description |
|--------|-------------|
| `generateEntity(tableName, columns, entityPackage)` | Generate entity class |
| `generateEntity(tableName, columns, entityPackage, template)` | Generate with custom template |
| `generateRepository(tableName, columns, entityPackage, repoPackage)` | Generate repository interface |
| `generateRepository(tableName, columns, entityPackage, repoPackage, template)` | Generate with custom template |
| `loadTemplateFromClasspath(classpathLocation)` | Load template from classpath |
| `loadTemplateFromFile(templatePath)` | Load template from file |
