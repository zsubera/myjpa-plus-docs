# 投影查询

投影查询允许你只选择特定字段，而不是加载整个实体。使用 `QuerySpec.select()` 选择字段，通过 `MyJpaTemplate.find()` 执行投影。

## 基本用法

### Tuple 投影

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName, User::getEmail)
    .eq(User::getStatus, "ACTIVE");

List<Tuple> results = template.find(User.class, spec);
```

生成的 SQL：
```sql
SELECT name, email FROM users WHERE status = 'ACTIVE'
```

### DTO 构造函数投影

```java
// DTO 类 — 构造函数参数按名称匹配（见"DTO 名称匹配"）
public record UserSummary(String name, String email) {}

QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName, User::getEmail)
    .asDto(UserSummary.class)
    .eq(User::getStatus, "ACTIVE");

List<UserSummary> results = template.find(User.class, spec);
```

生成的 SQL：
```sql
SELECT name, email FROM users WHERE status = 'ACTIVE'
```

## WHERE 条件

直接在 `QuerySpec` 上添加条件：

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName, User::getAge)
    .eq(User::getStatus, "ACTIVE")
    .gt(User::getAge, 18)
    .orderByAsc(User::getName);

List<Tuple> results = template.find(User.class, spec);
```

生成的 SQL：
```sql
SELECT name, age FROM users WHERE status = 'ACTIVE' AND age > 18 ORDER BY name ASC
```

## JOIN 支持

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName)
    .select(Department::getName)  // 来自关联实体的字段
    .join(User::getDepartment, j -> j
        .eq(Department::getActive, true))
    .eq(User::getStatus, "ACTIVE");

List<Tuple> results = template.find(User.class, spec);
```

生成的 SQL：
```sql
SELECT u.name, d.name
FROM users u
INNER JOIN departments d ON u.department_id = d.id
WHERE d.active = true AND u.status = 'ACTIVE'
```

### LEFT JOIN

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName)
    .leftJoin(User::getDepartment, j -> j
        .eq(Department::getActive, true))
    .eq(User::getStatus, "ACTIVE");
```

生成的 SQL：
```sql
SELECT u.name
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE d.active = true AND u.status = 'ACTIVE'
```

## DISTINCT

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getDepartment)
    .distinct();
```

生成的 SQL：
```sql
SELECT DISTINCT department FROM users
```

## 聚合函数

### COUNT

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(QuerySpec.count());

List<Tuple> results = template.find(User.class, spec);
```

生成的 SQL：
```sql
SELECT COUNT(*) FROM users
```

### COUNT(DISTINCT)

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getDepartment)
    .select(QuerySpec.countDistinct())
    .groupBy(User::getDepartment);
```

生成的 SQL：
```sql
SELECT department, COUNT(DISTINCT department) FROM users GROUP BY department
```

### SUM、AVG、MAX、MIN

```java
QuerySpec<Order> spec = new QuerySpec<Order>()
    .select(Order::getCustomerId)
    .select(QuerySpec.sum(Order::getAmount))
    .select(QuerySpec.avg(Order::getAmount))
    .select(QuerySpec.max(Order::getAmount))
    .select(QuerySpec.min(Order::getAmount))
    .groupBy(Order::getCustomerId);
```

生成的 SQL：
```sql
SELECT customer_id, SUM(amount), AVG(amount), MAX(amount), MIN(amount)
FROM orders
GROUP BY customer_id
```

### GROUP BY 配合 HAVING

```java
QuerySpec<Order> spec = new QuerySpec<Order>()
    .select(Order::getCustomerId)
    .select(QuerySpec.count())
    .groupBy(Order::getCustomerId)
    .having((root, cb) -> cb.greaterThan(cb.count(root), 5L));
```

生成的 SQL：
```sql
SELECT customer_id, COUNT(*)
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 5
```

### 组合聚合与字段

当混合聚合字段和非聚合字段时，必须在 `groupBy()` 中包含所有非聚合字段：

```java
QuerySpec<Order> spec = new QuerySpec<Order>()
    .select(Order::getCustomerId, Order::getStatus)
    .select(QuerySpec.count())
    .select(QuerySpec.sum(Order::getAmount))
    .groupBy(Order::getCustomerId, Order::getStatus)
    .having((root, cb) -> cb.greaterThan(cb.count(root), 3L))
    .orderByDesc(Order::getCustomerId);
```

生成的 SQL：
```sql
SELECT customer_id, status, COUNT(*), SUM(amount)
FROM orders
GROUP BY customer_id, status
HAVING COUNT(*) > 3
ORDER BY customer_id DESC
```

## 自定义列别名

使用 `selectAs()` 覆盖默认列名：

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .selectAs(User::getName, "fullName")
    .selectAs(User::getCreatedAt, "joinDate")
    .eq(User::getStatus, "ACTIVE");

List<Tuple> results = template.find(User.class, spec);
```

生成的 SQL：
```sql
SELECT name AS fullName, created_at AS joinDate FROM users WHERE status = 'ACTIVE'
```

## DTO 按名称匹配

构造函数参数按**名称**匹配而非按位置。使用 Java record 或编译时添加 `-parameters` 即可自动匹配：

```java
// Record — 组件名称自动匹配字段名
public record UserSummary(String name, String email, Integer age) {}

QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getAge)     // 匹配到 "age"
    .select(User::getName)    // 匹配到 "name"
    .select(User::getEmail)   // 匹配到 "email"
    .asDto(UserSummary.class); // 顺序无所谓！

List<UserSummary> results = template.find(User.class, spec);
```

生成的 SQL：
```sql
SELECT age, name, email FROM users
```

普通 class 需添加 `-parameters` 编译参数：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <parameters>true</parameters>
    </configuration>
</plugin>
```

## 分页

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName, User::getEmail)
    .eq(User::getStatus, "ACTIVE");

Page<Tuple> page = template.projectionPage(User.class, spec, PageRequest.of(0, 20));
```

生成的 SQL：
```sql
-- 统计查询
SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'

-- 数据查询
SELECT name, email FROM users WHERE status = 'ACTIVE' LIMIT 20 OFFSET 0
```

## 排序

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName, User::getCreatedAt)
    .orderByAsc(User::getName)
    .orderByDesc(User::getCreatedAt);
```

生成的 SQL：
```sql
SELECT name, created_at FROM users ORDER BY name ASC, created_at DESC
```

## 软删除过滤

使用 `MyJpaTemplate` 时，`@SoftDelete` 实体的软删除过滤自动应用：

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName)
    .eq(User::getStatus, "ACTIVE");

List<Tuple> results = template.find(User.class, spec);
```

生成的 SQL（假设 `@SoftDelete` 在 `deleted` 字段上）：
```sql
SELECT name FROM users WHERE status = 'ACTIVE' AND deleted = false
```

## 完整示例

```java
public record OrderSummary(String customerName, String productName,
                            BigDecimal amount, Instant orderDate) {}

QuerySpec<Order> spec = new QuerySpec<Order>()
    .select(Customer::getName)
    .select(Product::getName)
    .select(Order::getAmount)
    .select(Order::getCreatedAt)
    .asDto(OrderSummary.class)
    .join(Order::getCustomer, j -> j
        .eq(Customer::getCountry, "CN"))
    .join(Order::getProduct, j -> j
        .eq(Product::getCategory, "Electronics"))
    .eq(Order::getStatus, "PAID")
    .between(Order::getCreatedAt, startDate, endDate)
    .orderByDesc(Order::getCreatedAt);

List<OrderSummary> results = template.find(Order.class, spec);
```

生成的 SQL：
```sql
SELECT c.name, p.name, o.amount, o.created_at
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
INNER JOIN products p ON o.product_id = p.id
WHERE c.country = 'CN'
  AND p.category = 'Electronics'
  AND o.status = 'PAID'
  AND o.created_at BETWEEN ? AND ?
ORDER BY o.created_at DESC
```
