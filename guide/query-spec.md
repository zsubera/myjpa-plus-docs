# QuerySpec

QuerySpec is the core class for building type-safe queries. It implements `Specification<T>` and provides a fluent API for constructing JPA Criteria predicates.

## About toSpecification()

`QuerySpec` directly implements `Specification<T>`, so you can pass it directly to `findAll()` without calling `toSpecification()`:

```java
// Both work:
userRepository.findAll(new QuerySpec<User>().eq(User::getStatus, "ACTIVE"));
userRepository.findAll(new QuerySpec<User>().eq(User::getStatus, "ACTIVE").toSpecification());
```

**When to use `toSpecification()`:**
- Combining with external Specification: `toSpecification(externalSpec)`
- Making code intent clearer in complex queries
- Validating state (catches unclosed `or()` groups)

**When you can skip it:**
- Simple queries where intent is already clear
- Chained calls where the builder pattern is obvious

## Basic Comparisons

### Equality

```java
// Equal
new QuerySpec<User>().eq(User::getStatus, "ACTIVE")

// Not Equal
new QuerySpec<User>().ne(User::getStatus, "INACTIVE")

// Null handling - automatically becomes IS NULL
new QuerySpec<User>().eq(User::getDeletedAt, null)

// Not Null - automatically becomes IS NOT NULL
new QuerySpec<User>().ne(User::getDeletedAt, null)
```

### Numeric Comparisons

```java
// Greater Than
new QuerySpec<User>().gt(User::getAge, 18)

// Greater Than or Equal
new QuerySpec<User>().ge(User::getAge, 18)

// Less Than
new QuerySpec<User>().lt(User::getAge, 65)

// Less Than or Equal
new QuerySpec<User>().le(User::getAge, 65)

// Between (inclusive)
new QuerySpec<User>().between(User::getAge, 18, 65)

// Not Between
new QuerySpec<User>().notBetween(User::getAge, 0, 17)
```

## String Operations

```java
// LIKE with wildcards
new QuerySpec<User>().like(User::getName, "%John%")

// NOT LIKE
new QuerySpec<User>().notLike(User::getName, "%test%")

// Starts With (adds % suffix automatically)
new QuerySpec<User>().startsWith(User::getName, "John")

// Ends With (adds % prefix automatically)
new QuerySpec<User>().endsWith(User::getName, "son")

// Contains (adds % prefix and suffix automatically)
new QuerySpec<User>().contains(User::getName, "oh")

// Case-insensitive equals
new QuerySpec<User>().eqIgnoreCase(User::getName, "john")

// Case-insensitive LIKE
new QuerySpec<User>().likeIgnoreCase(User::getName, "%john%")

// Raw LIKE (without wildcard escaping)
new QuerySpec<User>().rawLike(User::getCode, "USER%")
```

## Collection Operations

```java
// IN clause
new QuerySpec<User>().in(User::getStatus, "ACTIVE", "PENDING")

// IN with Collection
new QuerySpec<User>().in(User::getStatus, List.of("ACTIVE", "PENDING"))

// NOT IN
new QuerySpec<User>().notIn(User::getStatus, "DELETED", "BANNED")

// IS EMPTY (for @OneToMany, @ManyToMany)
new QuerySpec<User>().isEmpty(User::getRoles)

// IS NOT EMPTY
new QuerySpec<User>().isNotEmpty(User::getRoles)
```

## Multi-Field Search

Search across multiple fields with a single keyword:

```java
// Search name, email, or phone
new QuerySpec<User>().multiLike(keyword, User::getName, User::getEmail, User::getPhone)
```

This generates: `WHERE name LIKE '%keyword%' OR email LIKE '%keyword%' OR phone LIKE '%keyword%'`

## Conditional (Guarded) Methods

All condition methods have a `boolean condition` first-parameter variant. The condition is only added when `condition` is `true`:

```java
// Only add status filter if status is not null
new QuerySpec<User>()
    .eq(status != null, User::getStatus, status)
    .gt(minAge != null, User::getAge, minAge)
    .toSpecification()
```

This is especially useful for building dynamic queries where filters are optional.

## OR Groups

### Consumer Pattern (Recommended)

```java
new QuerySpec<User>()
    .eq(User::getStatus, "ACTIVE")
    .or(g -> g
        .eq(User::getRole, "ADMIN")
        .eq(User::getRole, "MODERATOR"))
    .toSpecification()
```

### Nested OR Groups

```java
new QuerySpec<User>()
    .or(outer -> outer
        .eq(User::getStatus, "ACTIVE")
        .or(inner -> inner
            .eq(User::getRole, "ADMIN")
            .eq(User::getRole, "SUPER_ADMIN")))
    .toSpecification()
```

## NOT Groups

```java
// NOT (status = 'DELETED')
new QuerySpec<User>()
    .not(g -> g.eq(User::getStatus, "DELETED"))
    .toSpecification()

// NOT (status = 'ACTIVE' AND age < 18)
new QuerySpec<User>()
    .not(g -> g
        .eq(User::getStatus, "ACTIVE")
        .lt(User::getAge, 18))
    .toSpecification()
```

## DISTINCT

```java
new QuerySpec<User>()
    .eq(User::getStatus, "ACTIVE")
    .distinct()
    .toSpecification()
```

## ORDER BY

```java
// Ascending
new QuerySpec<User>()
    .orderByAsc(User::getName)
    .toSpecification()

// Descending
new QuerySpec<User>()
    .orderByDesc(User::getCreatedAt)
    .toSpecification()

// Multiple fields
new QuerySpec<User>()
    .orderByAsc(User::getStatus)
    .orderByDesc(User::getCreatedAt)
    .toSpecification()
```

## GROUP BY and HAVING

```java
new QuerySpec<User>()
    .groupBy(User::getStatus)
    .having((root, cb) -> cb.greaterThan(cb.count(root), 1L))
    .toSpecification()
```

## Raw Predicate

For complex cases not covered by the fluent API:

```java
new QuerySpec<User>()
    .where((path, cb) -> cb.and(
        cb.equal(path.get("status"), "ACTIVE"),
        cb.greaterThan(path.get("age"), 18)
    ))
    .toSpecification()
```

## Combining Specifications

```java
QuerySpec<User> base = new QuerySpec<User>().eq(User::getStatus, "ACTIVE");
QuerySpec<User> ageFilter = new QuerySpec<User>().gt(User::getAge, 18);

// AND combination
Specification<User> combined = base.and(ageFilter);

// OR combination
Specification<User> combined = base.or(ageFilter);

// With external Specification
Specification<User> external = (root, query, cb) -> cb.equal(root.get("type"), "USER");
Specification<User> combined = base.toSpecification(external);

// Merge conditions from another QuerySpec
QuerySpec<User> merged = base.then(ageFilter);
```

## Query Settings

### Timeout

```java
new QuerySpec<User>()
    .timeout(30)  // 30 seconds
    .eq(User::getStatus, "ACTIVE")
    .toSpecification()
```

### Lock Mode

```java
new QuerySpec<User>()
    .lockMode(LockModeType.PESSIMISTIC_WRITE)
    .eq(User::getId, userId)
    .toSpecification()
```

## Exposing Sort and Settings

```java
QuerySpec<User> qs = new QuerySpec<User>()
    .orderByAsc(User::getName)
    .orderByDesc(User::getCreatedAt)
    .timeout(30);

// Get Sort for Spring Data
Sort sort = qs.getSort();

// Get timeout
Integer timeout = qs.getQueryTimeout();

// Get lock mode
LockModeType lockMode = qs.getLockMode();

// Apply settings to TypedQuery
qs.applyQuerySettings(typedQuery);
```
