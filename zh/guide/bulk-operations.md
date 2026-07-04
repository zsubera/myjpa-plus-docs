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

### 多字段更新

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .set(User::setUpdatedAt, Instant.now())
    .lt(User::getLastLoginAt, cutoffDate)
    .execute(entityManager);
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

### 带 OR 条件的更新

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .or(o -> o
        .eq(User::getStatus, "BANNED")
        .eq(User::getStatus, "SUSPENDED"))
    .execute(entityManager);
```

### 带 NOT 条件的更新

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .not(n -> n.eq(User::getRole, "ADMIN"))
    .execute(entityManager);
```

### 事务管理

```java
// 自动管理事务
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .executeInTransaction(entityManager);
```

### 限量更新

```java
// 最多更新 100 条记录
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "PROCESSED")
    .eq(User::getStatus, "PENDING")
    .executeLimited(entityManager, 100);
```

### 更新全部（无条件）

```java
// 警告：更新所有记录！
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .updateAll(entityManager);

// 带事务管理
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .updateAllInTransaction(entityManager);
```

### 表达式 SET（原子递增/递减）

无需读取当前值即可原子性地递增或递减数值字段：

```java
// 登录次数加 1
int count = new UpdateSpec<>(User.class)
    .setAdd(User::getLoginCount, 1)
    .eq(User::getId, userId)
    .execute(entityManager);

// 库存数量减 5
int count = new UpdateSpec<>(Product.class)
    .setSubtract(Product::getStock, 5)
    .gt(Product::getStock, 5)
    .execute(entityManager);

// 与其他 SET 操作组合使用
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ACTIVE")
    .setAdd(User::getLoginCount, 1)
    .set(User::setLastLoginAt, Instant.now())
    .eq(User::getId, userId)
    .execute(entityManager);
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

### 允许无条件操作

无条件的 `updateAll()` 和 `deleteAll()` 需要显式启用，以防止意外的批量更新：

```java
// 未设置 allowUnconditional — 抛出 IllegalStateException
new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .updateAll(em); // 报错！

// 设置 allowUnconditional — 正常执行
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "ARCHIVED")
    .allowUnconditional(true)
    .updateAll(em); // 正常

// 删除同理
int count = new DeleteSpec<>(User.class)
    .allowUnconditional(true)
    .deleteAll(em);
```

### 执行前预估行数

在运行操作前预览将影响多少行：

```java
UpdateSpec<User> spec = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "ACTIVE");

long estimated = spec.countBeforeExecute(entityManager);
System.out.println("将更新 " + estimated + " 行");

if (estimated > 1000) {
    throw new RuntimeException("更新行数过多");
}

int count = spec.execute(entityManager);
```

### 构建 CriteriaUpdate 不执行

```java
CriteriaUpdate<User> cu = new UpdateSpec<>(User.class)
    .set(User::getStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .toUpdate(entityManager);
```

## DeleteSpec

### 基本删除

```java
int count = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "DELETED")
    .execute(entityManager);
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

### 删除全部（无条件）

```java
// 警告：删除所有记录！
int count = new DeleteSpec<>(User.class)
    .deleteAll(entityManager);

// 带事务管理
int count = new DeleteSpec<>(User.class)
    .deleteAllInTransaction(entityManager);
```

### 限量删除

```java
int count = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "EXPIRED")
    .executeLimited(entityManager, 1000);
```

### 构建 CriteriaDelete 不执行

```java
CriteriaDelete<User> cd = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "DELETED")
    .toDelete(entityManager);
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

// 批量更新，带大小限制
int count = template.executeBatch(
    template.update(User.class)
        .set(User::setStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    100
);

// 批量删除，带大小限制
int count = template.executeBatch(
    template.delete(User.class)
        .eq(User::getStatus, "EXPIRED"),
    100
);
```

## 分离事务的批量操作

处理大数据集时，可按批次使用独立事务。如果某一批次失败，之前的批次已提交：

```java
// 批量更新 — 每批独立提交
MyJpaTemplate.BatchResult result = template.executeBatchInSeparateTransactions(
    template.update(User.class)
        .set(User::getStatus, "PROCESSED")
        .eq(User::getStatus, "PENDING"),
    500  // 批次大小
);

if (!result.isSuccess()) {
    log.error("第 {} 批失败：{}", result.getFailedBatchIndex(), result.getFailureCause());
}
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

// ABORT — 首次失败即停止
template.executeBatchInSeparateTransactions(
    template.delete(LogEntry.class)
        .lt(LogEntry::getTimestamp, cutoffDate),
    500,
    MyJpaTemplate.BatchFailureStrategy.ABORT
);
```

## 错误处理

```java
// 如果没有条件，抛出 IllegalStateException（防止意外批量更新/删除）
new UpdateSpec<>(User.class)
    .set(User::getStatus, "NEW")
    .execute(em);  // 抛出异常！

// 无条件操作需要显式调用
new DeleteSpec<>(User.class)
    .deleteAll(em);  // 正常 - 明确意图
```
