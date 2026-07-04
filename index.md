---
layout: home

hero:
  name: MyJpa-Plus
  text: Type-safe JPA Query Builder
  tagline: Build dynamic queries with lambda expressions instead of magic strings
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/zsubera/myjpa-plus

features:
  - icon: 🔍
    title: Type-Safe Queries
    details: Lambda-based QuerySpec with eq/ne/gt/lt/like/in/between. Catch field name errors at compile time.
  - icon: ⚡
    title: Bulk Operations
    details: Type-safe UPDATE/DELETE with row limits, batch execution, and conditional SET clauses.
  - icon: 🔀
    title: UPSERT / MERGE
    details: INSERT ... ON CONFLICT for PostgreSQL, MySQL, Oracle, SQL Server. Multi-row batch optimization.
  - icon: 📊
    title: Projections & Aggregates
    details: DTO constructor projection, Tuple queries, GROUP BY/HAVING, and standalone aggregate functions.
  - icon: 🌳
    title: CTE Support
    details: Non-recursive and recursive Common Table Expressions with parameterized queries.
  - icon: 🔐
    title: Encryption & Masking
    details: AES-GCM field encryption via @Encrypt. Phone/email/ID masking via @Mask.
  - icon: 🗑️
    title: Soft Delete
    details: Boolean, Enum, Integer, String soft delete types. Auto-filtering, bulk executor, virtual thread support.
  - icon: 🔄
    title: Optimistic Lock Retry
    details: "@RetryOnOptimisticLock with exponential backoff. Automatic retry on OptimisticLockException."
  - icon: 📈
    title: Slow Query Monitoring
    details: DataSource proxy for automatic slow SQL detection. Configurable threshold.
  - icon: 🔌
    title: Pluggable Cache
    details: CacheAdapter SPI for Redis/Caffeine/Hazelcast. Query result caching with TTL and prefix eviction.
---

## Quick Example

```java
// Simple query with null safety (toSpecification() is optional)
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .eq(User::getStatus, "ACTIVE")
        .eq(User::getDeletedAt, null)  // → IS NULL
);

// OR conditions with Consumer pattern
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .like(User::getName, "%John%")
        .or(g -> g.eq(User::getRole, "ADMIN").eq(User::getRole, "MODERATOR"))
        .toSpecification()
);

// JOIN with nested conditions
List<Order> orders = orderRepository.findAll(
    new QuerySpec<Order>()
        .join(Order::getCustomer, j -> j
            .eq(Customer::getCountry, "CN")
            .gt(Customer::getLevel, 3))
        .contains(Order::getRemark, "urgent")
        .toSpecification()
);
```

## Installation

```xml
<dependency>
    <groupId>io.github.zsubera</groupId>
    <artifactId>myjpa-plus</artifactId>
    <version>1.3.0</version>
</dependency>
```

<div class="tip custom-block" style="padding-top: 8px">
  <p class="custom-block-title">Requirements</p>
  <p>Java 17+ · Spring Boot 3.x · Spring Data JPA</p>
</div>
