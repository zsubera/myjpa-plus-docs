# MyJpaTemplate

`MyJpaTemplate` 是一个便利类，为常见操作提供更简单的 API。

## 配置

MyJpaTemplate 是自动配置的，直接注入即可：

```java
@Autowired
private MyJpaTemplate template;
```

## 查询操作

### 查找所有

```java
// 使用 QuerySpec
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"));

// 限制返回数量
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"), 100);

// 使用 EntityGraph
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    EntityGraphHelper.forEntity(User.class).add("department"));

// 使用 EntityGraph 和限制
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    EntityGraphHelper.forEntity(User.class).add("department"), 100);
```

### 使用原始 Specification 查找

```java
// 使用原始 Specification
List<User> users = template.find(User.class,
    (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"));

// 带限制
List<User> users = template.find(User.class,
    (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"), 100);
```

### 流式结果

对于大型结果集，无内存限制：

```java
// 流式所有结果
try (Stream<User> stream = template.findAllStream(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"))) {
    stream.forEach(user -> process(user));
}

// 带 EntityGraph 的流式
try (Stream<User> stream = template.findAllStream(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    EntityGraphHelper.forEntity(User.class).add("department"))) {
    stream.forEach(user -> process(user));
}
```

### 分页

```java
// 使用 Pageable
Page<User> page = template.findAll(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    PageRequest.of(0, 20, Sort.by("name")));

// 使用原始 Specification
Page<User> page = template.findPage(User.class,
    (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"),
    PageRequest.of(0, 20));
```

## 更新操作

```java
int count = template.update(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .execute(em);

// 批量更新，带大小限制
int count = template.executeBatch(
    template.update(User.class)
        .set(User::setStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    100
);
```

## 删除操作

```java
int count = template.delete(User.class)
    .eq(User::getStatus, "DELETED")
    .execute(em);

// 批量删除，带大小限制
int count = template.executeBatch(
    template.delete(User.class)
        .eq(User::getStatus, "EXPIRED"),
    100
);
```

## EntityGraph

```java
// 创建 EntityGraph 辅助器
EntityGraphHelper<User> graph = EntityGraphHelper.forEntity(User.class)
    .add("department")
    .add("roles.permissions");

// 在查询中使用
List<User> users = template.findAll(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"), graph);
```

## 常量

```java
// findAll/find 的默认最大结果数
MyJpaTemplate.DEFAULT_MAX_RESULTS  // 10000

// 深度分页警告阈值
MyJpaTemplate.DEFAULT_DEEP_PAGINATION_OFFSET_THRESHOLD  // 100000
```

## 自定义配置

```java
// MyJpaTemplate 接受自定义的最大结果数和分页阈值
MyJpaTemplate template = new MyJpaTemplate(5000, 50000);
```
