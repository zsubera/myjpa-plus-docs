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

## 子查询条件

子查询中可使用 QuerySpec 的所有条件：

```java
new QuerySpec<Customer>()
    .exists(Order.class, sub -> sub
        .eq(Order::getStatus, "PAID")
        .gt(Order::getAmount, 100)
        .between(Order::getCreatedAt, startDate, endDate)
        .like(Order::getRemark, "%紧急%"))
    .toSpecification()
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
