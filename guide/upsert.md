# UPSERT / MergeSpec

`MergeSpec` provides type-safe UPSERT (INSERT ... ON CONFLICT UPDATE) operations, automatically detecting the database dialect and generating corresponding SQL.

## Basic Usage

```java
@Autowired
private EntityManager em;

// Basic UPSERT (update all non-conflict columns on conflict)
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .execute(em);
```

Generated SQL:
```sql
-- PostgreSQL
INSERT INTO users (name, email, status) VALUES (?, ?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status

-- MySQL
INSERT INTO users (name, email, status) VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status)
```

## Conflict Column Specification

### Single Unique Key

```java
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .execute(em);
```

Generated SQL (PostgreSQL):
```sql
INSERT INTO users (name, email, age) VALUES (?, ?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age, status = EXCLUDED.status
```

Generated SQL (MySQL):
```sql
INSERT INTO users (name, email, age, status) VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE name = VALUES(name), age = VALUES(age), status = VALUES(status)
```

### Composite Unique Key

```java
int affected = new MergeSpec<>(Order.class)
    .withEntity(order)
    .onConflict(Order::getOrderNo, Order::getTenantId)
    .execute(em);
```

Generated SQL (PostgreSQL):
```sql
INSERT INTO orders (order_no, tenant_id, amount) VALUES (?, ?, ?)
ON CONFLICT (order_no, tenant_id) DO UPDATE SET amount = EXCLUDED.amount
```

### String Field Names (Dynamic Scenarios)

```java
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict("email", "tenant_id")
    .execute(em);
```

Generated SQL (PostgreSQL):
```sql
INSERT INTO users (name, email, tenant_id) VALUES (?, ?, ?)
ON CONFLICT (email, tenant_id) DO UPDATE SET name = EXCLUDED.name
```

## Selective Update

Only update specified columns, leave others unchanged:

```java
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .updateOnConflict(User::getName, User::getAge)
    .execute(em);
```

Generated SQL:
```sql
INSERT INTO users (name, email, age) VALUES (?, ?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age
```

## Transaction Management

### Auto Transaction (Recommended)

```java
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .executeInTransaction(em);
```

Generated SQL (same as basic UPSERT):
```sql
INSERT INTO users (name, email, age) VALUES (?, ?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age
```

If no active transaction exists, a new one is created automatically.

### Manual Transaction

```java
EntityTransaction tx = em.getTransaction();
tx.begin();
try {
    int affected = new MergeSpec<>(User.class)
        .withEntity(user)
        .onConflict(User::getEmail)
        .execute(em);
    tx.commit();
} catch (Exception e) {
    tx.rollback();
    throw e;
}
```

## Batch UPSERT

### Basic Batch

```java
List<User> users = List.of(user1, user2, user3);

int total = new MergeSpec<>(User.class)
    .onConflict(User::getEmail)
    .executeBatch(users, em, 100);  // 100 per batch
```

Generated SQL (PostgreSQL, multi-row):
```sql
INSERT INTO users (name, email, age) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age
```

### Batch with Transaction

```java
int total = new MergeSpec<>(User.class)
    .onConflict(User::getEmail)
    .executeBatchInTransaction(users, em);
```

Generated SQL (same multi-row format as above)

### Batch with Separate Transactions

Each batch commits independently — if one batch fails, previous batches are already committed:

```java
int total = new MergeSpec<>(User.class)
    .onConflict(User::getEmail)
    .executeBatchInSeparateTransactions(users, em, 500);
```

## executeWithCallbacks

Triggers JPA lifecycle callbacks (e.g., `@PrePersist`, `@PostPersist`) before executing the UPSERT:

```java
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .executeWithCallbacks(em);
```

This first merges the entity into the persistence context (triggering callbacks), flushes, then executes the native UPSERT.

## Multi-Row Batch UPSERT

`executeBatch()` automatically uses multi-row INSERT syntax when the dialect supports it:

```java
// PostgreSQL/MySQL: INSERT INTO ... VALUES (...), (...) ON CONFLICT ...
int total = new MergeSpec<>(User.class)
    .onConflict(User::getEmail)
    .executeBatch(users, em, 100);

// Check if current dialect supports batch UPSERT
boolean supported = new MergeSpec<>(User.class).supportsBatchUpsert(em);
```

## Database Dialects

### PostgreSQL

```sql
INSERT INTO users (name, email) VALUES (?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
```

### MySQL

```sql
INSERT INTO users (name, email) VALUES (?, ?)
ON DUPLICATE KEY UPDATE name = VALUES(name)
```

### Oracle

```sql
MERGE INTO users tgt
USING (SELECT ? AS email, ? AS name, ? AS status FROM dual) src
ON (tgt.email = src.email)
WHEN MATCHED THEN UPDATE SET tgt.name = src.name, tgt.status = src.status
WHEN NOT MATCHED THEN INSERT (email, name, status) VALUES (src.email, src.name, src.status)
```

### SQL Server

```sql
MERGE INTO users AS tgt
USING (SELECT ? AS email, ? AS name, ? AS status) AS src
ON (tgt.email = src.email)
WHEN MATCHED THEN UPDATE SET tgt.name = src.name, tgt.status = src.status
WHEN NOT MATCHED THEN INSERT (email, name, status) VALUES (src.email, src.name, src.status);
```

## Custom Dialect

### Override Dialect Per Operation

```java
// Use a specific dialect instead of auto-detection
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .dialect(new PostgresDialect())
    .execute(em);
```

Generated SQL (PostgreSQL):
```sql
INSERT INTO users (name, email, age) VALUES (?, ?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age
```

### Register a Custom Dialect at Startup

```java
@Configuration
public class DialectConfig {
    @PostConstruct
    public void registerDialect() {
        DialectDetector.registerDialect(new MyCustomDialect());
    }
}
```

Remove a dialect at runtime:

```java
DialectDetector.removeDialect(MyCustomDialect.class);
```

## Concurrency Safety

UPSERT has race conditions under high concurrency. Recommendations:

1. Use database unique constraints to protect conflict keys
2. Use pessimistic locks before UPSERT
3. Use distributed locks at the application layer
4. Catch unique constraint exceptions and retry

### @RetryOnOptimisticLock

Use the `@RetryOnOptimisticLock` annotation for automatic retry with exponential backoff on `OptimisticLockException`:

```java
@RetryOnOptimisticLock(maxRetries = 3, backoffMs = 100)
public void upsertUser(User user) {
    new MergeSpec<>(User.class)
        .withEntity(user)
        .onConflict(User::getEmail)
        .executeInTransaction(em);
}
```

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `maxRetries` | `int` | `3` | Maximum retry attempts |
| `backoffMs` | `long` | `100` | Initial backoff in ms (exponential: `backoffMs * 2^attempt`) |

**How it works:**

- On `OptimisticLockException`, the method is retried up to `maxRetries` times
- Backoff increases exponentially: 100ms → 200ms → 400ms
- If all retries fail, the original exception is thrown
- Works with any Spring-managed bean method (not just UPSERT)

**Use cases:**

- UPSERT operations with concurrent access
- `@Version`-based optimistic locking in `save()` calls
- Any operation where concurrent modifications may cause conflicts
