# Join Queries

MyJpa-Plus provides a fluent API for building type-safe JOIN queries with conditions.

## Basic JOIN

```java
// INNER JOIN with condition
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .join(User::getDepartment, j -> j
            .eq(Department::getName, "Engineering"))
        .toSpecification()
);
```

## LEFT JOIN

```java
// LEFT JOIN - includes users without departments
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .leftJoin(User::getDepartment, j -> j
            .eq(Department::getName, "Engineering")
            .isNull(Department::getName))
        .toSpecification()
);
```

## FETCH JOIN

Eagerly load associations to avoid N+1 queries:

```java
// FETCH JOIN
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .fetchJoin(User::getDepartment)
        .toSpecification()
);

// LEFT FETCH JOIN
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .leftFetchJoin(User::getDepartment)
        .toSpecification()
);
```

## Multiple Conditions in JOIN

```java
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .join(User::getDepartment, j -> j
            .eq(Department::getName, "Engineering")
            .gt(Department::getLevel, 3))
        .toSpecification()
);
```

## JOIN with OR Groups

```java
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .join(User::getDepartment, j -> j
            .or(or -> or
                .eq(Department::getName, "Engineering")
                .eq(Department::getName, "Product")))
        .toSpecification()
);
```

## Multiple JOINs

```java
List<Order> orders = orderRepository.findAll(
    new QuerySpec<Order>()
        .join(Order::getCustomer, j -> j
            .eq(Customer::getCountry, "CN"))
        .join(Order::getProduct, j -> j
            .eq(Product::getCategory, "Electronics"))
        .toSpecification()
);
```

## Manual API (Legacy)

If you prefer explicit begin/end calls:

```java
QuerySpec<User> qs = new QuerySpec<>();
JoinGroup<User, Department> jg = qs.join(User::getDepartment);
jg.eq(Department::getName, "Engineering");
jg.endJoin();
```

## JOIN Caching

MyJpa-Plus automatically caches JOINs by field path. If you JOIN the same field multiple times, only one SQL JOIN is generated:

```java
// Two conditions using the same JOIN
new QuerySpec<User>()
    .join(User::getDepartment, j -> j.eq(Department::getName, "Engineering"))
    .join(User::getDepartment, j -> j.gt(Department::getLevel, 3))
    .toSpecification()
// Generates: SELECT ... FROM user u INNER JOIN department d ON ... WHERE d.name = ? AND d.level > ?
```
