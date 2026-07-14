---
sidebar_position: 1
title: 关联查询
---

# 关联查询

MyJpa-Plus 提供流式 API 来构建带类型安全条件的 JOIN 查询。

## 基本 JOIN

```java
// INNER JOIN 带条件
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .join(User::getDepartment, j -> j
            .eq(Department::getName, "Engineering"))
        .toSpecification()
);
```

生成的 SQL：
```sql
SELECT u.* FROM users u
INNER JOIN departments d ON u.department_id = d.id
WHERE d.name = 'Engineering'
```

## LEFT JOIN

```java
// LEFT JOIN - 包含没有部门的用户
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .leftJoin(User::getDepartment, j -> j
            .or(o -> o
                .eq(Department::getName, "Engineering")
                .isNull(Department::getName)))
        .toSpecification()
);
```

生成的 SQL：
```sql
SELECT u.* FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE d.name = 'Engineering' OR d.name IS NULL
```

## FETCH JOIN

急切加载关联关系，避免 N+1 查询：

```java
// FETCH JOIN
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .fetchJoin(User::getDepartment)
        .toSpecification()
);
```

生成的 SQL：
```sql
SELECT u.*, d.* FROM users u
INNER JOIN departments d ON u.department_id = d.id
```

```java
// LEFT FETCH JOIN
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .leftFetchJoin(User::getDepartment)
        .toSpecification()
);
```

生成的 SQL：
```sql
SELECT u.*, d.* FROM users u
LEFT JOIN departments d ON u.department_id = d.id
```

## JOIN 中的多条件

```java
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .join(User::getDepartment, j -> j
            .eq(Department::getName, "Engineering")
            .gt(Department::getLevel, 3))
        .toSpecification()
);
```

生成的 SQL：
```sql
SELECT u.* FROM users u
INNER JOIN departments d ON u.department_id = d.id
WHERE d.name = 'Engineering' AND d.level > 3
```

## JOIN 与 OR 分组

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

生成的 SQL：
```sql
SELECT u.* FROM users u
INNER JOIN departments d ON u.department_id = d.id
WHERE d.name = 'Engineering' OR d.name = 'Product'
```

## 多个 JOIN

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

生成的 SQL：
```sql
SELECT o.* FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
INNER JOIN products p ON o.product_id = p.id
WHERE c.country = 'CN' AND p.category = 'Electronics'
```

## 手动 API（旧式）

如果你更喜欢显式的 begin/end 调用：

```java
QuerySpec<User> qs = new QuerySpec<>();
JoinGroup<User, Department> jg = qs.join(User::getDepartment);
jg.eq(Department::getName, "Engineering");
jg.endJoin();
```

生成的 SQL：
```sql
SELECT u.* FROM users u
INNER JOIN departments d ON u.department_id = d.id
WHERE d.name = 'Engineering'
```

## JOIN 缓存

MyJpa-Plus 自动按字段路径缓存 JOIN。如果你多次 JOIN 同一个字段，只会生成一个 SQL JOIN：

```java
// 两个条件使用同一个 JOIN
new QuerySpec<User>()
    .join(User::getDepartment, j -> j.eq(Department::getName, "Engineering"))
    .join(User::getDepartment, j -> j.gt(Department::getLevel, 3))
    .toSpecification()
```

生成的 SQL：
```sql
SELECT u.* FROM users u
INNER JOIN departments d ON u.department_id = d.id
WHERE d.name = 'Engineering' AND d.level > 3
```

