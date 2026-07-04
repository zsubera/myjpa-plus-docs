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

Generated SQL:
```sql
SELECT * FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.status = 'PAID')
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

Generated SQL:
```sql
SELECT * FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.status = 'PAID')
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

Generated SQL:
```sql
SELECT * FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id AND o.amount > 1000
)
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

Generated SQL:
```sql
SELECT * FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id AND o.amount > 1000
)
```

## Subquery Conditions

All QuerySpec conditions are available in subqueries:

```java
new QuerySpec<Customer>()
    .exists(Order.class, sub -> sub
        .eq(Order::getStatus, "PAID")
        .gt(Order::getAmount, 100)
        .between(Order::getCreatedAt, startDate, endDate)
        .like(Order::getRemark, "urgent"))
    .toSpecification()
```

Generated SQL:
```sql
SELECT * FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.status = 'PAID'
      AND o.amount > 100
      AND o.created_at BETWEEN ? AND ?
      AND o.remark LIKE '%urgent%'
)
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

Generated SQL:
```sql
SELECT * FROM customers c
WHERE EXISTS (SELECT o.id FROM orders o WHERE o.status = 'PAID')
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

Generated SQL:
```sql
SELECT * FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = ? AND o.amount > 1000
)
```
