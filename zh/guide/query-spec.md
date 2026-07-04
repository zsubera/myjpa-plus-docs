# QuerySpec

QuerySpec 是构建类型安全查询的核心类。它实现了 `Specification<T>` 接口，提供流式 API 构建 JPA Criteria 谓词。

## 关于 toSpecification()

`QuerySpec` 直接实现了 `Specification<T>`，可以直接传给 `findAll()`，无需调用 `toSpecification()`：

```java
// 两种方式都可以：
userRepository.findAll(new QuerySpec<User>().eq(User::getStatus, "ACTIVE"));
userRepository.findAll(new QuerySpec<User>().eq(User::getStatus, "ACTIVE").toSpecification());
```

生成的 SQL：
```sql
SELECT * FROM users WHERE status = 'ACTIVE'
```

**何时使用 `toSpecification()`：**
- 与外部 Specification 组合：`toSpecification(externalSpec)`
- 在复杂查询中使代码意图更清晰
- 验证状态（捕获未关闭的 `or()` 组）

**何时可以跳过：**
- 意图已明确的简单查询
- 构建器模式显而易见的链式调用

## 基本比较

### 等值比较

```java
// 等于
new QuerySpec<User>().eq(User::getStatus, "ACTIVE")
```
```sql
SELECT * FROM users WHERE status = 'ACTIVE'
```

```java
// 不等于
new QuerySpec<User>().ne(User::getStatus, "INACTIVE")
```
```sql
SELECT * FROM users WHERE status <> 'INACTIVE'
```

```java
// Null 处理 — 自动转为 IS NULL
new QuerySpec<User>().eq(User::getDeletedAt, null)
```
```sql
SELECT * FROM users WHERE deleted_at IS NULL
```

```java
// Not Null — 自动转为 IS NOT NULL
new QuerySpec<User>().ne(User::getDeletedAt, null)
```
```sql
SELECT * FROM users WHERE deleted_at IS NOT NULL
```

### 数值比较

```java
// 大于
new QuerySpec<User>().gt(User::getAge, 18)
```
```sql
SELECT * FROM users WHERE age > 18
```

```java
// 大于等于
new QuerySpec<User>().ge(User::getAge, 18)
```
```sql
SELECT * FROM users WHERE age >= 18
```

```java
// 小于
new QuerySpec<User>().lt(User::getAge, 65)
```
```sql
SELECT * FROM users WHERE age < 65
```

```java
// 小于等于
new QuerySpec<User>().le(User::getAge, 65)
```
```sql
SELECT * FROM users WHERE age <= 65
```

```java
// 区间（含边界）
new QuerySpec<User>().between(User::getAge, 18, 65)
```
```sql
SELECT * FROM users WHERE age BETWEEN 18 AND 65
```

```java
// 非区间
new QuerySpec<User>().notBetween(User::getAge, 0, 17)
```
```sql
SELECT * FROM users WHERE age NOT BETWEEN 0 AND 17
```

## 字符串操作

```java
// LIKE（自动在值前后添加 % 前后缀）
new QuerySpec<User>().like(User::getName, "John")
```
```sql
SELECT * FROM users WHERE name LIKE '%John%'
```

```java
// NOT LIKE
new QuerySpec<User>().notLike(User::getName, "test")
```
```sql
SELECT * FROM users WHERE name NOT LIKE '%test%'
```

```java
// 前缀匹配（自动添加 % 后缀）
new QuerySpec<User>().startsWith(User::getName, "John")
```
```sql
SELECT * FROM users WHERE name LIKE 'John%'
```

```java
// 后缀匹配（自动添加 % 前缀）
new QuerySpec<User>().endsWith(User::getName, "son")
```
```sql
SELECT * FROM users WHERE name LIKE '%son'
```

```java
// 非前缀匹配
new QuerySpec<User>().notStartsWith(User::getName, "Admin")
```
```sql
SELECT * FROM users WHERE name NOT LIKE 'Admin%'
```

```java
// 非后缀匹配
new QuerySpec<User>().notEndsWith(User::getName, "test")
```
```sql
SELECT * FROM users WHERE name NOT LIKE '%test'
```

```java
// 忽略大小写的等值比较
new QuerySpec<User>().eqIgnoreCase(User::getName, "john")
```
```sql
SELECT * FROM users WHERE UPPER(name) = UPPER('john')
```

```java
// 忽略大小写的不等值比较
new QuerySpec<User>().neIgnoreCase(User::getName, "john")
```
```sql
SELECT * FROM users WHERE UPPER(name) <> UPPER('john')
```

```java
// 忽略大小写的 LIKE（自动在值前后添加 % 前后缀）
new QuerySpec<User>().likeIgnoreCase(User::getName, "john")
```
```sql
SELECT * FROM users WHERE UPPER(name) LIKE UPPER('%john%')
```

## 集合操作

```java
// IN 子句
new QuerySpec<User>().in(User::getStatus, "ACTIVE", "PENDING")
```
```sql
SELECT * FROM users WHERE status IN ('ACTIVE', 'PENDING')
```

```java
// IN 使用 Collection
new QuerySpec<User>().in(User::getStatus, List.of("ACTIVE", "PENDING"))
```
```sql
SELECT * FROM users WHERE status IN ('ACTIVE', 'PENDING')
```

```java
// NOT IN
new QuerySpec<User>().notIn(User::getStatus, "DELETED", "BANNED")
```
```sql
SELECT * FROM users WHERE status NOT IN ('DELETED', 'BANNED')
```

```java
// IS EMPTY（用于 @OneToMany、@ManyToMany）
new QuerySpec<User>().isEmpty(User::getRoles)
```
```sql
SELECT * FROM users WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = users.id)
```

```java
// IS NOT EMPTY
new QuerySpec<User>().isNotEmpty(User::getRoles)
```
```sql
SELECT * FROM users WHERE EXISTS (SELECT 1 FROM user_roles WHERE user_id = users.id)
```

## 多字段搜索

使用单个关键词搜索多个字段：

```java
// 搜索 name、email 或 phone
new QuerySpec<User>().multiLike(keyword, User::getName, User::getEmail, User::getPhone)
```

生成的 SQL（`keyword = "张三"`）：
```sql
SELECT * FROM users
WHERE name LIKE '%张三%' OR email LIKE '%张三%' OR phone LIKE '%张三%'
```

## 条件守卫方法

所有条件方法都有 `boolean condition` 前置参数变体。仅当 `condition` 为 `true` 时才添加条件：

```java
// 仅在 status 不为 null 时添加状态过滤
new QuerySpec<User>()
    .eq(status != null, User::getStatus, status)
    .gt(minAge != null, User::getAge, minAge)
    .toSpecification()
```

当 `status = "ACTIVE"` 且 `minAge = null` 时：
```sql
SELECT * FROM users WHERE status = 'ACTIVE'
```

当 `status = null` 且 `minAge = 18` 时：
```sql
SELECT * FROM users WHERE age > 18
```

## OR 组

### Consumer 模式（推荐）

```java
new QuerySpec<User>()
    .eq(User::getStatus, "ACTIVE")
    .or(g -> g
        .eq(User::getRole, "ADMIN")
        .eq(User::getRole, "MODERATOR"))
    .toSpecification()
```
```sql
SELECT * FROM users WHERE status = 'ACTIVE' AND (role = 'ADMIN' OR role = 'MODERATOR')
```

### 嵌套 OR 组

```java
new QuerySpec<User>()
    .or(outer -> outer
        .eq(User::getStatus, "ACTIVE")
        .or(inner -> inner
            .eq(User::getRole, "ADMIN")
            .eq(User::getRole, "SUPER_ADMIN")))
    .toSpecification()
```
```sql
SELECT * FROM users WHERE (status = 'ACTIVE' OR (role = 'ADMIN' OR role = 'SUPER_ADMIN'))
```

## NOT 组

```java
// NOT (status = 'DELETED')
new QuerySpec<User>()
    .not(g -> g.eq(User::getStatus, "DELETED"))
    .toSpecification()
```
```sql
SELECT * FROM users WHERE NOT (status = 'DELETED')
```

```java
// NOT (status = 'ACTIVE' AND age < 18)
new QuerySpec<User>()
    .not(g -> g
        .eq(User::getStatus, "ACTIVE")
        .lt(User::getAge, 18))
    .toSpecification()
```
```sql
SELECT * FROM users WHERE NOT (status = 'ACTIVE' AND age < 18)
```

## DISTINCT

```java
new QuerySpec<User>()
    .eq(User::getStatus, "ACTIVE")
    .distinct()
    .toSpecification()
```
```sql
SELECT DISTINCT * FROM users WHERE status = 'ACTIVE'
```

## ORDER BY

```java
// 升序
new QuerySpec<User>()
    .orderByAsc(User::getName)
    .toSpecification()
```
```sql
SELECT * FROM users ORDER BY name ASC
```

```java
// 降序
new QuerySpec<User>()
    .orderByDesc(User::getCreatedAt)
    .toSpecification()
```
```sql
SELECT * FROM users ORDER BY created_at DESC
```

```java
// 多字段
new QuerySpec<User>()
    .orderByAsc(User::getStatus)
    .orderByDesc(User::getCreatedAt)
    .toSpecification()
```
```sql
SELECT * FROM users ORDER BY status ASC, created_at DESC
```

## GROUP BY 和 HAVING

```java
new QuerySpec<User>()
    .groupBy(User::getStatus)
    .having((root, cb) -> cb.greaterThan(cb.count(root), 1L))
    .toSpecification()
```
```sql
SELECT * FROM users GROUP BY status HAVING COUNT(*) > 1
```

## 原始谓词

用于流式 API 未覆盖的复杂场景：

```java
new QuerySpec<User>()
    .where((path, cb) -> cb.and(
        cb.equal(path.get("status"), "ACTIVE"),
        cb.greaterThan(path.get("age"), 18)
    ))
    .toSpecification()
```
```sql
SELECT * FROM users WHERE status = 'ACTIVE' AND age > 18
```

## 组合 Specification

```java
QuerySpec<User> base = new QuerySpec<User>().eq(User::getStatus, "ACTIVE");
QuerySpec<User> ageFilter = new QuerySpec<User>().gt(User::getAge, 18);

// AND 组合
Specification<User> combined = base.and(ageFilter);
```
```sql
SELECT * FROM users WHERE status = 'ACTIVE' AND age > 18
```

```java
// OR 组合
Specification<User> combined = base.or(ageFilter);
```
```sql
SELECT * FROM users WHERE status = 'ACTIVE' OR age > 18
```

```java
// 合并另一个 QuerySpec 的条件
QuerySpec<User> merged = base.then(ageFilter);
```
```sql
SELECT * FROM users WHERE status = 'ACTIVE' AND age > 18
```

## 查询设置

### 超时

```java
new QuerySpec<User>()
    .timeout(30)  // 30 秒
    .eq(User::getStatus, "ACTIVE")
    .toSpecification()
```
```sql
-- 相同的 SQL，但查询超时设为 30 秒：
SELECT * FROM users WHERE status = 'ACTIVE'
```

### 锁模式

```java
new QuerySpec<User>()
    .lockMode(LockModeType.PESSIMISTIC_WRITE)
    .eq(User::getId, userId)
    .toSpecification()
```
```sql
-- 相同的 SQL，但使用悲观写锁执行：
SELECT * FROM users WHERE id = ? FOR UPDATE
```

## 聚合函数

### 使用 QuerySpec

```java
// GROUP BY 配合 HAVING
List<Object[]> result = repository.findAll(s ->
    s.select(User::getStatus, s.count(User::getId))
     .groupBy(User::getStatus)
     .having(s.gt(s.count(User::getId), 10))
);
```
```sql
SELECT status, COUNT(id) FROM users GROUP BY status HAVING COUNT(id) > 10
```

```java
// 类型安全的 HAVING 方法
List<Object[]> result = repository.findAll(s ->
    s.groupBy(User::getDepartment)
     .havingCount(User::getId, Op.GT, 5)
     .havingSum(User::getSalary, Op.GT, 100000)
     .havingAvg(User::getAge, Op.LT, 40)
);
```
```sql
SELECT department, COUNT(id), SUM(salary), AVG(age)
FROM users
GROUP BY department
HAVING COUNT(id) > 5 AND SUM(salary) > 100000 AND AVG(age) < 40
```

### 使用 QueryAggregates（独立）

用于原始谓词或 `having(BiFunction)`：

```java
List<Object[]> result = repository.findAll(s ->
    s.groupBy(User::getDepartment)
     .having((root, cb) -> cb.greaterThan(
         QueryAggregates.count(root, User::getId, cb), 5L))
);
```
```sql
SELECT department, COUNT(id) FROM users GROUP BY department HAVING COUNT(id) > 5
```

可用方法：`count()`、`countDistinct()`、`sum()`、`avg()`、`max()`、`min()`

## 数据库函数调用

使用 `func()` 在条件中调用数据库函数：

```java
// 调用数据库函数
List<User> users = repository.findAll(s ->
    s.func(User::getCreatedAt, "DATE_TRUNC", "year", Op.EQ, targetYear)
);
```
```sql
SELECT * FROM users WHERE DATE_TRUNC('year', created_at) = ?
```

## QuerySpec.of() 工厂方法（v1.3.0+）

```java
// 一行创建并配置
QuerySpec<User> spec = QuerySpec.of(s -> s.eq(User::getStatus, "ACTIVE"));
```
```sql
SELECT * FROM users WHERE status = 'ACTIVE'
```

## Lambda 便捷方法（v1.3.0+）

使用 `MyJpaRepository`，可通过 Consumer Lambda 重载：

```java
// 无需手动创建 QuerySpec
List<User> users = userRepository.findAll(s -> s.eq(User::getStatus, "ACTIVE"));
Optional<User> user = userRepository.findOne(s -> s.eq(User::getId, 1L));
long count = userRepository.count(s -> s.eq(User::getStatus, "ACTIVE"));
boolean exists = userRepository.exists(s -> s.eq(User::getEmail, "john@example.com"));
```

生成的 SQL：
```sql
-- findAll
SELECT * FROM users WHERE status = 'ACTIVE'

-- findOne
SELECT * FROM users WHERE id = 1 LIMIT 1

-- count
SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'

-- exists
SELECT CASE WHEN EXISTS(SELECT 1 FROM users WHERE email = 'john@example.com') THEN true ELSE false END
```
