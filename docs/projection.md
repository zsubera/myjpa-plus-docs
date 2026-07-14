---
sidebar_position: 1
title: Projection Queries
---

# Projection Queries

Projection queries let you select specific fields instead of loading entire entities. Use `QuerySpec.select()` to choose fields.

:::info
Projection queries return `Tuple` or DTO objects (not entities). `MyJpaTemplate.find()` is recommended for type-safe results. `MyJpaRepository.findAll(spec)` also supports projection mode (auto-detected when QuerySpec has `select()`), but returns `List<T>` — manual conversion required.
:::

## Basic Usage

### Tuple Projection

**方式一（推荐）：通过 `MyJpaTemplate`——类型安全**
```java
@Autowired
private MyJpaTemplate template;

public List<Tuple> getUserNames() {
    QuerySpec<User> spec = new QuerySpec<User>()
        .select(User::getName, User::getEmail)
        .eq(User::getStatus, "ACTIVE");
    return template.find(User.class, spec);
}
```

**方式二：通过 `MyJpaRepository`——`QuerySpec` 进入投影模式时自动识别**
```java
public interface UserRepository extends MyJpaRepository<User, Long> {
}

// 使用处——QuerySpec 带 select() 时 findAll 自动执行投影
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName, User::getEmail)
    .eq(User::getStatus, "ACTIVE");
List<Tuple> results = (List<Tuple>) (List<?>) repository.findAll(spec);
```

Generated SQL:
```sql
SELECT name, email FROM users WHERE status = 'ACTIVE'
```

### DTO Constructor Projection

**方式一（推荐）：通过 `MyJpaTemplate`——类型安全**
```java
public record UserSummary(String name, String email) {}

QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName, User::getEmail)
    .asDto(UserSummary.class)
    .eq(User::getStatus, "ACTIVE");

List<UserSummary> results = template.find(User.class, spec);
```

**方式二：通过 `MyJpaRepository`——需自行转换**
```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName, User::getEmail)
    .asDto(UserSummary.class)
    .eq(User::getStatus, "ACTIVE");

List<UserSummary> results = (List<UserSummary>) (List<?>) repository.findAll(spec);
```

Generated SQL:
```sql
SELECT name, email FROM users WHERE status = 'ACTIVE'
```

## WHERE Conditions

Add conditions directly on the `QuerySpec`:

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName, User::getAge)
    .eq(User::getStatus, "ACTIVE")
    .gt(User::getAge, 18)
    .orderByAsc(User::getName);

List<Tuple> results = template.find(User.class, spec);
```

Generated SQL:
```sql
SELECT name, age FROM users WHERE status = 'ACTIVE' AND age > 18 ORDER BY name ASC
```

## JOIN Support

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName)
    .select(Department::getName)  // field from joined entity
    .join(User::getDepartment, j -> j
        .eq(Department::getActive, true))
    .eq(User::getStatus, "ACTIVE");

List<Tuple> results = template.find(User.class, spec);
```

Generated SQL:
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

Generated SQL:
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

Generated SQL:
```sql
SELECT DISTINCT department FROM users
```

## Aggregate Functions

### COUNT

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(QuerySpec.count());

List<Tuple> results = template.find(User.class, spec);
```

Generated SQL:
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

Generated SQL:
```sql
SELECT department, COUNT(DISTINCT department) FROM users GROUP BY department
```

### SUM, AVG, MAX, MIN

```java
QuerySpec<Order> spec = new QuerySpec<Order>()
    .select(Order::getCustomerId)
    .select(QuerySpec.sum(Order::getAmount))
    .select(QuerySpec.avg(Order::getAmount))
    .select(QuerySpec.max(Order::getAmount))
    .select(QuerySpec.min(Order::getAmount))
    .groupBy(Order::getCustomerId);
```

Generated SQL:
```sql
SELECT customer_id, SUM(amount), AVG(amount), MAX(amount), MIN(amount)
FROM orders
GROUP BY customer_id
```

### GROUP BY with HAVING

```java
QuerySpec<Order> spec = new QuerySpec<Order>()
    .select(Order::getCustomerId)
    .select(QuerySpec.count())
    .groupBy(Order::getCustomerId)
    .having((root, cb) -> cb.greaterThan(cb.count(root), 5L));
```

Generated SQL:
```sql
SELECT customer_id, COUNT(*)
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 5
```

### Combined Aggregates with Fields

When mixing aggregate and non-aggregate fields, include all non-aggregate fields in `groupBy()`:

```java
QuerySpec<Order> spec = new QuerySpec<Order>()
    .select(Order::getCustomerId, Order::getStatus)
    .select(QuerySpec.count())
    .select(QuerySpec.sum(Order::getAmount))
    .groupBy(Order::getCustomerId, Order::getStatus)
    .having((root, cb) -> cb.greaterThan(cb.count(root), 3L))
    .orderByDesc(Order::getCustomerId);
```

Generated SQL:
```sql
SELECT customer_id, status, COUNT(*), SUM(amount)
FROM orders
GROUP BY customer_id, status
HAVING COUNT(*) > 3
ORDER BY customer_id DESC
```

## Custom Column Aliases

Use `selectAs()` to override the default column name:

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .selectAs(User::getName, "fullName")
    .selectAs(User::getCreatedAt, "joinDate")
    .eq(User::getStatus, "ACTIVE");

List<Tuple> results = template.find(User.class, spec);
```

Generated SQL:
```sql
SELECT name AS fullName, created_at AS joinDate FROM users WHERE status = 'ACTIVE'
```

## DTO Name Matching

Constructor parameters are matched by **name** rather than position. Use Java records or compile with `-parameters` for automatic matching:

```java
// Record — component names auto-match field names
public record UserSummary(String name, String email, Integer age) {}

QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getAge)     // matched to "age"
    .select(User::getName)    // matched to "name"
    .select(User::getEmail)   // matched to "email"
    .asDto(UserSummary.class); // order doesn't matter!

List<UserSummary> results = template.find(User.class, spec);
```

Generated SQL:
```sql
SELECT age, name, email FROM users
```

For regular classes, add `-parameters` to javac:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <parameters>true</parameters>
    </configuration>
</plugin>
```

## Pagination

**方式一（推荐）：通过 `MyJpaTemplate`**
```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName, User::getEmail)
    .eq(User::getStatus, "ACTIVE");

Page<Tuple> page = template.projectionPage(User.class, spec, PageRequest.of(0, 20));
```

**方式二：通过 `MyJpaRepository`**
```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName, User::getEmail)
    .eq(User::getStatus, "ACTIVE");

Page<Tuple> page = (Page<Tuple>) (Page<?>) repository.findAll(spec, PageRequest.of(0, 20));
```

Generated SQL:
```sql
-- Count query
SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'

-- Data query
SELECT name, email FROM users WHERE status = 'ACTIVE' LIMIT 20 OFFSET 0
```

## Sorting

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName, User::getCreatedAt)
    .orderByAsc(User::getName)
    .orderByDesc(User::getCreatedAt);
```

Generated SQL:
```sql
SELECT name, created_at FROM users ORDER BY name ASC, created_at DESC
```

## Soft Delete Filter

Soft delete filtering is applied automatically for `@SoftDelete` entities when using `MyJpaTemplate`:

```java
QuerySpec<User> spec = new QuerySpec<User>()
    .select(User::getName)
    .eq(User::getStatus, "ACTIVE");

List<Tuple> results = template.find(User.class, spec);
```

Generated SQL (with @SoftDelete on `deleted` field):
```sql
SELECT name FROM users WHERE status = 'ACTIVE' AND deleted = false
```

## Complete Example

```java
@Service
public class OrderReportService {

    @Autowired
    private MyJpaTemplate template;

    public record OrderSummary(String customerName, String productName,
                                BigDecimal amount, Instant orderDate) {}

    public List<OrderSummary> findPaidOrders(Instant startDate, Instant endDate) {
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

        return template.find(Order.class, spec);
    }
}
```

Generated SQL:
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

