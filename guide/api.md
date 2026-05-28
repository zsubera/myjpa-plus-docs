# API Reference

## SFunction\<T, R\>

A serializable `Function<T, R>` for method references (e.g., `Entity::getField`). Enables runtime property name extraction via `SerializedLambda`.

## QuerySpec\<T\>

Core class for building type-safe queries. Implements `Specification<T>`.

### Condition Methods

| Method | Description | Example |
|--------|-------------|---------|
| `eq(field, value)` | Equals | `.eq(User::getStatus, "ACTIVE")` |
| `ne(field, value)` | Not equals | `.ne(User::getStatus, "DELETED")` |
| `gt(field, value)` | Greater than | `.gt(User::getAge, 18)` |
| `ge(field, value)` | Greater than or equal | `.ge(User::getAge, 18)` |
| `lt(field, value)` | Less than | `.lt(User::getAge, 65)` |
| `le(field, value)` | Less than or equal | `.le(User::getAge, 65)` |
| `between(field, start, end)` | Between (inclusive) | `.between(User::getAge, 18, 65)` |
| `notBetween(field, start, end)` | Not between | `.notBetween(User::getAge, 0, 17)` |
| `like(field, pattern)` | LIKE | `.like(User::getName, "%John%")` |
| `notLike(field, pattern)` | NOT LIKE | `.notLike(User::getName, "%test%")` |
| `startsWith(field, value)` | Starts with | `.startsWith(User::getName, "John")` |
| `endsWith(field, value)` | Ends with | `.endsWith(User::getName, "son")` |
| `contains(field, value)` | Contains | `.contains(User::getName, "oh")` |
| `eqIgnoreCase(field, value)` | Case-insensitive equals | `.eqIgnoreCase(User::getName, "john")` |
| `likeIgnoreCase(field, pattern)` | Case-insensitive LIKE | `.likeIgnoreCase(User::getName, "%john%")` |
| `rawLike(field, pattern)` | Raw LIKE (no escaping) | `.rawLike(User::getCode, "USER%")` |
| `in(field, values...)` | IN | `.in(User::getStatus, "A", "B")` |
| `in(field, collection)` | IN (Collection) | `.in(User::getStatus, List.of("A", "B"))` |
| `notIn(field, values...)` | NOT IN | `.notIn(User::getStatus, "C", "D")` |
| `notIn(field, collection)` | NOT IN (Collection) | `.notIn(User::getStatus, List.of("C", "D"))` |
| `isNull(field)` | IS NULL | `.isNull(User::getDeletedAt)` |
| `isNotNull(field)` | IS NOT NULL | `.isNotNull(User::getEmail)` |
| `isEmpty(field)` | IS EMPTY | `.isEmpty(User::getRoles)` |
| `isNotEmpty(field)` | IS NOT EMPTY | `.isNotEmpty(User::getRoles)` |
| `multiLike(keyword, fields...)` | Multi-field LIKE | `.multiLike("test", User::getName, User::getEmail)` |
| `where(predicate)` | Raw predicate | `.where((path, cb) -> ...)` |

### Conditional (Guarded) Methods

All condition methods have a `boolean condition` first-parameter variant:

```java
.eq(condition, field, value)
.ne(condition, field, value)
.gt(condition, field, value)
// ... etc
```

### Grouping Methods

| Method | Description |
|--------|-------------|
| `or(config)` | OR group (Consumer pattern) |
| `not(config)` | NOT group (Consumer pattern) |
| `join(field, config)` | INNER JOIN (Consumer pattern) |
| `leftJoin(field, config)` | LEFT JOIN (Consumer pattern) |
| `fetchJoin(field, config)` | FETCH JOIN (Consumer pattern) |
| `leftFetchJoin(field, config)` | LEFT FETCH JOIN (Consumer pattern) |
| `or()` | Open OR group (manual close) |
| `join(field)` | Open JOIN (manual close) |
| `leftJoin(field)` | Open LEFT JOIN (manual close) |
| `fetchJoin(field)` | Open FETCH JOIN (manual close) |
| `leftFetchJoin(field)` | Open LEFT FETCH JOIN (manual close) |

### Query Settings

| Method | Description |
|--------|-------------|
| `distinct()` | Enable DISTINCT |
| `groupBy(fields...)` | GROUP BY clause |
| `having(condition)` | HAVING clause |
| `orderByAsc(fields...)` | Order ascending |
| `orderByDesc(fields...)` | Order descending |
| `timeout(seconds)` | Query timeout |
| `lockMode(mode)` | Lock mode |
| `where(predicate)` | Raw predicate |

### Conversion Methods

| Method | Description |
|--------|-------------|
| `toSpecification()` | Convert to Specification |
| `toSpecification(external)` | AND-combine with external Specification |
| `and(other)` | AND-combine with another QuerySpec |
| `or(other)` | OR-combine with another QuerySpec |
| `then(other)` | Merge another QuerySpec's conditions |
| `getSort()` | Get Sort for Spring Data |
| `getQueryTimeout()` | Get timeout setting |
| `getLockMode()` | Get lock mode |
| `applyQuerySettings(query)` | Apply timeout/lock to TypedQuery |

## JoinGroup\<T, J\>

Builder for JOIN conditions. Extends `ConditionBuilder<J>`.

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

Builder for OR conditions. Extends `ConditionBuilder<T>`.

| Method | Description |
|--------|-------------|
| `or(config)` | Nested OR group |
| `or()` | Open nested OR (manual close) |
| `join(field)` | JOIN inside OR (manual close) |
| `leftJoin(field)` | LEFT JOIN inside OR (manual close) |
| `join(field, config)` | JOIN inside OR (Consumer pattern) |
| `leftJoin(field, config)` | LEFT JOIN inside OR (Consumer pattern) |
| `endOr()` | Close OR group and return to QuerySpec |

## SubQuerySpec\<S\>

EXISTS/NOT EXISTS subquery builder.

| Method | Description |
|--------|-------------|
| `correlated()` | Get correlated outer Root |
| `correlatedEq(outer, inner)` | Typed correlation predicate |
| `select(field)` | Custom SELECT clause |
| `where(predicate)` | Raw predicate |

All QuerySpec condition methods are also available.

## UpdateSpec\<T\>

Bulk UPDATE operation builder.

| Method | Description |
|--------|-------------|
| `set(field, value)` | SET clause |
| `set(condition, field, value)` | Conditional SET |
| `execute(em)` | Execute in existing transaction |
| `executeInTransaction(em)` | Execute with transaction management |
| `executeLimited(em, limit)` | Execute with row limit |
| `updateAll(em)` | Unconditional update |
| `updateAllInTransaction(em)` | Unconditional update with transaction |
| `toUpdate(em)` | Build CriteriaUpdate without executing |

All condition methods from `ConditionBuilder` are available (eq, ne, gt, etc.).

## DeleteSpec\<T\>

Bulk DELETE operation builder.

| Method | Description |
|--------|-------------|
| `execute(em)` | Execute in existing transaction |
| `executeInTransaction(em)` | Execute with transaction management |
| `executeLimited(em, limit)` | Execute with row limit |
| `deleteAll(em)` | Unconditional delete |
| `deleteAllInTransaction(em)` | Unconditional delete with transaction |
| `toDelete(em)` | Build CriteriaDelete without executing |

All condition methods from `ConditionBuilder` are available (eq, ne, gt, etc.).

## ProjectionSpec\<T\>

DTO projection query builder.

| Method | Description |
|--------|-------------|
| `select(field)` | Add field to SELECT |
| `asDto(class)` | Specify DTO class for constructor projection |
| `join(field, config)` | INNER JOIN with conditions |
| `leftJoin(field, config)` | LEFT JOIN with conditions |
| `orderByAsc(field)` | Order ascending |
| `orderByDesc(field)` | Order descending |
| `where(config)` | Add WHERE conditions |
| `conditions()` | Access underlying QuerySpec |
| `toTupleQuery(em)` | Build Tuple query |
| `toDtoQuery(em)` | Build DTO constructor query |
| `findPage(em, pageable)` | Paginated Tuple query |

## MyJpaTemplate

Convenience template for common operations.

| Method | Description |
|--------|-------------|
| `findAll(class, spec)` | Find all |
| `findAll(class, spec, maxResults)` | Find with limit |
| `findAll(class, spec, entityGraph)` | Find with EntityGraph |
| `findAll(class, spec, entityGraph, maxResults)` | Find with EntityGraph and limit |
| `findAll(class, spec, pageable)` | Paginated query |
| `findAllStream(class, spec)` | Streaming results |
| `findAllStream(class, spec, entityGraph)` | Streaming with EntityGraph |
| `find(class, Specification)` | Find with raw Specification |
| `find(class, Specification, maxResults)` | Find with raw Specification and limit |
| `findPage(class, Specification, pageable)` | Paginated with raw Specification |
| `update(class)` | Create UpdateSpec |
| `delete(class)` | Create DeleteSpec |
| `execute(UpdateSpec)` | Execute update in transaction |
| `execute(DeleteSpec)` | Execute delete in transaction |
| `executeBatch(UpdateSpec, batchSize)` | Batch update |
| `executeBatch(DeleteSpec, batchSize)` | Batch delete |

## MyJpaRepository\<T, ID\>

Base repository interface. Extends `JpaRepository<T, ID>` and `JpaSpecificationExecutor<T>`.

| Method | Description |
|--------|-------------|
| `findNotDeletedAll()` | All non-deleted entities |
| `findNotDeletedAll(spec)` | Non-deleted with conditions |
| `findNotDeletedAll(spec, pageable)` | Paginated non-deleted |
| `findNotDeletedOne(spec)` | Single non-deleted entity |
| `findNotDeletedById(id)` | Non-deleted by ID |
| `countNotDeleted()` | Count non-deleted |
| `countNotDeleted(spec)` | Count non-deleted with conditions |

## EntityGraphHelper\<T\>

JPA EntityGraph builder helper.

| Method | Description |
|--------|-------------|
| `forEntity(class)` | Create new instance |
| `add(path)` | Add attribute path (supports dot notation) |
| `add(paths...)` | Add multiple paths |
| `loadGraph()` | Set LOAD graph mode |
| `fetchGraph()` | Set FETCH graph mode (default) |
| `buildGraph(em)` | Build EntityGraph |
| `toHints(em)` | Convert to query hints |
| `apply(query, em)` | Apply to TypedQuery |

## SoftDeleteHelper

Soft delete utility class.

| Method | Description |
|--------|-------------|
| `isNotDeleted(class)` | Specification for non-deleted entities |
| `isDeleted(class)` | Specification for deleted entities |
| `notDeletedQuery(class)` | QuerySpec with soft delete filter |
| `findSoftDeleteField(class)` | Find @SoftDelete field name |
| `isSoftDeleted(class, entity)` | Check if entity is soft-deleted |

## PageableHelper

Pagination utility class.

| Method | Description |
|--------|-------------|
| `unsorted(page, size)` | PageRequest without sort |
| `merge(pageable, spec)` | Merge Pageable sort with QuerySpec sort |
| `sorted(page, size, sort)` | PageRequest with explicit sort |

## LambdaUtils

Lambda utility class.

| Method | Description |
|--------|-------------|
| `getPropertyName(function)` | Extract property name from method reference |

## InClauseBuilder

IN clause batching utility (Oracle-compatible, max 1000 per batch).

| Method | Description |
|--------|-------------|
| `in(cb, path, values...)` | IN with auto-batching |
| `in(cb, path, collection)` | IN with auto-batching |
| `notIn(cb, path, values...)` | NOT IN with auto-batching |
| `notIn(cb, path, collection)` | NOT IN with auto-batching |

## BaseEntity

`@MappedSuperclass` providing common audit fields.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `Long` | Auto-generated ID |
| `createdAt` | `Instant` | Creation timestamp (auto-set) |
| `updatedAt` | `Instant` | Update timestamp (auto-set) |

## @SoftDelete

Annotation to mark a boolean field as the soft delete flag.

- `true` = deleted
- `false` / `null` = not deleted

## MyJpaPlusException

Base runtime exception for MyJpa-Plus.
