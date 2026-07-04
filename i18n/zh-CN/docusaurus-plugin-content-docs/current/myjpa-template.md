---
sidebar_position: 1
title: MyJpaTemplate
---

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
```

生成的 SQL：
```sql
-- findAll
SELECT * FROM users WHERE status = 'ACTIVE' LIMIT 10000

-- findOne
SELECT * FROM users WHERE id = 1 LIMIT 1

-- count
SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'
```

### 根据 ID 查找

```java
Optional<User> user = template.findById(User.class, userId);
```

生成的 SQL：
```sql
SELECT * FROM users WHERE id = ?
```

### 查找单个

```java
Optional<User> user = template.findOne(User.class,
    new QuerySpec<User>().eq(User::getEmail, "john@example.com"));
```

生成的 SQL：
```sql
SELECT * FROM users WHERE email = 'john@example.com' LIMIT 1
```

### 查找所有

```java
// 使用 QuerySpec
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"));
```

生成的 SQL：
```sql
SELECT * FROM users WHERE status = 'ACTIVE' LIMIT 10000
```

```java
// 限制返回数量
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"), 100);
```

生成的 SQL：
```sql
SELECT * FROM users WHERE status = 'ACTIVE' LIMIT 100
```

```java
// 使用 EntityGraph
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    EntityGraphHelper.forEntity(User.class).add("department"));
```

生成的 SQL：
```sql
SELECT u.*, d.* FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE u.status = 'ACTIVE' LIMIT 10000
```

### 使用原始 Specification 查找

```java
List<User> users = template.find(User.class,
    (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"));
```

生成的 SQL：
```sql
SELECT * FROM users WHERE status = 'ACTIVE' LIMIT 10000
```

### 流式结果

对于大型结果集，无内存限制：

```java
// 流式所有结果 — 流的生命周期由内部管理
template.findAllStream(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    stream -> stream.forEach(user -> process(user)));
```

生成的 SQL：
```sql
SELECT * FROM users WHERE status = 'ACTIVE'
```

### 分页

```java
// 使用 Pageable 和 QuerySpec
Page<User> page = template.findAll(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    PageRequest.of(0, 20, Sort.by("name")));
```

生成的 SQL：
```sql
-- 统计查询
SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'

-- 数据查询
SELECT * FROM users WHERE status = 'ACTIVE' ORDER BY name ASC LIMIT 20 OFFSET 0
```

```java
// Slice — 不执行 count 查询（更快，仅需 hasNext 时使用）
Slice<User> slice = template.findSlice(User.class,
    (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"),
    PageRequest.of(0, 20));
```

生成的 SQL：
```sql
SELECT * FROM users WHERE status = 'ACTIVE' LIMIT 21 OFFSET 0
```

### 按 ID 批量查询

自动将大型 ID 列表拆分为 IN 子句批次：

```java
// 按 ID 查询（自动拆分 IN 子句，兼容 Oracle）
List<User> users = template.findAllById(User.class, List.of(1L, 2L, 3L, 1000L));
```

生成的 SQL：
```sql
SELECT * FROM users WHERE id IN (1, 2, 3, 1000)
```

```java
// 按 ID 查询未删除的记录
List<User> users = template.findNotDeletedAllById(User.class, List.of(1L, 2L, 3L));
```

生成的 SQL：
```sql
SELECT * FROM users WHERE id IN (1, 2, 3) AND deleted = false
```

## 更新操作

```java
int count = template.update(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .execute(em);
```

生成的 SQL：
```sql
UPDATE users SET status = 'INACTIVE' WHERE status = 'PENDING'
```

## 删除操作

```java
int count = template.delete(User.class)
    .eq(User::getStatus, "DELETED")
    .execute(em);
```

生成的 SQL：
```sql
DELETE FROM users WHERE status = 'DELETED'
```

## UPSERT 操作

```java
int count = template.execute(
    new MergeSpec<>(User.class)
        .withEntity(user)
        .onConflict(User::getEmail)
        .updateOnConflict(User::getName, User::getUpdatedAt)
);
```

生成的 SQL（PostgreSQL）：
```sql
INSERT INTO users (name, email, updated_at) VALUES (?, ?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, updated_at = EXCLUDED.updated_at
```

## 独立事务批量操作

```java
MyJpaTemplate.BatchResult result = template.executeBatchInSeparateTransactions(
    template.update(User.class)
        .set(User::getStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    500
);
```

每批执行的 SQL：
```sql
UPDATE users SET status = 'PROCESSED' WHERE status = 'PENDING' LIMIT 500
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
```

生成的 SQL：
```sql
SELECT * FROM users WHERE status = 'ACTIVE' ORDER BY id ASC LIMIT 20
```

```java
// 下一页 — 使用上一页的游标
MyJpaTemplateOperations.KeysetPage<User> nextPage = template.findKeysetPage(
    User.class,
    (root, cb, cq) -> cb.equal(root.get("status"), "ACTIVE"),
    Sort.by("id"),
    20,
    page.getLastSortValues()  // 上一页的游标
);
```

生成的 SQL：
```sql
SELECT * FROM users WHERE status = 'ACTIVE' AND id > ? ORDER BY id ASC LIMIT 20
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

