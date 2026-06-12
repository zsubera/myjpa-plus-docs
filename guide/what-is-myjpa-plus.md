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
- Multi-database dialect support (PostgreSQL, MySQL)

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
- @SoftDelete with Boolean, Integer, Enum types
- @IgnoreSoftDelete for temporary override
- Repository methods for soft-deleted entities

### Field Encryption (@Encrypt)
- AES-GCM encryption
- Transparent JPA AttributeConverter
- Multi-version key rotation

### Audit Annotations
- @CreatedAt, @UpdatedAt, @CreatedBy, @UpdatedBy
- Automatic field population

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
