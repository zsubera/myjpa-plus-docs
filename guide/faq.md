# Frequently Asked Questions (FAQ)

## Table of Contents

- [Installation & Configuration](#installation--configuration)
- [Query Building](#query-building)
- [Bulk Operations](#bulk-operations)
- [Soft Delete](#soft-delete)
- [Encryption & Masking](#encryption--masking)
- [Performance & Tuning](#performance--tuning)
- [Compatibility](#compatibility)

---

## Installation & Configuration

### Q: How do I add the myjpa-plus dependency?

**Maven:**
```xml
<dependency>
    <groupId>io.github.zsubera</groupId>
    <artifactId>myjpa-plus</artifactId>
    <version>1.3.1</version>
</dependency>
```

**Gradle:**
```groovy
implementation 'io.github.zsubera:myjpa-plus:1.3.1'
```

### Q: Is manual configuration required?

No manual configuration is needed in most cases. After adding the dependency, `MyJpaPlusAutoConfiguration` automatically registers `DefaultMyJpaRepository` as the base class for all repositories and auto-configures `MyJpaTemplate`, `QueryCacheManager`, and other beans.

To customize, add to `application.yml`:
```yaml
myjpa-plus:
  query:
    max-results: 50000
    deep-pagination-offset-threshold: 500000
  soft-delete:
    auto-filter: true
    block-unconditional-delete: true
```

### Q: `SerializedLambda.writeReplace()` error?

This is a Java module system restriction. Add the JVM argument:

```bash
--add-opens java.base/java.lang.invoke=ALL-UNNAMED
```

### Q: How to replace the default Repository base class?

Use `@EnableJpaRepositories`:
```java
@EnableJpaRepositories(repositoryFactoryBeanClass = MyJpaRepositoryFactoryBean.class)
```

Or disable auto-replacement:
```yaml
myjpa-plus:
  auto-repository-base-class: false
```

---

## Query Building

### Q: QuerySpec vs Specification?

`QuerySpec` is a lambda-based type-safe builder implementing `Specification<T>`. It can be passed directly to Spring Data's `findAll(Specification)`.

```java
// QuerySpec (recommended)
QuerySpec<User> spec = new QuerySpec<>();
spec.eq(User::getStatus, "ACTIVE");
repository.findAll(spec);
```

### Q: How to build OR conditions?

Use `or(Consumer<OrGroup>)`:
```java
QuerySpec<User> spec = new QuerySpec<>();
spec.or(g -> g
    .eq(User::getRole, "ADMIN")
    .eq(User::getRole, "MODERATOR")
);
```

### Q: How to use EXISTS subqueries?

```java
QuerySpec<Customer> spec = new QuerySpec<>();
spec.exists(Order.class, sub -> sub
    .gt(Order::getAmount, 1000)
);
```

### Q: How to use database functions in queries?

Use `func()` (only whitelisted safe functions allowed):
```java
spec.func(User::getMetadata, "jsonb_exists", "key");
```

### Q: How to customize the cache backend?

Implement `CacheAdapter` and register as a Spring Bean:

```java
@Component
public class RedisCacheAdapter implements CacheAdapter {
    @Override
    public <T> T get(String key) { /* Redis GET */ }

    @Override
    public <T> void put(String key, T value, long ttlSeconds) { /* Redis SET EX */ }

    @Override
    public void evictByPrefix(String prefix) { /* Redis KEYS + DEL */ }

    @Override
    public void close() { /* release connection */ }
}
```

---

## Bulk Operations

### Q: Which databases support bulk UPSERT?

| Database | Dialect | Single-row UPSERT | Multi-row Batch UPSERT |
|----------|---------|-------------------|------------------------|
| PostgreSQL | `INSERT ... ON CONFLICT DO UPDATE` | ✅ | ✅ |
| MySQL | `INSERT ... ON DUPLICATE KEY UPDATE` | ✅ | ✅ |
| Oracle | `MERGE INTO ... USING dual` | ✅ | ❌ |
| SQL Server | `MERGE INTO ... USING (...) AS source` | ✅ | ❌ |

Dialects without multi-row batch support automatically fall back to row-by-row execution.

### Q: How to handle very large data (100K+ rows)?

Use `executeBatchInSeparateTransactions`, committing each batch in its own transaction:

```java
jpa.executeBatchInSeparateTransactions(
    jpa.update(User.class).set(User::getStatus, "INACTIVE"),
    1000  // 1000 rows per batch
);
```

### Q: Are there row limits on bulk operations?

Default max is 10,000 rows. Configure via:
```yaml
myjpa-plus:
  query:
    max-bulk-operation-rows: 50000
```

Set to `-1` to disable (not recommended in production).

---

## Soft Delete

### Q: How to enable soft delete?

Add `@SoftDelete` on the entity field:

```java
@Entity
public class User {
    @Id @GeneratedValue
    private Long id;

    @SoftDelete
    private Boolean deleted;
}
```

### Q: Which field types are supported?

| Type | Default deleted value | Customization |
|------|----------------------|---------------|
| `Boolean` | `true` | N/A |
| `Integer` | `1` | `@SoftDelete(deletedIntValue = 9)` |
| `Enum` | must specify | `@SoftDelete(deletedValue = "DELETED")` |
| `String` | `"1"` | `@SoftDelete(deletedStringValue = "X")` |

### Q: How to skip auto-filtering?

Use `@IgnoreSoftDelete`:
```java
@Repository
public interface UserRepository extends MyJpaRepository<User, Long> {
    @IgnoreSoftDelete
    List<User> findAllIncludingDeleted();
}
```

Or via ThreadLocal:
```java
DefaultMyJpaRepository.withAutoFilterOverride(false, () -> {
    return userRepository.findAll();
});
```

---

## Encryption & Masking

### Q: How to configure encryption keys?

**Recommended (environment variables):**
```bash
export MYJPA_ENCRYPT_KEY="your-encryption-key-at-least-16-bytes"
export MYJPA_ENCRYPT_SALT="your-persistent-salt-value"
```

### Q: Is salt required in production?

Yes. Without a configured salt, each JVM restart generates a random salt, rendering encrypted data unrecoverable. `MyJpaPlusAutoConfiguration` blocks startup in production if no salt is configured.

### Q: How to rotate encryption keys?

Multi-version key format:
```bash
export MYJPA_ENCRYPT_KEY="v1:old-key-v1,v2:new-key-v2"
export MYJPA_ENCRYPT_KEY_VERSION="v2"
```

Rotation steps:
1. Deploy new key (v2) while keeping old key (v1)
2. Set `MYJPA_ENCRYPT_KEY_VERSION=v2`
3. Re-encrypt historical data via `EncryptConverter.reEncrypt()`
4. Remove old key

### Q: How does @Mask work?

`@Mask` works with `MaskSerializer` (Jackson serializer) for automatic JSON output masking:

```java
@Entity
public class User {
    @Mask(type = MaskType.PHONE)
    private String phone;      // output: 138****1234

    @Mask(type = MaskType.EMAIL)
    private String email;      // output: u***@example.com
}
```

---

## Performance & Tuning

### Q: Are there query result row limits?

Queries via `MyJpaTemplate` default to 10,000 rows. Direct `Repository.findAll()` has no limit.

### Q: How to optimize deep pagination?

Use Keyset (cursor-based) pagination:
```java
KeysetPage<User> page1 = jpa.findKeysetPage(
    User.class, spec, Sort.by("id"), 20, null);

KeysetPage<User> page2 = jpa.findKeysetPage(
    User.class, spec, Sort.by("id"), 20, page1.lastSortValues());
```

### Q: IN clause with too many parameters?

`InClauseBuilder` auto-batches:
- Oracle: 1,000 per batch
- SQL Server: 2,100 per batch
- Others: 1,000 per batch (configurable)

### Q: How to monitor slow queries?

Enable slow query monitoring:
```yaml
myjpa-plus:
  monitoring:
    enabled: true
    slow-query-threshold-ms: 1000
```

---

## Compatibility

### Q: Which Java versions?

**Minimum: Java 17** (uses sealed interfaces and other Java 17 features)

### Q: Which Spring Boot versions?

**Spring Boot 3.x** (based on Spring Data JPA 3.x)

### Q: Which databases?

| Database | Min Version | UPSERT | Batch UPSERT | Soft Delete | Encryption |
|----------|------------|--------|-------------|-------------|-------------|
| PostgreSQL | 12+ | ✅ | ✅ | ✅ | ✅ |
| MySQL | 8.0+ | ✅ | ✅ | ✅ | ✅ |
| Oracle | 12c+ | ✅ | ❌ | ✅ | ✅ |
| SQL Server | 2016+ | ✅ | ❌ | ✅ | ✅ |

### Q: EclipseLink support?

Most features are compatible, but the following require Hibernate:
- `@CodeEnum` (code-based enum conversion)
- `@IgnoreSoftDelete` AOP advice
- `SqlSlowQueryInterceptor`

### Q: Coexistence with MyBatis-Plus?

Yes. myjpa-plus only extends Spring Data JPA and does not conflict with MyBatis.

### Q: Multiple data sources?

Supported via `EntityManagerResolver`:
```java
@Component
public class CustomEntityManagerResolver implements EntityManagerResolver {
    @Override
    public EntityManager resolve(Class<?> entityClass) {
        if (Order.class.isAssignableFrom(entityClass)) {
            return orderEntityManager;
        }
        return defaultEntityManager;
    }
}
```
