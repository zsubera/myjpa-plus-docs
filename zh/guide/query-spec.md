# QuerySpec

QuerySpec 是构建类型安全查询的核心类。它实现了 `Specification<T>` 接口，提供流式 API 来构建 JPA Criteria 谓词。

## 基本比较

### 等值比较

```java
// 等于
new QuerySpec<User>().eq(User::getStatus, "ACTIVE")

// 不等于
new QuerySpec<User>().ne(User::getStatus, "INACTIVE")

// Null 处理 - 自动转为 IS NULL
new QuerySpec<User>().eq(User::getDeletedAt, null)

// Not Null - 自动转为 IS NOT NULL
new QuerySpec<User>().ne(User::getDeletedAt, null)
```

### 数值比较

```java
// 大于
new QuerySpec<User>().gt(User::getAge, 18)

// 大于等于
new QuerySpec<User>().ge(User::getAge, 18)

// 小于
new QuerySpec<User>().lt(User::getAge, 65)

// 小于等于
new QuerySpec<User>().le(User::getAge, 65)

// 范围（包含两端）
new QuerySpec<User>().between(User::getAge, 18, 65)

// 不在范围内
new QuerySpec<User>().notBetween(User::getAge, 0, 17)
```

## 字符串操作

```java
// LIKE（带通配符）
new QuerySpec<User>().like(User::getName, "%John%")

// NOT LIKE
new QuerySpec<User>().notLike(User::getName, "%test%")

// 前缀匹配（自动添加 % 后缀）
new QuerySpec<User>().startsWith(User::getName, "John")

// 后缀匹配（自动添加 % 前缀）
new QuerySpec<User>().endsWith(User::getName, "son")

// 包含（自动添加 % 前缀和后缀）
new QuerySpec<User>().contains(User::getName, "oh")

// 忽略大小写的等值比较
new QuerySpec<User>().eqIgnoreCase(User::getName, "john")

// 忽略大小写的 LIKE
new QuerySpec<User>().likeIgnoreCase(User::getName, "%john%")

// 原始 LIKE（不转义通配符）
new QuerySpec<User>().rawLike(User::getCode, "USER%")
```

## 集合操作

```java
// IN 子句
new QuerySpec<User>().in(User::getStatus, "ACTIVE", "PENDING")

// IN（使用 Collection）
new QuerySpec<User>().in(User::getStatus, List.of("ACTIVE", "PENDING"))

// NOT IN
new QuerySpec<User>().notIn(User::getStatus, "DELETED", "BANNED")

// IS EMPTY（用于 @OneToMany、@ManyToMany）
new QuerySpec<User>().isEmpty(User::getRoles)

// IS NOT EMPTY
new QuerySpec<User>().isNotEmpty(User::getRoles)
```

## 多字段搜索

使用单个关键词搜索多个字段：

```java
// 搜索 name、email 或 phone
new QuerySpec<User>().multiLike(keyword, User::getName, User::getEmail, User::getPhone)
```

生成的条件：`WHERE name LIKE '%keyword%' OR email LIKE '%keyword%' OR phone LIKE '%keyword%'`

## OR 分组

### Consumer 模式（推荐）

```java
new QuerySpec<User>()
    .eq(User::getStatus, "ACTIVE")
    .or(g -> g
        .eq(User::getRole, "ADMIN")
        .eq(User::getRole, "MODERATOR"))
    .toSpecification()
```

### 嵌套 OR 分组

```java
new QuerySpec<User>()
    .or(outer -> outer
        .eq(User::getStatus, "ACTIVE")
        .or(inner -> inner
            .eq(User::getRole, "ADMIN")
            .eq(User::getRole, "SUPER_ADMIN")))
    .toSpecification()
```

## NOT 分组

```java
// NOT (status = 'DELETED')
new QuerySpec<User>()
    .not(g -> g.eq(User::getStatus, "DELETED"))
    .toSpecification()

// NOT (status = 'ACTIVE' AND age < 18)
new QuerySpec<User>()
    .not(g -> g
        .eq(User::getStatus, "ACTIVE")
        .lt(User::getAge, 18))
    .toSpecification()
```

## DISTINCT

```java
new QuerySpec<User>()
    .eq(User::getStatus, "ACTIVE")
    .distinct()
    .toSpecification()
```

## ORDER BY

```java
// 升序
new QuerySpec<User>()
    .orderByAsc(User::getName)
    .toSpecification()

// 降序
new QuerySpec<User>()
    .orderByDesc(User::getCreatedAt)
    .toSpecification()

// 多字段排序
new QuerySpec<User>()
    .orderByAsc(User::getStatus)
    .orderByDesc(User::getCreatedAt)
    .toSpecification()
```

## GROUP BY 和 HAVING

```java
new QuerySpec<User>()
    .groupBy(User::getStatus)
    .having((root, cb) -> cb.greaterThan(cb.count(root), 1L))
    .toSpecification()
```

## 原始 Predicate

对于流式 API 未覆盖的复杂场景：

```java
new QuerySpec<User>()
    .where((path, cb) -> cb.and(
        cb.equal(path.get("status"), "ACTIVE"),
        cb.greaterThan(path.get("age"), 18)
    ))
    .toSpecification()
```

## 组合 Specification

```java
QuerySpec<User> base = new QuerySpec<User>().eq(User::getStatus, "ACTIVE");
QuerySpec<User> ageFilter = new QuerySpec<User>().gt(User::getAge, 18);

// AND 组合
Specification<User> combined = base.and(ageFilter);

// OR 组合
Specification<User> combined = base.or(ageFilter);

// 与外部 Specification 组合
Specification<User> external = (root, query, cb) -> cb.equal(root.get("type"), "USER");
Specification<User> combined = base.toSpecification(external);
```

## 查询设置

### 超时

```java
new QuerySpec<User>()
    .timeout(30)  // 30 秒
    .eq(User::getStatus, "ACTIVE")
    .toSpecification()
```

### 锁模式

```java
new QuerySpec<User>()
    .lockMode(LockModeType.PESSIMISTIC_WRITE)
    .eq(User::getId, userId)
    .toSpecification()
```
