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

### 构建 CriteriaUpdate 不执行

```java
CriteriaUpdate<User> cu = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
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

## 错误处理

```java
// 如果没有条件，抛出 IllegalStateException（防止意外批量更新/删除）
new UpdateSpec<>(User.class)
    .set(User::setStatus, "NEW")
    .execute(em);  // 抛出异常！

// 无条件操作需要显式调用
new DeleteSpec<>(User.class)
    .deleteAll(em);  // 正常 - 明确意图
```
