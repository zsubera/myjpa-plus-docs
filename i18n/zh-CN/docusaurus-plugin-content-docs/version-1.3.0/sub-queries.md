---
sidebar_position: 1
title: 子查询
---

# 子查询

MyJpa-Plus 支持 EXISTS 和 NOT EXISTS 子查询，并提供类型安全条件。

## EXISTS

```java
// 查找下过订单的客户
List<Customer> customers = customerRepository.findAll(
    new QuerySpec<Customer>()
        .exists(Order.class, sub -> sub
            .eq(Order::getStatus, "PAID"))
        .toSpecification()
);
```

生成的 SQL：
```sql
SELECT * FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.status = 'PAID')
```

## NOT EXISTS

```java
// 查找没有下过订单的客户
List<Customer> customers = customerRepository.findAll(
    new QuerySpec<Customer>()
        .notExists(Order.class, sub -> sub
            .eq(Order::getStatus, "PAID"))
        .toSpecification()
);
```

生成的 SQL：
```sql
SELECT * FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.status = 'PAID')
```

## 关联子查询

使用 `correlated()` 引用外部查询：

```java
// 查找有超过 1000 元订单的客户
List<Customer> customers = customerRepository.findAll(
    new QuerySpec<Customer>()
        .exists(Order.class, sub -> sub
            .where(r -> cb.equal(r.get("customer").get("id"), 
                sub.<Customer>correlated().get("id")))
            .gt(Order::getAmount, 1000))
        .toSpecification()
);
```

生成的 SQL：
```sql
SELECT * FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id AND o.amount > 1000
)
```

## correlatedEq 快捷方式

常见关联模式的快捷方式：

```java
List<Customer> customers = customerRepository.findAll(
    new QuerySpec<Customer>()
        .exists(Order.class, sub -> sub
            .correlatedEq(Customer::getId, Order::getCustomerId)
            .gt(Order::getAmount, 1000))
        .toSpecification()
);
```

生成的 SQL：
```sql
SELECT * FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id AND o.amount > 1000
)
```

## 子查询条件

子查询中可使用 QuerySpec 的所有条件：

```java
new QuerySpec<Customer>()
    .exists(Order.class, sub -> sub
        .eq(Order::getStatus, "PAID")
        .gt(Order::getAmount, 100)
        .between(Order::getCreatedAt, startDate, endDate)
        .like(Order::getRemark, "紧急"))
    .toSpecification()
```

生成的 SQL：
```sql
SELECT * FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.status = 'PAID'
      AND o.amount > 100
      AND o.created_at BETWEEN ? AND ?
      AND o.remark LIKE '%紧急%'
)
```

## Select 子句

自定义子查询的选择：

```java
new QuerySpec<Customer>()
    .exists(Order.class, sub -> sub
        .select(Order::getId)
        .eq(Order::getStatus, "PAID"))
    .toSpecification()
```

生成的 SQL：
```sql
SELECT * FROM customers c
WHERE EXISTS (SELECT o.id FROM orders o WHERE o.status = 'PAID')
```

## 子查询中的原始谓词

对于复杂的关联条件：

```java
new QuerySpec<Customer>()
    .exists(Order.class, sub -> sub
        .where(root -> cb.and(
            cb.equal(root.get("customer").get("id"), customerId),
            cb.greaterThan(root.get("amount"), 1000)
        )))
    .toSpecification()
```

生成的 SQL：
```sql
SELECT * FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = ? AND o.amount > 1000
)
```

