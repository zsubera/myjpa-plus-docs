---
sidebar_position: 1
title: Bulk Operations
---

# Bulk Operations

MyJpa-Plus provides `UpdateSpec` and `DeleteSpec` for type-safe bulk operations.

## UpdateSpec

### Basic Update

```java
// Update status of matching records
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getLastLoginAt, null)
    .execute(entityManager);
```

Generated SQL:
```sql
UPDATE users SET status = 'INACTIVE' WHERE last_login_at IS NULL
```

### Multi-Field Update

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .set(User::setUpdatedAt, Instant.now())
    .lt(User::getLastLoginAt, cutoffDate)
    .execute(entityManager);
```

Generated SQL:
```sql
UPDATE users SET status = 'ARCHIVED', updated_at = ? WHERE last_login_at < ?
```

### Conditional SET

Use the guarded variant to conditionally set fields:

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .set(name != null, User::setName, name)
    .eq(User::getStatus, "PENDING")
    .execute(entityManager);
```

Generated SQL (when `name = "Alice"`):
```sql
UPDATE users SET status = 'INACTIVE', name = 'Alice' WHERE status = 'PENDING'
```

Generated SQL (when `name = null`):
```sql
UPDATE users SET status = 'INACTIVE' WHERE status = 'PENDING'
```

### Update with OR Conditions

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .or(o -> o
        .eq(User::getStatus, "BANNED")
        .eq(User::getStatus, "SUSPENDED"))
    .execute(entityManager);
```

Generated SQL:
```sql
UPDATE users SET status = 'INACTIVE' WHERE status = 'BANNED' OR status = 'SUSPENDED'
```

### Update with NOT Conditions

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .not(n -> n.eq(User::getRole, "ADMIN"))
    .execute(entityManager);
```

Generated SQL:
```sql
UPDATE users SET status = 'INACTIVE' WHERE NOT (role = 'ADMIN')
```

### Transaction Management

```java
// Auto-manage transaction
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .executeInTransaction(entityManager);
```

Generated SQL:
```sql
UPDATE users SET status = 'INACTIVE' WHERE status = 'PENDING'
```

### Limited Update

```java
// Update at most 100 records
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "PROCESSED")
    .eq(User::getStatus, "PENDING")
    .executeLimited(entityManager, 100);
```

Generated SQL:
```sql
UPDATE users SET status = 'PROCESSED' WHERE status = 'PENDING' LIMIT 100
```

### Update All (Unconditional)

```java
// Warning: updates all records!
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .updateAll(entityManager);
```

Generated SQL:
```sql
UPDATE users SET status = 'ARCHIVED'
```

### Expression SET (Atomic Increment/Decrement)

Atomically increment or decrement numeric fields without reading the current value:

```java
// Increment login count by 1
int count = new UpdateSpec<>(User.class)
    .setAdd(User::getLoginCount, 1)
    .eq(User::getId, userId)
    .execute(entityManager);
```

Generated SQL:
```sql
UPDATE users SET login_count = login_count + 1 WHERE id = ?
```

```java
// Decrement stock quantity by 5
int count = new UpdateSpec<>(Product.class)
    .setSubtract(Product::getStock, 5)
    .gt(Product::getStock, 5)
    .execute(entityManager);
```

Generated SQL:
```sql
UPDATE products SET stock = stock - 5 WHERE stock > 5
```

```java
// Combine with other SET operations
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ACTIVE")
    .setAdd(User::getLoginCount, 1)
    .set(User::setLastLoginAt, Instant.now())
    .eq(User::getId, userId)
    .execute(entityManager);
```

Generated SQL:
```sql
UPDATE users SET status = 'ACTIVE', login_count = login_count + 1, last_login_at = ? WHERE id = ?
```

### Optimistic Lock Version Increment

Automatically increment the `@Version` field alongside your update:

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .withVersionIncrement(true)
    .eq(User::getId, userId)
    .execute(entityManager);
```

Generated SQL:
```sql
UPDATE users SET status = 'INACTIVE', version = version + 1 WHERE id = ? AND version = ?
```

### Allow Unconditional Operations

Unconditional `updateAll()` and `deleteAll()` require explicit opt-in to prevent accidental mass updates:

```java
// With allowUnconditional — proceeds
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .allowUnconditional(true)
    .updateAll(em);
```

Generated SQL:
```sql
UPDATE users SET status = 'ARCHIVED'
```

### Count Before Execute

Preview how many rows will be affected before running the operation:

```java
UpdateSpec<User> spec = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "ACTIVE");

long estimated = spec.countBeforeExecute(entityManager);
```

Count SQL:
```sql
SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'
```

### Build CriteriaUpdate Without Executing

```java
CriteriaUpdate<User> cu = new UpdateSpec<>(User.class)
    .set(User::getStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .toUpdate(entityManager);
```

Generated CriteriaUpdate:
```sql
UPDATE users SET status = 'INACTIVE' WHERE status = 'PENDING'
```

## DeleteSpec

### Basic Delete

```java
int count = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "DELETED")
    .execute(entityManager);
```

Generated SQL:
```sql
DELETE FROM users WHERE status = 'DELETED'
```

### Complex Condition Delete

```java
int count = new DeleteSpec<>(User.class)
    .lt(User::getCreatedAt, cutoffDate)
    .or(o -> o
        .eq(User::getStatus, "INACTIVE")
        .eq(User::getStatus, "BANNED"))
    .execute(entityManager);
```

Generated SQL:
```sql
DELETE FROM users WHERE created_at < ? AND (status = 'INACTIVE' OR status = 'BANNED')
```

### Delete All (Unconditional)

```java
// Warning: deletes all records!
int count = new DeleteSpec<>(User.class)
    .deleteAll(entityManager);
```

Generated SQL:
```sql
DELETE FROM users
```

### Limited Delete

```java
int count = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "EXPIRED")
    .executeLimited(entityManager, 1000);
```

Generated SQL:
```sql
DELETE FROM users WHERE status = 'EXPIRED' LIMIT 1000
```

### Build CriteriaDelete Without Executing

```java
CriteriaDelete<User> cd = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "DELETED")
    .toDelete(entityManager);
```

Generated CriteriaDelete:
```sql
DELETE FROM users WHERE status = 'DELETED'
```

## Using MyJpaTemplate

`MyJpaTemplate` provides a more convenient way:

```java
@Autowired
private MyJpaTemplate template;

// Update
int count = template.update(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .execute(em);

// Delete
int count = template.delete(User.class)
    .eq(User::getStatus, "DELETED")
    .execute(em);
```

Generated SQL:
```sql
-- Update
UPDATE users SET status = 'INACTIVE' WHERE status = 'PENDING'

-- Delete
DELETE FROM users WHERE status = 'DELETED'
```

## Batch Operations with Separate Transactions

For large datasets, process in batches with independent transactions:

```java
MyJpaTemplate.BatchResult result = template.executeBatchInSeparateTransactions(
    template.update(User.class)
        .set(User::getStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    500  // batch size
);
```

Each batch executes:
```sql
UPDATE users SET status = 'PROCESSED' WHERE status = 'PENDING' LIMIT 500
```

### Failure Strategy

Control whether processing continues or stops on batch failure:

```java
// CONTINUE — process remaining batches even if one fails (default)
template.executeBatchInSeparateTransactions(
    template.update(User.class)
        .set(User::getStatus, "DONE")
        .eq(User::getStatus, "PENDING"),
    500,
    MyJpaTemplate.BatchFailureStrategy.CONTINUE
);

// ABORT — stop on first failure
template.executeBatchInSeparateTransactions(
    template.delete(LogEntry.class)
        .lt(LogEntry::getTimestamp, cutoffDate),
    500,
    MyJpaTemplate.BatchFailureStrategy.ABORT
);
```

## Persistence Context Strategy

When executing bulk operations, the JPA persistence context (first-level cache) is automatically cleared after each write to prevent memory leaks. You can control this behavior:

| Strategy | Description |
|----------|-------------|
| `AUTO_CLEAR` (default) | Automatically clear persistence context after bulk writes |
| `DEFER_TO_CALLER` | Leave persistence context management to the caller |

```java
// Use DEFER_TO_CALLER when you need to execute multiple bulk operations
// within the same transaction without clearing the context between them
template.update(User.class)
    .set(User::getStatus, "INACTIVE")
    .lt(User::getLastLogin, cutoff)
    .persistenceStrategy(PersistenceContextStrategy.DEFER_TO_CALLER)
    .execute(em);

template.delete(LogEntry.class)
    .lt(LogEntry::getTimestamp, cutoff)
    .persistenceStrategy(PersistenceContextStrategy.DEFER_TO_CALLER)
    .execute(em);

// Manual clear when done
em.flush();
em.clear();
```

:::info
`persistenceStrategy()` is available on `UpdateSpec`, `DeleteSpec`, and `MergeSpec`.
:::

## Error Handling

```java
// Throws IllegalStateException if no conditions (prevents accidental bulk update/delete)
new UpdateSpec<>(User.class)
    .set(User::getStatus, "NEW")
    .execute(em);  // Throws exception!

// Unconditional operations require explicit call
new DeleteSpec<>(User.class)
    .deleteAll(em);  // OK - clear intent
```

