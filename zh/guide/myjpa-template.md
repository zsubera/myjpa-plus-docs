# MyJpaTemplate

`MyJpaTemplate` 是一个便利类，为常见操作提供更简单的 API。

## 配置

MyJpaTemplate 是自动配置的，直接注入即可：

```java
@Autowired
private MyJpaTemplate template;
```

## 查询操作

### Lambda 便捷方法

```java
// 无需手动创建 QuerySpec
List<User> users = template.findAll(User.class, s -> s.eq(User::getStatus, "ACTIVE"));
Optional<User> user = template.findOne(User.class, s -> s.eq(User::getId, 1L));
long count = template.count(User.class, s -> s.eq(User::getStatus, "ACTIVE"));
boolean exists = template.exists(User.class, s -> s.eq(User::getEmail, "john@example.com"));
```

### 根据 ID 查找

```java
Optional<User> user = template.findById(User.class, userId);
```

### 查找单个

```java
Optional<User> user = template.findOne(User.class,
    new QuerySpec<User>().eq(User::getEmail, "john@example.com"));
```

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
// 使用 Pageable 和 QuerySpec
Page<User> page = template.findAll(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    PageRequest.of(0, 20, Sort.by("name")));

// 使用原始 Specification
Page<User> page = template.findPage(User.class,
    (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"),
    PageRequest.of(0, 20));

// Slice — 不执行 count 查询（更快，仅需 hasNext 时使用）
Slice<User> slice = template.findSlice(User.class,
    (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"),
    PageRequest.of(0, 20));
```

### 按 ID 批量查询

自动将大型 ID 列表拆分为 IN 子句批次：

```java
// 按 ID 查询（自动拆分 IN 子句，兼容 Oracle）
List<User> users = template.findAllById(User.class, List.of(1L, 2L, 3L, 1000L));

// 按 ID 查询未删除的记录
List<User> users = template.findNotDeletedAllById(User.class, List.of(1L, 2L, 3L));
```

## 更新操作

```java
int count = template.update(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .execute(em);

// 自动管理事务
int count = template.update(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .executeInTransaction(em);

// 批量更新，带大小限制
int count = template.executeBatch(
    template.update(User.class)
        .set(User::getStatus, "PROCESSED")
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

## UPSERT 操作

```java
// 通过模板执行基本 upsert
int count = template.execute(
    new MergeSpec<>(User.class)
        .withEntity(user)
        .onConflict(User::getEmail)
        .updateOnConflict(User::getName, User::getUpdatedAt)
);

// 批量 upsert
int count = template.executeBatch(
    new MergeSpec<>(User.class)
        .onConflict(User::getEmail),
    users,
    100  // 批次大小
);
```

## 独立事务批量操作

以独立事务方式批量处理大型数据集：

```java
// 批量更新 — 每批独立提交
MyJpaTemplate.BatchResult result = template.executeBatchInSeparateTransactions(
    template.update(User.class)
        .set(User::getStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    500
);

if (!result.isSuccess()) {
    log.error("第 {} 批失败: {}", result.getFailedBatchIndex(), result.getFailureCause());
}
```

### 失败策略

```java
// CONTINUE — 某批失败时继续处理后续批次
MyJpaTemplate.BatchResult result = template.executeBatchInSeparateTransactions(
    template.update(User.class)
        .set(User::getStatus, "DONE")
        .eq(User::getStatus, "PENDING"),
    500,
    MyJpaTemplate.BatchFailureStrategy.CONTINUE
);

// ABORT — 首次失败即停止
MyJpaTemplate.BatchResult result = template.executeBatchInSeparateTransactions(
    template.delete(LogEntry.class)
        .lt(LogEntry::getTimestamp, cutoffDate),
    500,
    MyJpaTemplate.BatchFailureStrategy.ABORT
);
```

### 行数限制操作

```java
// 带最大行数的更新
int count = template.executeWithMaxRows(
    template.update(User.class)
        .set(User::getStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    1000
);

// 带最大行数的删除
int count = template.executeWithMaxRows(
    template.delete(LogEntry.class)
        .lt(LogEntry::getTimestamp, cutoffDate),
    5000
);
```

## 批量保存

```java
// 自动检测新旧实体（persist vs merge）
template.saveAllBatched(users, 100);

// 纯持久化（无 merge，已知新实体时更快）
template.saveAllBatchedPure(users, 100);

// 每批独立事务提交
template.saveAllBatchedInSeparateTransactions(users, 100);
```

## EntityGraph

```java
// 创建 EntityGraph 辅助器
EntityGraphHelper<User> graph = EntityGraphHelper.forEntity(User.class)
    .add("department")
    .add("roles.permissions");

// 链接嵌套路径
EntityGraphHelper<User> graph = EntityGraphHelper.forEntity(User.class)
    .add("department")
    .nest("company");  // 等同于 add("department.company")

// 在查询中使用
List<User> users = template.findAll(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"), graph);
```

## 游标分页（Keyset Pagination）

对于大数据集，游标分页比偏移分页更高效：

```java
// 第一页
MyJpaTemplateOperations.KeysetPage<User> page = template.findKeysetPage(
    User.class,
    (root, cb, cq) -> cb.equal(root.get("status"), "ACTIVE"),
    Sort.by("id"),
    20,
    null  // 第一页无游标
);

// 下一页 — 使用上一页的游标
MyJpaTemplateOperations.KeysetPage<User> nextPage = template.findKeysetPage(
    User.class,
    (root, cb, cq) -> cb.equal(root.get("status"), "ACTIVE"),
    Sort.by("id"),
    20,
    page.getLastSortValues()  // 上一页的游标
);

List<User> users = nextPage.getContent();
boolean hasNext = nextPage.hasNext();
```

## 深度分页保护

使用偏移分页时，`MyJpaTemplate` 自动：

1. 当偏移量超过 `deep-pagination-offset-threshold`（默认：100,000）时**警告**
2. 当偏移量超过 `deep-pagination-offset-limit`（默认：禁用）时**抛出异常**

```yaml
myjpa-plus:
  query:
    deep-pagination-offset-threshold: 100000  # 警告阈值
    deep-pagination-offset-limit: 1000000     # 硬限制（-1 = 禁用）
```

## CacheAdapter

`MyJpaTemplate` 使用 `CacheAdapter` 进行查询结果缓存：

```java
// 查看缓存统计
CacheAdapter cache = template.getCacheAdapter();
log.info("缓存命中率: {}, 大小: {}", cache.getHitRate(), cache.size());

// 按前缀驱逐（如实体更新后）
cache.evictByPrefix("com.example.User:");

// 禁用特定模板的缓存
template.setCacheAdapter(CacheAdapter.disabled());
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
