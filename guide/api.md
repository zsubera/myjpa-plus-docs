# API Reference

## SFunction\<T, R\>

A serializable `Function<T, R>` for method references (e.g., `Entity::getField`). Enables runtime property name extraction via `SerializedLambda`.

## QuerySpec\<T\>

Core class for building type-safe queries. Implements `Specification<T>`.

### Condition Methods

| Method | Description | Example |
|--------|-------------|---------|
| `eq(field, value)` | Equals; null value → IS NULL | `.eq(User::getStatus, "ACTIVE")` |
| `ne(field, value)` | Not equals; null value → IS NOT NULL | `.ne(User::getStatus, "DELETED")` |
| `gt(field, value)` | Greater than | `.gt(User::getAge, 18)` |
| `ge(field, value)` | Greater than or equal | `.ge(User::getAge, 18)` |
| `lt(field, value)` | Less than | `.lt(User::getAge, 65)` |
| `le(field, value)` | Less than or equal | `.le(User::getAge, 65)` |
| `between(field, start, end)` | Between (inclusive) | `.between(User::getAge, 18, 65)` |
| `notBetween(field, start, end)` | Not between | `.notBetween(User::getAge, 0, 17)` |
| `like(field, pattern)` | LIKE (caller provides wildcards) | `.like(User::getName, "%John%")` |
| `notLike(field, pattern)` | NOT LIKE | `.notLike(User::getName, "%test%")` |
| `startsWith(field, value)` | LIKE `value%` with auto-escape | `.startsWith(User::getName, "John")` |
| `endsWith(field, value)` | LIKE `%value` with auto-escape | `.endsWith(User::getName, "son")` |
| `contains(field, value)` | LIKE `%value%` with auto-escape | `.contains(User::getName, "oh")` |
| `rawLike(field, pattern)` | LIKE `%pattern%` with auto-escape and wrap | `.rawLike(User::getName, "oh")` |
| `eqIgnoreCase(field, value)` | UPPER equals; null → IS NULL | `.eqIgnoreCase(User::getName, "john")` |
| `likeIgnoreCase(field, pattern)` | UPPER LIKE | `.likeIgnoreCase(User::getName, "%john%")` |
| `in(field, values...)` | IN | `.in(User::getStatus, "A", "B")` |
| `in(field, collection)` | IN (Collection) | `.in(User::getStatus, List.of("A", "B"))` |
| `notIn(field, values...)` | NOT IN | `.notIn(User::getStatus, "C", "D")` |
| `notIn(field, collection)` | NOT IN (Collection) | `.notIn(User::getStatus, List.of("C", "D"))` |
| `isNull(field)` | IS NULL | `.isNull(User::getDeletedAt)` |
| `isNotNull(field)` | IS NOT NULL | `.isNotNull(User::getEmail)` |
| `isEmpty(field)` | IS EMPTY (collection) | `.isEmpty(User::getRoles)` |
| `isNotEmpty(field)` | IS NOT EMPTY (collection) | `.isNotEmpty(User::getRoles)` |
| `multiLike(keyword, fields...)` | Multi-field OR LIKE | `.multiLike("test", User::getName, User::getEmail)` |
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

### Query Settings

| Method | Description |
|--------|-------------|
| `distinct()` | Enable DISTINCT |
| `groupBy(fields...)` | GROUP BY clause |
| `having(BiFunction)` | HAVING clause `(Path, CB) → Predicate` |
| `having(Function)` | HAVING clause `(Path) → Predicate` |
| `orderByAsc(fields...)` | Order ascending |
| `orderByDesc(fields...)` | Order descending |
| `timeout(seconds)` | Query timeout |
| `lockMode(mode)` | Pessimistic lock mode |

### Conversion Methods

| Method | Description |
|--------|-------------|
| `toSpecification()` | Convert to Specification |
| `toSpecification(external)` | AND-combine with external Specification |
| `and(other)` | AND-combine with another QuerySpec → Specification |
| `or(other)` | OR-combine with another QuerySpec → Specification |
| `then(other)` | Merge another QuerySpec's conditions into this |
| `getSort()` | Expose ordering as Spring Data Sort |
| `getQueryTimeout()` | Get timeout (null if unset) |
| `getLockMode()` | Get lock mode (null if unset) |
| `applyQuerySettings(query)` | Apply timeout/lock to TypedQuery |

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

## SubQuerySpec\<S\>

EXISTS/NOT EXISTS subquery builder with immediate predicate evaluation.

### Condition Methods

| Method | Description |
|--------|-------------|
| `eq`, `ne`, `gt`, `ge`, `lt`, `le` | Comparison operators |
| `like`, `notLike`, `startsWith`, `endsWith`, `contains` | String operators |
| `eqIgnoreCase`, `likeIgnoreCase` | Case-insensitive string operators |
| `in`, `notIn` (varargs and Collection) | Collection operators |
| `between`, `notBetween` | Range operators |
| `isNull`, `isNotNull` | Null checks |
| `isEmpty`, `isNotEmpty` | Collection emptiness |
| `multiLike(keyword, fields...)` | Multi-field LIKE |

### Special Methods

| Method | Description |
|--------|-------------|
| `correlated()` | Get correlated outer Root |
| `correlatedEq(outer, inner)` | Typed correlation predicate |
| `select(field)` | Custom SELECT clause |
| `where(Function)` | Raw predicate `(Root) → Predicate` |

## UpdateSpec\<T\>

Bulk UPDATE operation builder. Extends `AbstractBulkOperationSpec`.

| Method | Description |
|--------|-------------|
| `set(field, value)` | SET clause |
| `set(condition, field, value)` | Conditional SET |
| `execute(em)` | Execute in existing transaction (requires WHERE) |
| `executeInTransaction(em)` | Execute with transaction management |
| `executeLimited(em, limit)` | Execute with row limit (batched via ID subquery) |
| `updateAll(em)` | Unconditional update |
| `updateAllInTransaction(em)` | Unconditional update with transaction |
| `toUpdate(em)` | Build CriteriaUpdate without executing |

All condition methods are available: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `like`, `notLike`, `startsWith`, `endsWith`, `contains`, `eqIgnoreCase`, `likeIgnoreCase`, `in`, `notIn`, `between`, `notBetween`, `isNull`, `isNotNull`, `where`, `or`, `not`.

## DeleteSpec\<T\>

Bulk DELETE operation builder. Extends `AbstractBulkOperationSpec`.

| Method | Description |
|--------|-------------|
| `execute(em)` | Execute in existing transaction (requires WHERE) |
| `executeInTransaction(em)` | Execute with transaction management |
| `executeLimited(em, limit)` | Execute with row limit (batched via ID subquery) |
| `deleteAll(em)` | Unconditional delete |
| `deleteAllInTransaction(em)` | Unconditional delete with transaction |
| `toDelete(em)` | Build CriteriaDelete without executing |

All condition methods are available (same as UpdateSpec).

## ProjectionSpec\<T\>

DTO projection query builder supporting Tuple and constructor-based DTO projection.

| Method | Description |
|--------|-------------|
| `select(field)` | Add field to SELECT |
| `asDto(class)` | Specify DTO class for constructor projection |
| `join(field, config)` | INNER JOIN with conditions |
| `leftJoin(field, config)` | LEFT JOIN with conditions |
| `orderByAsc(field)` | Order ascending |
| `orderByDesc(field)` | Order descending |
| `where(config)` | Add WHERE conditions via `Consumer<QuerySpec<T>>` |
| `conditions()` | Access underlying QuerySpec directly |
| `toTupleQuery(em)` | Build Tuple query |
| `toDtoQuery(em)` | Build DTO constructor query (requires `asDto()`) |
| `findPage(em, pageable)` | Paginated Tuple query |

### ProjectionSpec.JoinGroup\<E\>

Inner JOIN condition builder for projections. Supports: `eq`, `ne`, `like`, `gt`, `lt`, `isNull`, `isNotNull`.

## MyJpaTemplate

Convenience template for common operations. Auto-configured Spring bean.

### Query Methods

| Method | Description |
|--------|-------------|
| `findById(class, id)` | Find entity by ID |
| `findOne(class, QuerySpec)` | Find single entity |
| `findAll(class, spec)` | Find all (limited by `maxResults`) |
| `findAll(class, spec, maxResults)` | Find with custom limit |
| `findAll(class, spec, entityGraph)` | Find with EntityGraph |
| `findAll(class, spec, entityGraph, maxResults)` | Find with EntityGraph and limit |
| `findAll(class, spec, pageable)` | Paginated query |
| `findAllStream(class, spec)` | Streaming results (no memory limit) |
| `findAllStream(class, spec, entityGraph)` | Streaming with EntityGraph |
| `find(class, Specification)` | Find with raw Specification |
| `find(class, Specification, maxResults)` | Find with raw Specification and limit |
| `findPage(class, Specification, pageable)` | Paginated with raw Specification |

### Mutation Methods

| Method | Description |
|--------|-------------|
| `update(class)` | Create UpdateSpec |
| `delete(class)` | Create DeleteSpec |
| `execute(UpdateSpec)` | Execute update in transaction |
| `execute(DeleteSpec)` | Execute delete in transaction |
| `executeBatch(UpdateSpec, batchSize)` | Batch update with flush/clear |
| `executeBatch(DeleteSpec, batchSize)` | Batch delete with flush/clear |

### Constants

| Constant | Default | Description |
|----------|---------|-------------|
| `DEFAULT_MAX_RESULTS` | `10000` | Default max rows for findAll/find |
| `DEFAULT_DEEP_PAGINATION_OFFSET_THRESHOLD` | `100000` | Offset threshold for deep pagination warning |

## MyJpaRepository\<T, ID\>

Base repository interface. Extends `JpaRepository<T, ID>` and `JpaSpecificationExecutor<T>`.

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

## EntityGraphHelper\<T\>

JPA EntityGraph builder helper for eager loading strategies.

| Method | Description |
|--------|-------------|
| `forEntity(class)` | Create new instance |
| `add(path)` | Add attribute path (supports dot notation, e.g. `"roles.permissions"`) |
| `add(paths...)` | Add multiple paths |
| `nest(attribute)` | Chain nested path from last added path |
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

## @SoftDelete

Annotation to mark a field as the soft delete flag. Works with `boolean`, `Boolean`, and `Enum` types.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `deletedValue` | `String` | `""` | Enum constant name for "deleted" state |

- **boolean/Boolean**: `true` = deleted, `false`/`null` = not deleted
- **Enum**: value matching `deletedValue` = deleted, others = not deleted

## @IgnoreSoftDelete

Annotation to skip automatic soft-delete filtering on a method or type.

- **Target**: `METHOD`, `TYPE`
- **Retention**: `RUNTIME`

## PageableHelper

Pagination utility class.

| Method | Description |
|--------|-------------|
| `unsorted(page, size)` | PageRequest without sort (preserves QuerySpec ordering) |
| `merge(pageable, spec)` | Merge Pageable sort with QuerySpec sort (QuerySpec first) |
| `sorted(page, size, sort)` | PageRequest with explicit sort |

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

## MyJpaPlusException

Base runtime exception for MyJpa-Plus. Constructors: `(String message)`, `(String message, Throwable cause)`.
