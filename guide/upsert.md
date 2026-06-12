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

### 多列唯一键

```java
int affected = new MergeSpec<>(Order.class)
    .withEntity(order)
    .onConflict(Order::getOrderNo, Order::getTenantId)
    .execute(em);
```

### 字符串字段名（动态场景）

```java
int affected = new MergeSpec<>(User.class)
    .withEntity(user)
    .onConflict("email", "tenant_id")
    .execute(em);
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

```java
List<User> users = List.of(user1, user2, user3);

int total = new MergeSpec<>(User.class)
    .onConflict(User::getEmail)
    .executeBatch(users, em, 100);  // 每批 100 条
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

## 并发安全说明

UPSERT 在高并发场景下存在竞态条件。建议：

1. 使用数据库唯一约束保护冲突键
2. 在 UPSERT 前使用悲观锁
3. 在应用层使用分布式锁
4. 捕获唯一约束异常并重试

```java
@RetryOnOptimisticLock(maxRetries = 3, backoffMs = 100)
public void upsertUser(User user) {
    new MergeSpec<>(User.class)
        .withEntity(user)
        .onConflict(User::getEmail)
        .executeInTransaction(em);
}
```
