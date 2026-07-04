# 投影查询

`ProjectionSpec` 提供类型安全的 DTO 投影查询。支持基于 Tuple 和基于构造函数的 DTO 投影，并支持 JOIN。

## 基本用法

### Tuple 投影

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(User::getEmail)
    .where(q -> q.eq(User::getStatus, "ACTIVE"));

TypedQuery<Tuple> query = spec.toTupleQuery(entityManager);
List<Tuple> results = query.getResultList();

// 访问结果
for (Tuple tuple : results) {
    String name = tuple.get(0, String.class);
    String email = tuple.get(1, String.class);
}
```

### DTO 构造函数投影

```java
// DTO 类，构造函数参数与选择的字段匹配
public class UserSummary {
    private String name;
    private String email;
    
    public UserSummary(String name, String email) {
        this.name = name;
        this.email = email;
    }
}

// 构建投影
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(User::getEmail)
    .asDto(UserSummary.class)
    .where(q -> q.eq(User::getStatus, "ACTIVE"));

TypedQuery<UserSummary> query = spec.toDtoQuery(entityManager);
List<UserSummary> results = query.getResultList();
```

## WHERE 条件

使用 `where()` 方法通过 `QuerySpec` 添加条件：

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(User::getAge)
    .where(q -> q
        .eq(User::getStatus, "ACTIVE")
        .gt(User::getAge, 18)
        .orderByAsc(User::getName));
```

## JOIN 支持

在投影查询中添加 JOIN：

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(Department::getName)  // 来自关联实体的字段
    .join(User::getDepartment, j -> j
        .eq(Department::getActive, true))
    .where(q -> q.eq(User::getStatus, "ACTIVE"));

TypedQuery<Tuple> query = spec.toTupleQuery(entityManager);
```

### LEFT JOIN

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .leftJoin(User::getDepartment, j -> j
        .eq(Department::getActive, true))
    .where(q -> q.eq(User::getStatus, "ACTIVE"));
```

## DISTINCT

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getDepartment)
    .distinct();
```

## 聚合函数

### COUNT

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .selectCount();

Tuple result = spec.toTupleQuery(entityManager).getSingleResult();
long count = result.get("count", Long.class);
```

### COUNT(DISTINCT)

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getDepartment)
    .selectCountDistinct()
    .groupBy(User::getDepartment);
```

### SUM、AVG、MAX、MIN

```java
ProjectionSpec<Order> spec = new ProjectionSpec<>(Order.class)
    .select(Order::getCustomerId)
    .selectSum(Order::getAmount)
    .selectAvg(Order::getAmount)
    .selectMax(Order::getAmount)
    .selectMin(Order::getAmount)
    .groupBy(Order::getCustomerId);

List<Tuple> results = spec.toTupleQuery(entityManager).getResultList();
for (Tuple tuple : results) {
    Long customerId = tuple.get("customerId", Long.class);
    BigDecimal totalAmount = tuple.get("sum_amount", BigDecimal.class);
    BigDecimal avgAmount = tuple.get("avg_amount", BigDecimal.class);
}
```

### GROUP BY 配合 HAVING

```java
ProjectionSpec<Order> spec = new ProjectionSpec<>(Order.class)
    .select(Order::getCustomerId)
    .selectCount()
    .groupBy(Order::getCustomerId)
    .having((root, cb) -> cb.greaterThan(cb.count(root), 5L));

List<Tuple> results = spec.toTupleQuery(entityManager).getResultList();
```

### 组合聚合与字段

当混合聚合字段和非聚合字段时，必须在 `groupBy()` 中包含所有非聚合字段：

```java
ProjectionSpec<Order> spec = new ProjectionSpec<>(Order.class)
    .select(Order::getCustomerId)
    .select(Order::getStatus)
    .selectCount()
    .selectSum(Order::getAmount)
    .groupBy(Order::getCustomerId, Order::getStatus)
    .having((root, cb) -> cb.greaterThan(cb.count(root), 3L))
    .orderByDesc(Order::getCustomerId);
```

## 排序

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(User::getCreatedAt)
    .orderByAsc(User::getName)
    .orderByDesc(User::getCreatedAt);
```

## 分页

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(User::getEmail)
    .where(q -> q.eq(User::getStatus, "ACTIVE"));

Page<Tuple> page = spec.findPage(entityManager, PageRequest.of(0, 20));
List<Tuple> content = page.getContent();
long total = page.getTotalElements();
```

## 流式结果

对于大结果集，使用流式处理避免全部加载到内存：

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(User::getEmail)
    .where(q -> q.eq(User::getStatus, "ACTIVE"));

try (Stream<Tuple> stream = spec.getResultStream(entityManager)) {
    stream.forEach(tuple -> {
        String name = tuple.get("name", String.class);
        String email = tuple.get("email", String.class);
        processUser(name, email);
    });
}
```

## 自定义最大返回行数

```java
// 限制返回 100 条结果
TypedQuery<Tuple> query = spec.toTupleQuery(entityManager, 100);

// 不限制（谨慎使用）
TypedQuery<Tuple> query = spec.toTupleQuery(entityManager, -1);
```

## 深度分页设置

为高偏移量查询配置警告和限制：

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .withDeepPaginationThreshold(50000)   // 偏移量达 5 万时警告
    .withDeepPaginationLimit(200000)      // 硬限制 20 万
    .where(q -> q.eq(User::getStatus, "ACTIVE"));
```

## 软删除过滤

`ProjectionSpec` 自动检测 `@SoftDelete` 字段并过滤已删除记录。可手动控制：

```java
// 显式启用（@SoftDelete 实体默认启用）
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .withSoftDeleteFilter();

// 软删除自动检测 — 同样过滤已删除记录
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName);
```

## 访问底层 QuerySpec

对于高级用例，直接访问底层 `QuerySpec`：

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName);

QuerySpec<User> conditions = spec.conditions();
conditions.eq(User::getStatus, "ACTIVE");
conditions.orderByAsc(User::getName);
```

## 完整示例

```java
public class OrderSummary {
    private String customerName;
    private String productName;
    private BigDecimal amount;
    private Instant orderDate;
    
    public OrderSummary(String customerName, String productName, 
                        BigDecimal amount, Instant orderDate) {
        this.customerName = customerName;
        this.productName = productName;
        this.amount = amount;
        this.orderDate = orderDate;
    }
}

// 构建投影查询
ProjectionSpec<Order> spec = new ProjectionSpec<>(Order.class)
    .select(Customer::getName)
    .select(Product::getName)
    .select(Order::getAmount)
    .select(Order::getCreatedAt)
    .asDto(OrderSummary.class)
    .join(Order::getCustomer, j -> j
        .eq(Customer::getCountry, "CN"))
    .join(Order::getProduct, j -> j
        .eq(Product::getCategory, "Electronics"))
    .where(q -> q
        .eq(Order::getStatus, "PAID")
        .between(Order::getCreatedAt, startDate, endDate)
        .orderByDesc(Order::getCreatedAt));

// 执行
TypedQuery<OrderSummary> query = spec.toDtoQuery(entityManager);
List<OrderSummary> results = query.getResultList();
```
