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
