---
sidebar_position: 1
title: Soft Delete
---

# Soft Delete

MyJpa-Plus provides built-in soft delete support using the `@SoftDelete` annotation.

## Define Soft Delete Entity

### Boolean-based (most common)

```java
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @SoftDelete
    private Boolean deleted = false;
    
    // getters and setters...
}
```

### Enum-based

```java
public enum Status {
    ACTIVE, INACTIVE, DELETED
}

@Entity
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @SoftDelete(deletedValue = "DELETED")
    private Status status = Status.ACTIVE;
}
```

### Boolean vs Nullable Boolean

```java
// Primitive boolean - WHERE deleted = false
@SoftDelete
private boolean deleted;

// Wrapper Boolean - WHERE deleted IS NULL OR deleted = false
@SoftDelete
private Boolean deleted;
```

Nullable `Boolean` allows three states:
- `null` or `false` = not deleted
- `true` = deleted

### Integer-based

```java
@Entity
public class AuditLog {
    @SoftDelete(deletedIntValue = 1)
    private Integer deleted = 0;
}
```

### String-based

```java
@Entity
public class Document {
    @SoftDelete(deletedStringValue = "ARCHIVED")
    private String status = "ACTIVE";
}
```

### Deletion Timestamp

Automatically set a timestamp when the entity is soft-deleted:

```java
@Entity
public class User {
    @SoftDelete
    private Boolean deleted;

    @SoftDelete(deletedTimestampField = "deletedAt")
    private LocalDateTime deletedAt;
}
```

## Using MyJpaRepository

The `MyJpaRepository` interface provides built-in soft delete methods:

```java
public interface ProductRepository extends MyJpaRepository<Product, Long> {
}

// Find all non-deleted products
List<Product> products = repository.findNotDeletedAll();
```

Generated SQL:
```sql
SELECT * FROM products WHERE deleted = false
```

```java
// Find non-deleted entities with conditions
List<Product> products = repository.findNotDeletedAll(spec);
```

Generated SQL:
```sql
SELECT * FROM products WHERE deleted = false AND status = 'ACTIVE'
```

```java
// Paginated non-deleted entities
Page<Product> products = repository.findNotDeletedAll(spec, pageable);
```

Generated SQL:
```sql
-- Count
SELECT COUNT(*) FROM products WHERE deleted = false AND status = 'ACTIVE'

-- Data
SELECT * FROM products WHERE deleted = false AND status = 'ACTIVE' LIMIT 20 OFFSET 0
```

```java
// Find single non-deleted entity
Optional<Product> product = repository.findNotDeletedOne(spec);
```

Generated SQL:
```sql
SELECT * FROM products WHERE deleted = false AND status = 'ACTIVE' LIMIT 1
```

```java
// Find non-deleted entity by ID
Optional<Product> product = repository.findNotDeletedById(id);
```

Generated SQL:
```sql
SELECT * FROM products WHERE id = ? AND deleted = false
```

```java
// Count non-deleted entities
long count = repository.countNotDeleted();
```

Generated SQL:
```sql
SELECT COUNT(*) FROM products WHERE deleted = false
```

## Using SoftDeleteHelper

For more control, use `SoftDeleteHelper` directly:

```java
// Get Specification for non-deleted entities (cached)
Specification<Product> notDeleted = SoftDeleteHelper.isNotDeleted(Product.class);
List<Product> products = repository.findAll(notDeleted);

// Get only deleted entities (cached)
Specification<Product> deleted = SoftDeleteHelper.isDeleted(Product.class);
List<Product> archived = repository.findAll(deleted);

// Combine with other Specifications
Specification<Product> active = SoftDeleteHelper.isNotDeleted(Product.class)
    .and((root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"));
List<Product> products = repository.findAll(active);
```

## Using QuerySpec

```java
// Build QuerySpec with soft delete filter
QuerySpec<Product> qs = SoftDeleteHelper.notDeletedQuery(Product.class);
qs.eq(Product::getCategory, "Electronics");
List<Product> products = repository.findAll(qs.toSpecification());
```

## Utility Methods

```java
// Find the soft delete field name (cached, returns null if none)
String fieldName = SoftDeleteHelper.findSoftDeleteField(Product.class);

// Check if an entity instance is soft-deleted
boolean isDeleted = SoftDeleteHelper.isSoftDeleted(Product.class, product);
```

## Auto-Filter Configuration

Enable automatic soft delete filtering in `application.yml`:

```yaml
myjpa-plus:
  soft-delete:
    auto-filter: true  # Default: true
```

## @IgnoreSoftDelete

Use `@IgnoreSoftDelete` to skip auto-filtering on specific methods or entire types:

```java
// Skip on a specific repository method
@IgnoreSoftDelete
@Query("SELECT p FROM Product p WHERE p.id = :id")
Optional<Product> findByIdIncludingDeleted(@Param("id") Long id);

// Skip on an entire repository
@IgnoreSoftDelete
public interface ArchiveRepository extends MyJpaRepository<Product, Long> {
    // All queries in this repository include soft-deleted entities
}
```

## SoftDeleteFilterBean

Use `SoftDeleteFilterBean` for programmatic control:

```java
@Autowired
private SoftDeleteFilterBean filterBean;

// Apply soft delete filter to any Specification
Specification<Product> spec = ...;
Specification<Product> filtered = filterBean.apply(spec, Product.class);

// Check if entity has soft delete field
boolean hasSoftDelete = filterBean.hasSoftDeleteField(Product.class);

// Pre-register entity for caching
filterBean.registerEntity(Product.class);
```

## SoftDeleteBulkExecutor

For batch soft-delete operations:

```java
// Soft-delete all entities (with row-count protection)
int affected = SoftDeleteBulkExecutor.softDeleteAll(em, User.class, true);

// Soft-delete with custom max rows (default: 10000)
int affected = SoftDeleteBulkExecutor.softDeleteAll(em, User.class, true, 5000);

// Soft-delete by IDs
int affected = SoftDeleteBulkExecutor.softDeleteByIds(em, User.class, List.of(1L, 2L, 3L));
```

::: warning Row-Count Protection
`softDeleteAll()` checks `TransactionSynchronizationManager.isActualTransactionActive()` before executing. Without an active transaction, it throws an exception to prevent un-rollable data loss.
:::

## SoftDeleteContext (Virtual Thread Support)

For virtual thread (Java 21+) scenarios:

```java
// Using withIgnore -- recommended for virtual threads
List<User> allUsers = SoftDeleteContext.withIgnore(() -> repository.findAll());

// Using withIgnore with return value
Optional<User> user = SoftDeleteContext.withIgnore(() -> repository.findById(id));

// Manual push/pop (legacy approach, still supported)
SoftDeleteContext.pushIgnore();
try {
    List<User> all = repository.findAll();
} finally {
    SoftDeleteContext.popIgnore();
}

// Async boundary support — capture context before spawning a virtual thread
int savedIgnoreCount = SoftDeleteContext.captureAndResetForAsync();
try {
    // In another thread (e.g., virtual thread)
    List<User> all = repository.findAll();  // respects original ignore state
} finally {
    SoftDeleteContext.restoreForAsync(savedIgnoreCount);
}
```

