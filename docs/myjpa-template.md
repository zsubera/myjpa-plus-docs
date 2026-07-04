---
sidebar_position: 1
title: MyJpaTemplate
---

# MyJpaTemplate

`MyJpaTemplate` is a convenience class that provides a simpler API for common operations.

## Configuration

MyJpaTemplate is auto-configured. Just inject it:

```java
@Autowired
private MyJpaTemplate template;
```

## Query Operations

### Lambda Convenience Methods

```java
// No need to create QuerySpec manually
List<User> users = template.findAll(User.class, s -> s.eq(User::getStatus, "ACTIVE"));
Optional<User> user = template.findOne(User.class, s -> s.eq(User::getId, 1L));
long count = template.count(User.class, s -> s.eq(User::getStatus, "ACTIVE"));
```

### Find by ID

```java
Optional<User> user = template.findById(User.class, userId);
```

Generated SQL:
```sql
SELECT * FROM users WHERE id = ?
```

### Find One

```java
Optional<User> user = template.findOne(User.class,
    new QuerySpec<User>().eq(User::getEmail, "john@example.com"));
```

Generated SQL:
```sql
SELECT * FROM users WHERE email = 'john@example.com' LIMIT 1
```

### Find All

```java
// Using QuerySpec
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"));
```

Generated SQL:
```sql
SELECT * FROM users WHERE status = 'ACTIVE' LIMIT 10000
```

```java
// Limit results
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"), 100);
```

Generated SQL:
```sql
SELECT * FROM users WHERE status = 'ACTIVE' LIMIT 100
```

```java
// With EntityGraph
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    EntityGraphHelper.forEntity(User.class).add("department"));
```

Generated SQL:
```sql
SELECT u.*, d.* FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE u.status = 'ACTIVE' LIMIT 10000
```

### Find with Raw Specification

```java
// Using raw Specification
List<User> users = template.find(User.class,
    (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"));
```

Generated SQL:
```sql
SELECT * FROM users WHERE status = 'ACTIVE' LIMIT 10000
```

### Streaming Results

For large result sets without memory limits:

```java
// Stream all results — stream lifecycle is managed internally
template.findAllStream(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    stream -> stream.forEach(user -> process(user)));
```

Generated SQL:
```sql
SELECT * FROM users WHERE status = 'ACTIVE'
```

### Pagination

```java
// Using Pageable with QuerySpec
Page<User> page = template.findAll(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    PageRequest.of(0, 20, Sort.by("name")));
```

Generated SQL:
```sql
-- Count query
SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'

-- Data query
SELECT * FROM users WHERE status = 'ACTIVE' ORDER BY name ASC LIMIT 20 OFFSET 0
```

```java
// Slice — no count query (faster, use when you only need hasNext)
Slice<User> slice = template.findSlice(User.class,
    (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"),
    PageRequest.of(0, 20));
```

Generated SQL:
```sql
SELECT * FROM users WHERE status = 'ACTIVE' LIMIT 21 OFFSET 0
```

### Batch by IDs

Automatically splits large ID lists into IN-clause batches:

```java
// Find by IDs (auto IN-clause splitting for Oracle compatibility)
List<User> users = template.findAllById(User.class, List.of(1L, 2L, 3L, 1000L));
```

Generated SQL:
```sql
SELECT * FROM users WHERE id IN (1, 2, 3, 1000)
```

```java
// Find non-deleted by IDs
List<User> users = template.findNotDeletedAllById(User.class, List.of(1L, 2L, 3L));
```

Generated SQL:
```sql
SELECT * FROM users WHERE id IN (1, 2, 3) AND deleted = false
```

## Update Operations

```java
int count = template.update(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .execute(em);

// Auto-manage transaction
int count = template.update(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .executeInTransaction(em);

// Batch update with size limit
int count = template.executeBatch(
    template.update(User.class)
        .set(User::getStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    100
);
```

## Delete Operations

```java
int count = template.delete(User.class)
    .eq(User::getStatus, "DELETED")
    .execute(em);

// Batch delete with size limit
int count = template.executeBatch(
    template.delete(User.class)
        .eq(User::getStatus, "EXPIRED"),
    100
);
```

## UPSERT Operations

```java
// Basic upsert via template
int count = template.execute(
    new MergeSpec<>(User.class)
        .withEntity(user)
        .onConflict(User::getEmail)
        .updateOnConflict(User::getName, User::getUpdatedAt)
);

// Batch upsert
int count = template.executeBatch(
    new MergeSpec<>(User.class)
        .onConflict(User::getEmail),
    users,
    100  // batch size
);
```

## Batch Operations with Separate Transactions

Process large datasets in batches with independent commits:

```java
// Update in batches — each batch commits independently
MyJpaTemplate.BatchResult result = template.executeBatchInSeparateTransactions(
    template.update(User.class)
        .set(User::getStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    500
);

if (!result.isSuccess()) {
    log.error("Failed at batch {}: {}", result.getFailedBatchIndex(), result.getFailureCause());
}
```

### Failure Strategy

```java
// CONTINUE — process remaining batches even if one fails
MyJpaTemplate.BatchResult result = template.executeBatchInSeparateTransactions(
    template.update(User.class)
        .set(User::getStatus, "DONE")
        .eq(User::getStatus, "PENDING"),
    500,
    MyJpaTemplate.BatchFailureStrategy.CONTINUE
);

// ABORT — stop on first failure
MyJpaTemplate.BatchResult result = template.executeBatchInSeparateTransactions(
    template.delete(LogEntry.class)
        .lt(LogEntry::getTimestamp, cutoffDate),
    500,
    MyJpaTemplate.BatchFailureStrategy.ABORT
);
```

### Row-Limited Operations

```java
// Update with max rows
int count = template.executeWithMaxRows(
    template.update(User.class)
        .set(User::getStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    1000
);

// Delete with max rows
int count = template.executeWithMaxRows(
    template.delete(LogEntry.class)
        .lt(LogEntry::getTimestamp, cutoffDate),
    5000
);
```

## Batch Save

```java
// Auto-detect new vs existing (persist vs merge)
template.saveAllBatched(users, 100);

// Pure persist (no merge, faster for known-new entities)
template.saveAllBatchedPure(users, 100);

// Per-batch commit (each batch in its own transaction)
template.saveAllBatchedInSeparateTransactions(users, 100);
```

## EntityGraph

```java
// Create EntityGraph helper
EntityGraphHelper<User> graph = EntityGraphHelper.forEntity(User.class)
    .add("department")
    .add("roles.permissions");

// Chain nested paths
EntityGraphHelper<User> graph = EntityGraphHelper.forEntity(User.class)
    .add("department")
    .nest("company");  // equivalent to add("department.company")

// Use in query
List<User> users = template.findAll(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"), graph);
```

## Keyset Pagination (Cursor-based)

For large datasets, keyset pagination is more efficient than offset-based:

```java
// First page
MyJpaTemplateOperations.KeysetPage<User> page = template.findKeysetPage(
    User.class,
    (root, cb, cq) -> cb.equal(root.get("status"), "ACTIVE"),
    Sort.by("id"),
    20,
    null  // no cursor for first page
);

// Next page -- use cursor from previous page
MyJpaTemplateOperations.KeysetPage<User> nextPage = template.findKeysetPage(
    User.class,
    (root, cb, cq) -> cb.equal(root.get("status"), "ACTIVE"),
    Sort.by("id"),
    20,
    page.getLastSortValues()  // cursor from previous page
);

List<User> users = nextPage.getContent();
boolean hasNext = nextPage.hasNext();
```

## Deep Pagination Guard

When using offset-based pagination with large offsets, `MyJpaTemplate` automatically:

1. **Warns** when offset exceeds `deep-pagination-offset-threshold` (default: 100,000)
2. **Throws** when offset exceeds `deep-pagination-offset-limit` (default: disabled)

```yaml
myjpa-plus:
  query:
    deep-pagination-offset-threshold: 100000  # warn threshold
    deep-pagination-offset-limit: 1000000     # hard limit (-1 = disabled)
```

## CacheAdapter

`MyJpaTemplate` uses `CacheAdapter` for query result caching:

```java
// Check cache stats
CacheAdapter cache = template.getCacheAdapter();
log.info("Cache hit rate: {}, size: {}", cache.getHitRate(), cache.size());

// Evict by prefix (e.g., after entity update)
cache.evictByPrefix("com.example.User:");

// Disable cache for specific template
template.setCacheAdapter(CacheAdapter.disabled());
```

## Constants

```java
// Default max results for findAll/find
MyJpaTemplate.DEFAULT_MAX_RESULTS  // 10000

// Deep pagination warning threshold
MyJpaTemplate.DEFAULT_DEEP_PAGINATION_OFFSET_THRESHOLD  // 100000
```

## Custom Configuration

```java
// MyJpaTemplate accepts custom max results and pagination threshold
MyJpaTemplate template = new MyJpaTemplate(5000, 50000);
```

