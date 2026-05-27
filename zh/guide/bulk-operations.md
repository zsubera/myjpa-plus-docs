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

### 带 OR 条件的更新

```java
int count = new UpdateSpec<>(User.class)
    .set(User::setStatus, "INACTIVE")
    .or(o -> o
        .eq(User::getStatus, "BANNED")
        .eq(User::getStatus, "SUSPENDED"))
    .execute(entityManager);
```

### 事务中更新

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
```

### 限量删除

```java
int count = new DeleteSpec<>(User.class)
    .eq(User::getStatus, "EXPIRED")
    .executeLimited(entityManager, 1000);
```

## MyJpaTemplate

使用 `MyJpaTemplate` 更方便：

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

## 错误处理

```java
// 如果没有条件，抛出 IllegalStateException（防止意外批量更新/删除）
new UpdateSpec<>(User.class)
    .set(User::setStatus, "NEW")
    .execute(em);  // 抛出异常！

// 无条件操作需要显式调用 deleteAll()
new DeleteSpec<>(User.class)
    .deleteAll(em);  // 正常 - 明确意图
```
