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

### Build CriteriaUpdate Without Executing

```java
CriteriaUpdate<User> cu = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
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

## Error Handling

```java
// Throws IllegalStateException if no conditions (prevents accidental bulk update/delete)
new UpdateSpec<>(User.class)
    .set(User::setStatus, "NEW")
    .execute(em);  // Throws exception!

// Unconditional operations require explicit call
new DeleteSpec<>(User.class)
    .deleteAll(em);  // OK - clear intent
```
