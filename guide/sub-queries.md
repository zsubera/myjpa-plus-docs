# Sub Queries

MyJpa-Plus supports EXISTS and NOT EXISTS subqueries with type-safe conditions.

## EXISTS

```java
// Find customers who have placed orders
List<Customer> customers = customerRepository.findAll(
    new QuerySpec<Customer>()
        .exists(Order.class, sub -> sub
            .eq(Order::getStatus, "PAID"))
        .toSpecification()
);
```

## NOT EXISTS

```java
// Find customers who have not placed orders
List<Customer> customers = customerRepository.findAll(
    new QuerySpec<Customer>()
        .notExists(Order.class, sub -> sub
            .eq(Order::getStatus, "PAID"))
        .toSpecification()
);
```

## Correlated Subqueries

Use `correlated()` to reference the outer query:

```java
// Find customers with orders over 1000
List<Customer> customers = customerRepository.findAll(
    new QuerySpec<Customer>()
        .exists(Order.class, sub -> sub
            .where(r -> cb.equal(r.get("customer").get("id"), 
                sub.<Customer>correlated().get("id")))
            .gt(Order::getAmount, 1000))
        .toSpecification()
);
```

## correlatedEq Shortcut

Shortcut for common correlation patterns:

```java
List<Customer> customers = customerRepository.findAll(
    new QuerySpec<Customer>()
        .exists(Order.class, sub -> sub
            .correlatedEq(Customer::getId, Order::getCustomerId)
            .gt(Order::getAmount, 1000))
        .toSpecification()
);
```

## Subquery Conditions

All QuerySpec conditions are available in subqueries:

```java
new QuerySpec<Customer>()
    .exists(Order.class, sub -> sub
        .eq(Order::getStatus, "PAID")
        .gt(Order::getAmount, 100)
        .between(Order::getCreatedAt, startDate, endDate)
        .like(Order::getRemark, "%urgent%"))
    .toSpecification()
```

## Select Clause

Customize the subquery selection:

```java
new QuerySpec<Customer>()
    .exists(Order.class, sub -> sub
        .select(Order::getId)
        .eq(Order::getStatus, "PAID"))
    .toSpecification()
```

## Raw Predicate in Subqueries

For complex correlation conditions:

```java
new QuerySpec<Customer>()
    .exists(Order.class, sub -> sub
        .where(root -> cb.and(
            cb.equal(root.get("customer").get("id"), customerId),
            cb.greaterThan(root.get("amount"), 1000)
        )))
    .toSpecification()
```
