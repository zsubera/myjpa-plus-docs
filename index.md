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
  - icon: 🔒
    title: Lambda Type Safety
    details: Use method references like Entity::getField instead of hardcoded field name strings. Catch errors at compile time, not runtime.
  - icon: ⛓️
    title: Fluent API
    details: Chainable AND/OR condition combinations with clean, readable syntax. No more begin/end boilerplate.
  - icon: 🔗
    title: JOIN Support
    details: Inner/Left joins with nested conditions, sub-joins, and join caching. Consumer-based API auto-closes groups.
  - icon: 🔍
    title: EXISTS Subqueries
    details: Correlated subqueries with type-safe conditions. Full support for EXISTS and NOT EXISTS.
  - icon: 🧩
    title: OR/NOT Groups
    details: Arbitrarily nested OR groups within AND groups and vice versa. NOT condition groups for negation.
  - icon: 🛡️
    title: Null Safe
    details: eq(field, null) automatically becomes IS NULL. All lambda parameters are null-checked with clear error messages.
---

## Quick Example

```java
// Simple query with null safety
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .eq(User::getStatus, "ACTIVE")
        .eq(User::getDeletedAt, null)  // → IS NULL
        .toSpecification()
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
    <version>0.1.0-SNAPSHOT</version>
</dependency>
```

<div class="tip custom-block" style="padding-top: 8px">
  <p class="custom-block-title">Requirements</p>
  <p>Java 17+ · Spring Boot 3.x · Spring Data JPA</p>
</div>
