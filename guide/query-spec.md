# QuerySpec

QuerySpec is the core class for building type-safe queries. It implements `Specification<T>` and provides a fluent API for constructing JPA Criteria predicates.

## About toSpecification()

`QuerySpec` directly implements `Specification<T>`, so you can pass it directly to `findAll()` without calling `toSpecification()`:

```java
// Both work:
userRepository.findAll(new QuerySpec<User>().eq(User::getStatus, "ACTIVE"));
userRepository.findAll(new QuerySpec<User>().eq(User::getStatus, "ACTIVE").toSpecification());
```

Generated SQL:
```sql
SELECT * FROM users WHERE status = 'ACTIVE'
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
```
```sql
SELECT * FROM users WHERE status = 'ACTIVE'
```

```java
// Not Equal
new QuerySpec<User>().ne(User::getStatus, "INACTIVE")
```
```sql
SELECT * FROM users WHERE status <> 'INACTIVE'
```

```java
// Null handling - automatically becomes IS NULL
new QuerySpec<User>().eq(User::getDeletedAt, null)
```
```sql
SELECT * FROM users WHERE deleted_at IS NULL
```

```java
// Not Null - automatically becomes IS NOT NULL
new QuerySpec<User>().ne(User::getDeletedAt, null)
```
```sql
SELECT * FROM users WHERE deleted_at IS NOT NULL
```

### Numeric Comparisons

```java
// Greater Than
new QuerySpec<User>().gt(User::getAge, 18)
```
```sql
SELECT * FROM users WHERE age > 18
```

```java
// Greater Than or Equal
new QuerySpec<User>().ge(User::getAge, 18)
```
```sql
SELECT * FROM users WHERE age >= 18
```

```java
// Less Than
new QuerySpec<User>().lt(User::getAge, 65)
```
```sql
SELECT * FROM users WHERE age < 65
```

```java
// Less Than or Equal
new QuerySpec<User>().le(User::getAge, 65)
```
```sql
SELECT * FROM users WHERE age <= 65
```

```java
// Between (inclusive)
new QuerySpec<User>().between(User::getAge, 18, 65)
```
```sql
SELECT * FROM users WHERE age BETWEEN 18 AND 65
```

```java
// Not Between
new QuerySpec<User>().notBetween(User::getAge, 0, 17)
```
```sql
SELECT * FROM users WHERE age NOT BETWEEN 0 AND 17
```

## String Operations

```java
// LIKE (automatically wraps value with % prefix and suffix)
new QuerySpec<User>().like(User::getName, "John")
```
```sql
SELECT * FROM users WHERE name LIKE '%John%'
```

```java
// NOT LIKE
new QuerySpec<User>().notLike(User::getName, "test")
```
```sql
SELECT * FROM users WHERE name NOT LIKE '%test%'
```

```java
// Starts With (adds % suffix automatically)
new QuerySpec<User>().startsWith(User::getName, "John")
```
```sql
SELECT * FROM users WHERE name LIKE 'John%'
```

```java
// Ends With (adds % prefix automatically)
new QuerySpec<User>().endsWith(User::getName, "son")
```
```sql
SELECT * FROM users WHERE name LIKE '%son'
```

```java
// Not Starts With
new QuerySpec<User>().notStartsWith(User::getName, "Admin")
```
```sql
SELECT * FROM users WHERE name NOT LIKE 'Admin%'
```

```java
// Not Ends With
new QuerySpec<User>().notEndsWith(User::getName, "test")
```
```sql
SELECT * FROM users WHERE name NOT LIKE '%test'
```

```java
// Case-insensitive equals
new QuerySpec<User>().eqIgnoreCase(User::getName, "john")
```
```sql
SELECT * FROM users WHERE UPPER(name) = UPPER('john')
```

```java
// Case-insensitive NOT equals
new QuerySpec<User>().neIgnoreCase(User::getName, "john")
```
```sql
SELECT * FROM users WHERE UPPER(name) <> UPPER('john')
```

```java
// Case-insensitive LIKE (automatically wraps value with % prefix and suffix)
new QuerySpec<User>().likeIgnoreCase(User::getName, "john")
```
```sql
SELECT * FROM users WHERE UPPER(name) LIKE UPPER('%john%')
```

## Collection Operations

```java
// IN clause
new QuerySpec<User>().in(User::getStatus, "ACTIVE", "PENDING")
```
```sql
SELECT * FROM users WHERE status IN ('ACTIVE', 'PENDING')
```

```java
// IN with Collection
new QuerySpec<User>().in(User::getStatus, List.of("ACTIVE", "PENDING"))
```
```sql
SELECT * FROM users WHERE status IN ('ACTIVE', 'PENDING')
```

```java
// NOT IN
new QuerySpec<User>().notIn(User::getStatus, "DELETED", "BANNED")
```
```sql
SELECT * FROM users WHERE status NOT IN ('DELETED', 'BANNED')
```

```java
// IS EMPTY (for @OneToMany, @ManyToMany)
new QuerySpec<User>().isEmpty(User::getRoles)
```
```sql
SELECT * FROM users WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = users.id)
```

```java
// IS NOT EMPTY
new QuerySpec<User>().isNotEmpty(User::getRoles)
```
```sql
SELECT * FROM users WHERE EXISTS (SELECT 1 FROM user_roles WHERE user_id = users.id)
```

## Multi-Field Search

Search across multiple fields with a single keyword:

```java
// Search name, email, or phone
new QuerySpec<User>().multiLike(keyword, User::getName, User::getEmail, User::getPhone)
```

Generated SQL (with `keyword = "John"`):
```sql
SELECT * FROM users
WHERE name LIKE '%John%' OR email LIKE '%John%' OR phone LIKE '%John%'
```

## Conditional (Guarded) Methods

All condition methods have a `boolean condition` first-parameter variant. The condition is only added when `condition` is `true`:

```java
// Only add status filter if status is not null
new QuerySpec<User>()
    .eq(status != null, User::getStatus, status)
    .gt(minAge != null, User::getAge, minAge)
    .toSpecification()
```

When `status = "ACTIVE"` and `minAge = null`:
```sql
SELECT * FROM users WHERE status = 'ACTIVE'
```

When `status = null` and `minAge = 18`:
```sql
SELECT * FROM users WHERE age > 18
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
```sql
SELECT * FROM users WHERE status = 'ACTIVE' AND (role = 'ADMIN' OR role = 'MODERATOR')
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
```sql
SELECT * FROM users WHERE (status = 'ACTIVE' OR (role = 'ADMIN' OR role = 'SUPER_ADMIN'))
```

## NOT Groups

```java
// NOT (status = 'DELETED')
new QuerySpec<User>()
    .not(g -> g.eq(User::getStatus, "DELETED"))
    .toSpecification()
```
```sql
SELECT * FROM users WHERE NOT (status = 'DELETED')
```

```java
// NOT (status = 'ACTIVE' AND age < 18)
new QuerySpec<User>()
    .not(g -> g
        .eq(User::getStatus, "ACTIVE")
        .lt(User::getAge, 18))
    .toSpecification()
```
```sql
SELECT * FROM users WHERE NOT (status = 'ACTIVE' AND age < 18)
```

## DISTINCT

```java
new QuerySpec<User>()
    .eq(User::getStatus, "ACTIVE")
    .distinct()
    .toSpecification()
```
```sql
SELECT DISTINCT * FROM users WHERE status = 'ACTIVE'
```

## ORDER BY

```java
// Ascending
new QuerySpec<User>()
    .orderByAsc(User::getName)
    .toSpecification()
```
```sql
SELECT * FROM users ORDER BY name ASC
```

```java
// Descending
new QuerySpec<User>()
    .orderByDesc(User::getCreatedAt)
    .toSpecification()
```
```sql
SELECT * FROM users ORDER BY created_at DESC
```

```java
// Multiple fields
new QuerySpec<User>()
    .orderByAsc(User::getStatus)
    .orderByDesc(User::getCreatedAt)
    .toSpecification()
```
```sql
SELECT * FROM users ORDER BY status ASC, created_at DESC
```

## GROUP BY and HAVING

```java
new QuerySpec<User>()
    .groupBy(User::getStatus)
    .having((root, cb) -> cb.greaterThan(cb.count(root), 1L))
    .toSpecification()
```
```sql
SELECT * FROM users GROUP BY status HAVING COUNT(*) > 1
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
```sql
SELECT * FROM users WHERE status = 'ACTIVE' AND age > 18
```

## Combining Specifications

```java
QuerySpec<User> base = new QuerySpec<User>().eq(User::getStatus, "ACTIVE");
QuerySpec<User> ageFilter = new QuerySpec<User>().gt(User::getAge, 18);

// AND combination
Specification<User> combined = base.and(ageFilter);
```
```sql
SELECT * FROM users WHERE status = 'ACTIVE' AND age > 18
```

```java
// OR combination
Specification<User> combined = base.or(ageFilter);
```
```sql
SELECT * FROM users WHERE status = 'ACTIVE' OR age > 18
```

```java
// Merge conditions from another QuerySpec
QuerySpec<User> merged = base.then(ageFilter);
```
```sql
SELECT * FROM users WHERE status = 'ACTIVE' AND age > 18
```

## Query Settings

### Timeout

```java
new QuerySpec<User>()
    .timeout(30)  // 30 seconds
    .eq(User::getStatus, "ACTIVE")
    .toSpecification()
```
```sql
-- Same SQL, but query timeout set to 30 seconds:
SELECT * FROM users WHERE status = 'ACTIVE'
```

### Lock Mode

```java
new QuerySpec<User>()
    .lockMode(LockModeType.PESSIMISTIC_WRITE)
    .eq(User::getId, userId)
    .toSpecification()
```
```sql
-- Same SQL, but executed with pessimistic write lock:
SELECT * FROM users WHERE id = ? FOR UPDATE
```

## Aggregate Functions

### Using QuerySpec

```java
// GROUP BY with HAVING
List<Object[]> result = repository.findAll(s ->
    s.select(User::getStatus, s.count(User::getId))
     .groupBy(User::getStatus)
     .having(s.gt(s.count(User::getId), 10))
);
```
```sql
SELECT status, COUNT(id) FROM users GROUP BY status HAVING COUNT(id) > 10
```

```java
// Type-safe HAVING methods
List<Object[]> result = repository.findAll(s ->
    s.groupBy(User::getDepartment)
     .havingCount(User::getId, Op.GT, 5)
     .havingSum(User::getSalary, Op.GT, 100000)
     .havingAvg(User::getAge, Op.LT, 40)
);
```
```sql
SELECT department, COUNT(id), SUM(salary), AVG(age)
FROM users
GROUP BY department
HAVING COUNT(id) > 5 AND SUM(salary) > 100000 AND AVG(age) < 40
```

### Using QueryAggregates (Standalone)

For use in raw predicates or `having(BiFunction)`:

```java
List<Object[]> result = repository.findAll(s ->
    s.groupBy(User::getDepartment)
     .having((root, cb) -> cb.greaterThan(
         QueryAggregates.count(root, User::getId, cb), 5L))
);
```
```sql
SELECT department, COUNT(id) FROM users GROUP BY department HAVING COUNT(id) > 5
```

Available methods: `count()`, `countDistinct()`, `sum()`, `avg()`, `max()`, `min()`

## Database Function Calls

Use `func()` to call database functions in conditions:

```java
// Call a database function
List<User> users = repository.findAll(s ->
    s.func(User::getCreatedAt, "DATE_TRUNC", "year", Op.EQ, targetYear)
);
```
```sql
SELECT * FROM users WHERE DATE_TRUNC('year', created_at) = ?
```

## QuerySpec.of() Factory (v1.3.0+)

```java
// One-liner creation and configuration
QuerySpec<User> spec = QuerySpec.of(s -> s.eq(User::getStatus, "ACTIVE"));
```
```sql
SELECT * FROM users WHERE status = 'ACTIVE'
```

## Lambda Convenience Methods (v1.3.0+)

With `MyJpaRepository`, use Consumer-based Lambda overloads:

```java
// No need to create QuerySpec manually
List<User> users = userRepository.findAll(s -> s.eq(User::getStatus, "ACTIVE"));
Optional<User> user = userRepository.findOne(s -> s.eq(User::getId, 1L));
long count = userRepository.count(s -> s.eq(User::getStatus, "ACTIVE"));
boolean exists = userRepository.exists(s -> s.eq(User::getEmail, "john@example.com"));
```

Generated SQL:
```sql
-- findAll
SELECT * FROM users WHERE status = 'ACTIVE'

-- findOne
SELECT * FROM users WHERE id = 1 LIMIT 1

-- count
SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'

-- exists
SELECT CASE WHEN EXISTS(SELECT 1 FROM users WHERE email = 'john@example.com') THEN true ELSE false END
```
