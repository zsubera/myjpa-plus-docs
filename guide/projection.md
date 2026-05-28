# Projection Queries

`ProjectionSpec` provides type-safe DTO projection queries. It supports both Tuple-based and constructor-based DTO projection with JOIN support.

## Basic Usage

### Tuple Projection

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(User::getEmail)
    .where(q -> q.eq(User::getStatus, "ACTIVE"));

TypedQuery<Tuple> query = spec.toTupleQuery(entityManager);
List<Tuple> results = query.getResultList();

// Access results
for (Tuple tuple : results) {
    String name = tuple.get(0, String.class);
    String email = tuple.get(1, String.class);
}
```

### DTO Constructor Projection

```java
// DTO class with constructor matching selected fields
public class UserSummary {
    private String name;
    private String email;
    
    public UserSummary(String name, String email) {
        this.name = name;
        this.email = email;
    }
}

// Build projection
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(User::getEmail)
    .asDto(UserSummary.class)
    .where(q -> q.eq(User::getStatus, "ACTIVE"));

TypedQuery<UserSummary> query = spec.toDtoQuery(entityManager);
List<UserSummary> results = query.getResultList();
```

## WHERE Conditions

Use the `where()` method to add conditions via `QuerySpec`:

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(User::getAge)
    .where(q -> q
        .eq(User::getStatus, "ACTIVE")
        .gt(User::getAge, 18)
        .orderByAsc(User::getName));
```

## JOIN Support

Add JOINs to projection queries:

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(Department::getName)  // field from joined entity
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

## Sorting

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(User::getCreatedAt)
    .orderByAsc(User::getName)
    .orderByDesc(User::getCreatedAt);
```

## Pagination

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName)
    .select(User::getEmail)
    .where(q -> q.eq(User::getStatus, "ACTIVE"));

Page<Tuple> page = spec.findPage(entityManager, PageRequest.of(0, 20));
List<Tuple> content = page.getContent();
long total = page.getTotalElements();
```

## Accessing Underlying QuerySpec

For advanced use cases, access the underlying `QuerySpec` directly:

```java
ProjectionSpec<User> spec = new ProjectionSpec<>(User.class)
    .select(User::getName);

QuerySpec<User> conditions = spec.conditions();
conditions.eq(User::getStatus, "ACTIVE");
conditions.orderByAsc(User::getName);
```

## Complete Example

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

// Build projection query
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
        .orderByDesc(Order::getCreatedAt))
    .orderByDesc(Order::getCreatedAt);

// Execute
TypedQuery<OrderSummary> query = spec.toDtoQuery(entityManager);
List<OrderSummary> results = query.getResultList();
```
