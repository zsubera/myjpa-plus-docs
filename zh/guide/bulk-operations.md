# 批量更新与删除

MyJpa-Plus 提供 `UpdateSpec` 和 `DeleteSpec` 用于类型安全的批量操作。

## UpdateSpec

### 基本更新

```java
// 更新匹配记录的状态
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getLastLoginAt, null)
    .execute(entityManager);
```

生成的 SQL：
```sql
UPDATE users SET status = 'INACTIVE' WHERE last_login_at IS NULL
```

### 多字段更新

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .set(User::setUpdatedAt, Instant.now())
    .lt(User::getLastLoginAt, cutoffDate)
    .execute(entityManager);
```

生成的 SQL：
```sql
UPDATE users SET status = 'ARCHIVED', updated_at = ? WHERE last_login_at < ?
```

### 条件 SET

使用守卫变体来条件性地设置字段：

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .set(name != null, User::setName, name)
    .eq(User::getStatus, "PENDING")
    .execute(entityManager);
```

生成的 SQL（当 `name = "张三"` 时）：
```sql
UPDATE users SET status = 'INACTIVE', name = '张三' WHERE status = 'PENDING'
```

### 带 OR 条件的更新

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .or(o -> o
        .eq(User::getStatus, "BANNED")
        .eq(User::getStatus, "SUSPENDED"))
    .execute(entityManager);
```

生成的 SQL：
```sql
UPDATE users SET status = 'INACTIVE' WHERE status = 'BANNED' OR status = 'SUSPENDED'
```

### 带 NOT 条件的更新

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .not(n -> n.eq(User::getRole, "ADMIN"))
    .execute(entityManager);
```

生成的 SQL：
```sql
UPDATE users SET status = 'INACTIVE' WHERE NOT (role = 'ADMIN')
```

### 事务管理

```java
// 自动管理事务
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .executeInTransaction(entityManager);
```

生成的 SQL：
```sql
UPDATE users SET status = 'INACTIVE' WHERE status = 'PENDING'
```

### 限量更新

```java
// 最多更新 100 条记录
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "PROCESSED")
    .eq(User::getStatus, "PENDING")
    .executeLimited(entityManager, 100);
```

生成的 SQL：
```sql
UPDATE users SET status = 'PROCESSED' WHERE status = 'PENDING' LIMIT 100
```

### 更新全部（无条件）

```java
// 警告：更新所有记录！
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .updateAll(entityManager);
```

生成的 SQL：
```sql
UPDATE users SET status = 'ARCHIVED'
```

### 表达式 SET（原子递增/递减）

无需读取当前值即可原子性地递增或递减数值字段：

```java
// 登录次数加 1
int count = new UpdateSpec<>(User.class)
    .setAdd(User::getLoginCount, 1)
    .eq(User::getId, userId)
    .execute(entityManager);
```

生成的 SQL：
```sql
UPDATE users SET login_count = login_count + 1 WHERE id = ?
```

```java
// 库存数量减 5
int count = new UpdateSpec<>(Product.class)
    .setSubtract(Product::getStock, 5)
    .gt(Product::getStock, 5)
    .execute(entityManager);
```

生成的 SQL：
```sql
UPDATE products SET stock = stock - 5 WHERE stock > 5
```

```java
// 与其他 SET 操作组合使用
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ACTIVE")
    .setAdd(User::getLoginCount, 1)
    .set(User::setLastLoginAt, Instant.now())
    .eq(User::getId, userId)
    .execute(entityManager);
```

生成的 SQL：
```sql
UPDATE users SET status = 'ACTIVE', login_count = login_count + 1, last_login_at = ? WHERE id = ?
```

### 乐观锁版本递增

在更新时自动递增 `@Version` 字段：

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .withVersionIncrement(true)
    .eq(User::getId, userId)
    .execute(entityManager);
```

生成的 SQL：
```sql
UPDATE users SET status = 'INACTIVE', version = version + 1 WHERE id = ? AND version = ?
```

### 允许无条件操作

无条件的 `updateAll()` 和 `deleteAll()` 需要显式启用：

```java
// 设置 allowUnconditional — 正常执行
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .allowUnconditional(true)
    .updateAll(em);
```

生成的 SQL：
```sql
UPDATE users SET status = 'ARCHIVED'
```

### 执行前预估行数

在运行操作前预览将影响多少行：

```java
UpdateSpec<User> spec = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "ACTIVE");

long estimated = spec.countBeforeExecute(entityManager);
```

统计 SQL：
```sql
SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'
```

### 构建 CriteriaUpdate 不执行

```java
CriteriaUpdate<User> cu = new UpdateSpec<>(User.class)
    .set(User::getStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .toUpdate(entityManager);
```

生成的 CriteriaUpdate：
```sql
UPDATE users SET status = 'INACTIVE' WHERE status = 'PENDING'
```

## DeleteSpec

### 基本删除

```java
int count = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "DELETED")
    .execute(entityManager);
```

生成的 SQL：
```sql
DELETE FROM users WHERE status = 'DELETED'
```

### 复杂条件删除

```java
int count = new DeleteSpec<>(User.class)
    .lt(User::getCreatedAt, cutoffDate)
    .or(o -> o
        .eq(User::getStatus, "INACTIVE")
        .eq(User::getStatus, "BANNED"))
    .execute(entityManager);
```

生成的 SQL：
```sql
DELETE FROM users WHERE created_at < ? AND (status = 'INACTIVE' OR status = 'BANNED')
```

### 删除全部（无条件）

```java
// 警告：删除所有记录！
int count = new DeleteSpec<>(User.class)
    .deleteAll(entityManager);
```

生成的 SQL：
```sql
DELETE FROM users
```

### 限量删除

```java
int count = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "EXPIRED")
    .executeLimited(entityManager, 1000);
```

生成的 SQL：
```sql
DELETE FROM users WHERE status = 'EXPIRED' LIMIT 1000
```

### 构建 CriteriaDelete 不执行

```java
CriteriaDelete<User> cd = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "DELETED")
    .toDelete(entityManager);
```

生成的 CriteriaDelete：
```sql
DELETE FROM users WHERE status = 'DELETED'
```

## 使用 MyJpaTemplate

`MyJpaTemplate` 提供更方便的方式：

```java
@Autowired
private MyJpaTemplate template;

// 更新
int count = template.update(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .execute(em);

// 删除
int count = template.delete(User.class)
    .eq(User::getStatus, "DELETED")
    .execute(em);
```

生成的 SQL：
```sql
-- 更新
UPDATE users SET status = 'INACTIVE' WHERE status = 'PENDING'

-- 删除
DELETE FROM users WHERE status = 'DELETED'
```

## 分离事务的批量操作

处理大数据集时，可按批次使用独立事务：

```java
MyJpaTemplate.BatchResult result = template.executeBatchInSeparateTransactions(
    template.update(User.class)
        .set(User::getStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    500  // 批次大小
);
```

每批执行的 SQL：
```sql
UPDATE users SET status = 'PROCESSED' WHERE status = 'PENDING' LIMIT 500
```

### 失败策略

控制批次失败时是继续还是停止：

```java
// CONTINUE — 某批失败后仍处理剩余批次（默认）
template.executeBatchInSeparateTransactions(
    template.update(User.class)
        .set(User::getStatus, "DONE")
        .eq(User::getStatus, "PENDING"),
    500,
    MyJpaTemplate.BatchFailureStrategy.CONTINUE
);
```

生成的 SQL：
```sql
UPDATE users SET status = 'DONE' WHERE status = 'PENDING' LIMIT 500
```
