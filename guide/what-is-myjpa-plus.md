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
QuerySpec<User> spec = new QuerySpec<User>()
    .eq(User::getStatus, "ACTIVE")      // Compile-time checked!
    .like(User::getName, "%John%")      // No magic strings!
    .gt(User::getAge, 18);
```

## Key Benefits

| Feature | Traditional JPA | MyJpa-Plus |
|---------|----------------|------------|
| Field references | Strings (`"name"`) | Method refs (`User::getName`) |
| Type safety | Runtime errors | Compile-time errors |
| Null handling | Manual checks | Automatic IS NULL |
| OR/NOT groups | Complex nesting | Clean Consumer API |
| JOIN conditions | Verbose code | Fluent builder |

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
