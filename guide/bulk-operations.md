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

### Multi-Field Update

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .set(User::setUpdatedAt, Instant.now())
    .lt(User::getLastLoginAt, cutoffDate)
    .execute(entityManager);
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

### Update with OR Conditions

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .or(o -> o
        .eq(User::getStatus, "BANNED")
        .eq(User::getStatus, "SUSPENDED"))
    .execute(entityManager);
```

### Update with NOT Conditions

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .not(n -> n.eq(User::getRole, "ADMIN"))
    .execute(entityManager);
```

### Transaction Management

```java
// Auto-manage transaction
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .executeInTransaction(entityManager);
```

### Limited Update

```java
// Update at most 100 records
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "PROCESSED")
    .eq(User::getStatus, "PENDING")
    .executeLimited(entityManager, 100);
```

### Update All (Unconditional)

```java
// Warning: updates all records!
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .updateAll(entityManager);

// With transaction management
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .updateAllInTransaction(entityManager);
```

### Expression SET (Atomic Increment/Decrement)

Atomically increment or decrement numeric fields without reading the current value:

```java
// Increment login count by 1
int count = new UpdateSpec<>(User.class)
    .setAdd(User::getLoginCount, 1)
    .eq(User::getId, userId)
    .execute(entityManager);

// Decrement stock quantity by 5
int count = new UpdateSpec<>(Product.class)
    .setSubtract(Product::getStock, 5)
    .gt(Product::getStock, 5)
    .execute(entityManager);

// Combine with other SET operations
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ACTIVE")
    .setAdd(User::getLoginCount, 1)
    .set(User::setLastLoginAt, Instant.now())
    .eq(User::getId, userId)
    .execute(entityManager);
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

### Allow Unconditional Operations

Unconditional `updateAll()` and `deleteAll()` require explicit opt-in to prevent accidental mass updates:

```java
// Without allowUnconditional — throws IllegalStateException
new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .updateAll(em); // Error!

// With allowUnconditional — proceeds
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .allowUnconditional(true)
    .updateAll(em); // OK

// Same for delete
int count = new DeleteSpec<>(User.class)
    .allowUnconditional(true)
    .deleteAll(em);
```

### Count Before Execute

Preview how many rows will be affected before running the operation:

```java
UpdateSpec<User> spec = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "ACTIVE");

long estimated = spec.countBeforeExecute(entityManager);
System.out.println("Will update " + estimated + " rows");

if (estimated > 1000) {
    throw new RuntimeException("Too many rows to update");
}

int count = spec.execute(entityManager);
```

### Build CriteriaUpdate Without Executing

```java
CriteriaUpdate<User> cu = new UpdateSpec<>(User.class)
    .set(User::getStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .toUpdate(entityManager);
```

## DeleteSpec

### Basic Delete

```java
int count = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "DELETED")
    .execute(entityManager);
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

### Delete All (Unconditional)

```java
// Warning: deletes all records!
int count = new DeleteSpec<>(User.class)
    .deleteAll(entityManager);

// With transaction management
int count = new DeleteSpec<>(User.class)
    .deleteAllInTransaction(entityManager);
```

### Limited Delete

```java
int count = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "EXPIRED")
    .executeLimited(entityManager, 1000);
```

### Build CriteriaDelete Without Executing

```java
CriteriaDelete<User> cd = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "DELETED")
    .toDelete(entityManager);
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

// Batch update with size limit
int count = template.executeBatch(
    template.update(User.class)
        .set(User::setStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    100
);

// Batch delete with size limit
int count = template.executeBatch(
    template.delete(User.class)
        .eq(User::getStatus, "EXPIRED"),
    100
);
```

## Batch Operations with Separate Transactions

For large datasets, process in batches with independent transactions. If one batch fails, previous batches are already committed:

```java
// Batch update — each batch commits independently
MyJpaTemplate.BatchResult result = template.executeBatchInSeparateTransactions(
    template.update(User.class)
        .set(User::getStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    500  // batch size
);

if (!result.isSuccess()) {
    log.error("Failed at batch {}: {}", result.getFailedBatchIndex(), result.getFailureCause());
}
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
