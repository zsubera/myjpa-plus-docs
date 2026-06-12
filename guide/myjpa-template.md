# MyJpaTemplate

`MyJpaTemplate` is a convenience class that provides a simpler API for common operations.

## Configuration

MyJpaTemplate is auto-configured. Just inject it:

```java
@Autowired
private MyJpaTemplate template;
```

## Query Operations

### Find by ID

```java
Optional<User> user = template.findById(User.class, userId);
```

### Find One

```java
Optional<User> user = template.findOne(User.class,
    new QuerySpec<User>().eq(User::getEmail, "john@example.com"));
```

### Find All

```java
// Using QuerySpec
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"));

// Limit results
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"), 100);

// With EntityGraph
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    EntityGraphHelper.forEntity(User.class).add("department"));

// With EntityGraph and limit
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    EntityGraphHelper.forEntity(User.class).add("department"), 100);
```

### Find with Raw Specification

```java
// Using raw Specification
List<User> users = template.find(User.class,
    (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"));

// With limit
List<User> users = template.find(User.class,
    (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"), 100);
```

### Streaming Results

For large result sets without memory limits:

```java
// Stream all results
try (Stream<User> stream = template.findAllStream(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"))) {
    stream.forEach(user -> process(user));
}

// Stream with EntityGraph
try (Stream<User> stream = template.findAllStream(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    EntityGraphHelper.forEntity(User.class).add("department"))) {
    stream.forEach(user -> process(user));
}
```

### Pagination

```java
// Using Pageable with QuerySpec
Page<User> page = template.findAll(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    PageRequest.of(0, 20, Sort.by("name")));

// With raw Specification
Page<User> page = template.findPage(User.class,
    (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"),
    PageRequest.of(0, 20));
```

## Update Operations

```java
int count = template.update(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .execute(em);

// Batch update with size limit
int count = template.executeBatch(
    template.update(User.class)
        .set(User::setStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    100
);
```

## Delete Operations

```java
int count = template.delete(User.class)
    .eq(User::getStatus, "DELETED")
    .execute(em);

// Batch delete with size limit
int count = template.executeBatch(
    template.delete(User.class)
        .eq(User::getStatus, "EXPIRED"),
    100
);
```

## EntityGraph

```java
// Create EntityGraph helper
EntityGraphHelper<User> graph = EntityGraphHelper.forEntity(User.class)
    .add("department")
    .add("roles.permissions");

// Chain nested paths
EntityGraphHelper<User> graph = EntityGraphHelper.forEntity(User.class)
    .add("department")
    .nest("company");  // equivalent to add("department.company")

// Use in query
List<User> users = template.findAll(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"), graph);
```

## Constants

```java
// Default max results for findAll/find
MyJpaTemplate.DEFAULT_MAX_RESULTS  // 10000

// Deep pagination warning threshold
MyJpaTemplate.DEFAULT_DEEP_PAGINATION_OFFSET_THRESHOLD  // 100000
```

## Custom Configuration

```java
// MyJpaTemplate accepts custom max results and pagination threshold
MyJpaTemplate template = new MyJpaTemplate(5000, 50000);
```
