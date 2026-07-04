# What is MyJpa-Plus?

MyJpa-Plus is a type-safe JPA Specification builder for Spring Data JPA. It provides a fluent API using lambda expressions and method references to build dynamic queries, eliminating hardcoded field name strings.

## The Problem

Traditional JPA Criteria API is verbose and error-prone:

```java
// Traditional approach - error prone
Root<User> root = query.from(User.class);
Predicate predicate = cb.and(
    cb.equal(root.get("status"), "ACTIVE"),      // Magic string!
    cb.like(root.get("name"), "%John%"),          // Typo risk!
    cb.greaterThan(root.get("age"), 18)
);
```

## The Solution

MyJpa-Plus provides a clean, type-safe alternative:

```java
// MyJpa-Plus - type safe
// toSpecification() is optional - QuerySpec implements Specification directly
QuerySpec<User> spec = new QuerySpec<User>()
    .eq(User::getStatus, "ACTIVE")      // Compile-time checked!
    .like(User::getName, "%John%")      // No magic strings!
    .gt(User::getAge, 18);

// Pass directly to findAll()
userRepository.findAll(spec);

// Or with toSpecification() for explicit intent
userRepository.findAll(spec.toSpecification());
```

## Key Benefits

| Feature | Traditional JPA | MyJpa-Plus |
|---------|----------------|------------|
| Field references | Strings (`"name"`) | Method refs (`User::getName`) |
| Type safety | Runtime errors | Compile-time errors |
| Null handling | Manual checks | Automatic IS NULL |
| OR/NOT groups | Complex nesting | Clean Consumer API |
| JOIN conditions | Verbose code | Fluent builder |

## Core API Entry Points

### MyJpaRepository\<T, ID\>

Base repository interface extending `JpaRepository` and `JpaSpecificationExecutor`. Provides:

- All standard Spring Data JPA methods
- Soft-delete auto-filtering on all queries
- Lambda convenience methods: `findAll(Consumer)`, `findOne(Consumer)`, `count(Consumer)`, `exists(Consumer)`
- Bulk operations: `update(Consumer)`, `delete(Consumer)`, `merge(Consumer)`
- `deleteByIdIfExists(ID)` for safe soft-delete by ID

```java
public interface UserRepository extends MyJpaRepository<User, Long> {
    // Your custom query methods...
}

// Lambda style (v1.3.0+)
List<User> users = userRepository.findAll(s -> s.eq(User::getStatus, "ACTIVE"));
```

### MyJpaTemplate

Convenience template for operations outside repository context:

- Query methods with max results, EntityGraph, streaming, pagination
- Batch save: `saveAllBatched()`, `saveAllBatchedPure()`, `saveAllBatchedInSeparateTransactions()`
- Keyset pagination: `findKeysetPage()` for cursor-based paging
- UPSERT execution: `execute(MergeSpec)`
- Configurable cache, deep pagination guard, max results limits

```java
@Autowired
private MyJpaTemplate template;

List<User> users = template.findAll(User.class, s -> s.eq(User::getStatus, "ACTIVE"));
template.saveAllBatched(users, 100);
```

### QuerySpec\<T\>

Core query builder implementing `Specification<T>`:

- 30+ condition methods: eq, ne, gt, lt, like, in, between, etc.
- JOIN, LEFT JOIN, FETCH JOIN support
- OR/NOT groups with nested conditions
- EXISTS/NOT EXISTS subqueries
- GROUP BY, HAVING, ORDER BY, DISTINCT
- `QuerySpec.of(consumer)` one-liner factory

```java
QuerySpec<User> spec = QuerySpec.of(s -> s
    .eq(User::getStatus, "ACTIVE")
    .join(User::getDepartment, j -> j.eq(Department::getName, "Engineering"))
    .orderByDesc(User::getCreatedAt)
);
```

## Features

### Query Building (QuerySpec)
- Lambda type safety with method references
- Fluent API for AND/OR condition combinations
- JOIN support with nested conditions
- EXISTS and NOT EXISTS subqueries
- OR/NOT groups with Consumer pattern
- Multi-field search with multiLike
- Case-insensitive queries
- Collection operations (isEmpty, isNotEmpty)
- GROUP BY and HAVING support
- Database function calls

### Bulk Operations (UpdateSpec / DeleteSpec)
- Type-safe batch update and delete
- Expression SET for atomic operations
- Safety limits for unconditional operations
- Row count limits

### UPSERT / MergeSpec
- Type-safe UPSERT operations
- Conflict column specification
- Selective column updates
- Multi-database dialect support (PostgreSQL, MySQL, Oracle, SQL Server)
- Multi-row batch UPSERT optimization
- executeWithCallbacks for JPA lifecycle hooks

### CTE (Common Table Expression)
- Non-recursive and recursive CTEs
- Parameter binding
- SQL preview for debugging

### Projection Queries (ProjectionSpec)
- Field selection with type safety
- Aggregate functions
- DTO constructor projection
- JOIN and pagination support

### Soft Delete
- @SoftDelete with Boolean, Integer, Enum, String types
- Deletion timestamp auto-population
- @IgnoreSoftDelete for temporary override
- SoftDeleteBulkExecutor for batch operations
- Virtual thread compatibility

### Field Encryption (@Encrypt)
- AES-GCM encryption
- Transparent JPA AttributeConverter
- Multi-version key rotation
- Salt management for production

### Field Masking (@Mask)
- PHONE, EMAIL, ID_CARD, NAME, BANK_CARD, ADDRESS, LICENSE_PLATE
- Jackson serializer integration
- JSON output auto-masking

### Audit Annotations
- @CreatedAt, @UpdatedAt, @CreatedBy, @UpdatedBy
- Automatic field population
- AuditUserProvider SPI for custom user resolution

### Multi-Entity Manager Support
- Resolve different EntityManagerFactory by entity type
- Automatic EntityManagerFactory detection
- EntityClassResolver for multi-datasource scenarios

### Additional Features
- QuerySpec.of() factory method and Lambda convenience overloads
- CacheAdapter SPI for pluggable cache backends (Redis/Caffeine)
- QueryAggregates for standalone aggregate expressions
- Keyset pagination (cursor-based) for large datasets
- Deep pagination guard with configurable thresholds
- Batch save with persist/merge auto-detection
- @RetryOnOptimisticLock for automatic retry
- SQL slow query monitoring via DataSource proxy
- @CodeEnum/@CodeEnumValue for Hibernate 6 enum mapping
- Virtual thread (Java 21+) compatibility
- Spring Boot auto-configuration with zero setup
- EntityGraphHelper for dynamic EntityGraph building
- PageableHelper for QuerySpec/Pageable sort integration
- InClauseBuilder for large IN clause auto-batching (Oracle-compatible)
- FunctionWhitelist for custom function registration
- IdentifierValidator for SQL injection prevention

### Code Generation
- Entity and repository code generation

## Architecture

MyJpa-Plus builds on top of Spring Data JPA's `Specification<T>` interface. It generates standard JPA Criteria predicates that work with any JPA provider (Hibernate, EclipseLink, etc.).

```
┌─────────────────────────────────────────────────┐
│                 Your Application                 │
├─────────────────────────────────────────────────┤
│              MyJpa-Plus (QuerySpec)              │
├─────────────────────────────────────────────────┤
│          Spring Data JPA (Specification)         │
├─────────────────────────────────────────────────┤
│              JPA Criteria API                    │
├─────────────────────────────────────────────────┤
│        JPA Provider (Hibernate/EclipseLink)      │
└─────────────────────────────────────────────────┘
```
