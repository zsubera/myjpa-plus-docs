---
sidebar_position: 1
title: UPSERT / MergeSpec
---

# UPSERT / MergeSpec

`MergeSpec` 提供类型安全的 UPSERT（INSERT ... ON CONFLICT UPDATE）操作，自动检测数据库方言并生成对应的 SQL。

## 基本用法

```java
@Autowired
private EntityManager em;

// 基本 UPSERT（冲突时更新所有非冲突列）
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .execute(em);
```

生成的 SQL：
```sql
-- PostgreSQL
INSERT INTO users (name, email, status) VALUES (?, ?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status

-- MySQL
INSERT INTO users (name, email, status) VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status)
```

## 冲突列指定

### 单列唯一键

```java
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .execute(em);
```

生成的 SQL（PostgreSQL）：
```sql
INSERT INTO users (name, email, age) VALUES (?, ?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age
```

### 多列唯一键

```java
int affected = new MergeSpec<>(Order.class)
    .withEntity(order)
    .onConflict(Order::getOrderNo, Order::getTenantId)
    .execute(em);
```

生成的 SQL（PostgreSQL）：
```sql
INSERT INTO orders (order_no, tenant_id, amount) VALUES (?, ?, ?)
ON CONFLICT (order_no, tenant_id) DO UPDATE SET amount = EXCLUDED.amount
```

### 字符串字段名（动态场景）

```java
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict("email", "tenant_id")
    .execute(em);
```

生成的 SQL（PostgreSQL）：
```sql
INSERT INTO users (name, email, tenant_id) VALUES (?, ?, ?)
ON CONFLICT (email, tenant_id) DO UPDATE SET name = EXCLUDED.name
```

## 选择性更新

仅更新指定列，其他列保持不变：

```java
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .updateOnConflict(User::getName, User::getAge)
    .execute(em);
```

生成的 SQL：
```sql
INSERT INTO users (name, email, age) VALUES (?, ?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age
```

## 事务管理

### 自动事务（推荐）

```java
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .executeInTransaction(em);
```

如果当前没有活动事务，会自动创建新事务。

生成的 SQL（与基本 UPSERT 相同）：
```sql
INSERT INTO users (name, email, age) VALUES (?, ?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age
```

### 手动事务

```java
EntityTransaction tx = em.getTransaction();
tx.begin();
try {
    int affected = new MergeSpec<>(User.class)
        .withEntity(user)
        .onConflict(User::getEmail)
        .execute(em);
    tx.commit();
} catch (Exception e) {
    tx.rollback();
    throw e;
}
```

## 批量 UPSERT

### 基本批量

```java
List<User> users = List.of(user1, user2, user3);

int total = new MergeSpec<>(User.class)
    .onConflict(User::getEmail)
    .executeBatch(users, em, 100);  // 每批 100 条
```

生成的 SQL（PostgreSQL，多行）：
```sql
INSERT INTO users (name, email, age) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age
```

### 带事务的批量

```java
int total = new MergeSpec<>(User.class)
    .onConflict(User::getEmail)
    .executeBatchInTransaction(users, em);
```

生成的 SQL（同上多行格式）

### 分离事务的批量

每批独立提交 — 如果某批失败，之前的批次已提交：

```java
int total = new MergeSpec<>(User.class)
    .onConflict(User::getEmail)
    .executeBatchInSeparateTransactions(users, em, 500);
```

## executeWithCallbacks

先触发 JPA 生命周期回调（如 `@PrePersist`、`@PostPersist`），再执行 UPSERT：

```java
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .executeWithCallbacks(em);
```

此方法先将实体合并到持久化上下文（触发回调），然后 flush，最后执行原生 UPSERT。

## 多行批量 UPSERT

`executeBatch()` 在方言支持时自动使用多行 INSERT 语法：

```java
// PostgreSQL/MySQL: INSERT INTO ... VALUES (...), (...) ON CONFLICT ...
int total = new MergeSpec<>(User.class)
    .onConflict(User::getEmail)
    .executeBatch(users, em, 100);

// 检查当前方言是否支持批量 UPSERT
boolean supported = new MergeSpec<>(User.class).supportsBatchUpsert(em);
```

## 数据库方言

### PostgreSQL

```sql
INSERT INTO users (name, email) VALUES (?, ?)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
```

### MySQL

```sql
INSERT INTO users (name, email) VALUES (?, ?)
ON DUPLICATE KEY UPDATE name = VALUES(name)
```

### Oracle

```sql
MERGE INTO users tgt
USING (SELECT ? AS email, ? AS name, ? AS status FROM dual) src
ON (tgt.email = src.email)
WHEN MATCHED THEN UPDATE SET tgt.name = src.name, tgt.status = src.status
WHEN NOT MATCHED THEN INSERT (email, name, status) VALUES (src.email, src.name, src.status)
```

### SQL Server

```sql
MERGE INTO users AS tgt
USING (SELECT ? AS email, ? AS name, ? AS status) AS src
ON (tgt.email = src.email)
WHEN MATCHED THEN UPDATE SET tgt.name = src.name, tgt.status = src.status
WHEN NOT MATCHED THEN INSERT (email, name, status) VALUES (src.email, src.name, src.status);
```

## 自定义方言

### 单次操作指定方言

```java
// 使用指定方言而非自动检测
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .dialect(new PostgresDialect())
    .execute(em);
```

### 启动时注册自定义方言

```java
@Configuration
public class DialectConfig {
    @PostConstruct
    public void registerDialect() {
        DialectDetector.registerDialect(new MyCustomDialect());
    }
}
```

运行时移除方言：

```java
DialectDetector.removeDialect(MyCustomDialect.class);
```

## 并发安全说明

UPSERT 在高并发场景下存在竞态条件。建议：

1. 使用数据库唯一约束保护冲突键
2. 在 UPSERT 前使用悲观锁
3. 在应用层使用分布式锁
4. 捕获唯一约束异常并重试

### @RetryOnOptimisticLock

使用 `@RetryOnOptimisticLock` 注解实现 `OptimisticLockException` 时自动指数退避重试：

```java
@RetryOnOptimisticLock(maxRetries = 3, backoffMs = 100)
public void upsertUser(User user) {
    new MergeSpec<>(User.class)
        .withEntity(user)
        .onConflict(User::getEmail)
        .executeInTransaction(em);
}
```

**属性：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxRetries` | `int` | `3` | 最大重试次数 |
| `backoffMs` | `long` | `100` | 初始退避时间（毫秒），按指数递增：`backoffMs * 2^attempt` |

**工作原理：**

- 遇到 `OptimisticLockException` 时，方法最多重试 `maxRetries` 次
- 退避时间指数递增：100ms → 200ms → 400ms
- 所有重试均失败后，抛出原始异常
- 适用于任何 Spring 管理的 Bean 方法（不限于 UPSERT）

**适用场景：**

- 高并发下的 UPSERT 操作
- `save()` 调用中基于 `@Version` 的乐观锁
- 任何可能因并发修改导致冲突的操作

## 持久化上下文策略

`MergeSpec` 像其他批量操作规约一样支持 `persistenceStrategy()`：

```java
new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict(User::getEmail)
    .persistenceStrategy(PersistenceContextStrategy.DEFER_TO_CALLER)
    .execute(em);
```

详见 [批量操作 → 持久化上下文策略](bulk-operations.md#持久化上下文策略)。

