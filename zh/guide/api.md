# API 参考

## QuerySpec\<T\>

构建类型安全查询的核心类。实现 `Specification<T>`。

### 条件方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `eq(field, value)` | 等于 | `.eq(User::getStatus, "ACTIVE")` |
| `ne(field, value)` | 不等于 | `.ne(User::getStatus, "DELETED")` |
| `gt(field, value)` | 大于 | `.gt(User::getAge, 18)` |
| `ge(field, value)` | 大于等于 | `.ge(User::getAge, 18)` |
| `lt(field, value)` | 小于 | `.lt(User::getAge, 65)` |
| `le(field, value)` | 小于等于 | `.le(User::getAge, 65)` |
| `between(field, start, end)` | 范围（包含） | `.between(User::getAge, 18, 65)` |
| `notBetween(field, start, end)` | 不在范围内 | `.notBetween(User::getAge, 0, 17)` |
| `like(field, pattern)` | LIKE | `.like(User::getName, "%John%")` |
| `notLike(field, pattern)` | NOT LIKE | `.notLike(User::getName, "%test%")` |
| `startsWith(field, value)` | 前缀匹配 | `.startsWith(User::getName, "John")` |
| `endsWith(field, value)` | 后缀匹配 | `.endsWith(User::getName, "son")` |
| `contains(field, value)` | 包含 | `.contains(User::getName, "oh")` |
| `eqIgnoreCase(field, value)` | 忽略大小写等于 | `.eqIgnoreCase(User::getName, "john")` |
| `likeIgnoreCase(field, pattern)` | 忽略大小写 LIKE | `.likeIgnoreCase(User::getName, "%john%")` |
| `rawLike(field, pattern)` | 原始 LIKE（不转义） | `.rawLike(User::getCode, "USER%")` |
| `in(field, values...)` | IN | `.in(User::getStatus, "A", "B")` |
| `in(field, collection)` | IN（集合） | `.in(User::getStatus, List.of("A", "B"))` |
| `notIn(field, values...)` | NOT IN | `.notIn(User::getStatus, "C", "D")` |
| `isNull(field)` | IS NULL | `.isNull(User::getDeletedAt)` |
| `isNotNull(field)` | IS NOT NULL | `.isNotNull(User::getEmail)` |
| `isEmpty(field)` | IS EMPTY | `.isEmpty(User::getRoles)` |
| `isNotEmpty(field)` | IS NOT EMPTY | `.isNotEmpty(User::getRoles)` |
| `multiLike(keyword, fields...)` | 多字段 LIKE | `.multiLike("test", User::getName, User::getEmail)` |

### 分组方法

| 方法 | 说明 |
|------|------|
| `or(config)` | OR 分组（Consumer 模式） |
| `not(config)` | NOT 分组（Consumer 模式） |
| `join(field, config)` | JOIN（Consumer 模式） |
| `leftJoin(field, config)` | LEFT JOIN（Consumer 模式） |
| `fetchJoin(field, config)` | FETCH JOIN（Consumer 模式） |
| `leftFetchJoin(field, config)` | LEFT FETCH JOIN（Consumer 模式） |

### 查询设置

| 方法 | 说明 |
|------|------|
| `distinct()` | 启用 DISTINCT |
| `groupBy(fields...)` | GROUP BY 子句 |
| `having(condition)` | HAVING 子句 |
| `orderByAsc(fields...)` | 升序排列 |
| `orderByDesc(fields...)` | 降序排列 |
| `timeout(seconds)` | 查询超时 |
| `lockMode(mode)` | 锁模式 |
| `where(predicate)` | 原始谓词 |

### 转换方法

| 方法 | 说明 |
|------|------|
| `toSpecification()` | 转换为 Specification |
| `toSpecification(external)` | 与外部 Specification 组合 |
| `and(other)` | 与另一个 QuerySpec 进行 AND 组合 |
| `or(other)` | 与另一个 QuerySpec 进行 OR 组合 |
| `then(other)` | 合并另一个 QuerySpec 的条件 |

## UpdateSpec\<T\>

批量 UPDATE 操作构建器。

| 方法 | 说明 |
|------|------|
| `set(field, value)` | SET 子句 |
| `execute(em)` | 在现有事务中执行 |
| `executeInTransaction(em)` | 带事务管理执行 |
| `executeLimited(em, limit)` | 限量执行 |
| `deleteAll(em)` | 删除全部（无条件） |
| `toUpdate(em)` | 转换为 CriteriaUpdate |

## DeleteSpec\<T\>

批量 DELETE 操作构建器。

| 方法 | 说明 |
|------|------|
| `execute(em)` | 在现有事务中执行 |
| `executeInTransaction(em)` | 带事务管理执行 |
| `executeLimited(em, limit)` | 限量执行 |
| `deleteAll(em)` | 删除全部（无条件） |
| `toDelete(em)` | 转换为 CriteriaDelete |

## SubQuerySpec\<S\>

EXISTS/NOT EXISTS 子查询构建器。

| 方法 | 说明 |
|------|------|
| `correlated()` | 获取关联的外部根 |
| `correlatedEq(outer, inner)` | 关联等值快捷方式 |
| `select(field)` | 自定义 SELECT 子句 |
| `where(predicate)` | 原始谓词 |

所有 QuerySpec 条件方法也可用。

## EntityGraphHelper\<T\>

JPA EntityGraph 构建辅助器。

| 方法 | 说明 |
|------|------|
| `forEntity(class)` | 创建新实例 |
| `add(path)` | 添加属性路径 |
| `add(paths...)` | 添加多个路径 |
| `loadGraph()` | 设置 LOAD 图模式 |
| `fetchGraph()` | 设置 FETCH 图模式（默认） |
| `buildGraph(em)` | 构建 EntityGraph |
| `toHints(em)` | 转换为查询提示 |
| `apply(query, em)` | 应用到 TypedQuery |

## MyJpaTemplate

常见操作的便利模板。

| 方法 | 说明 |
|------|------|
| `findAll(class, spec)` | 查找所有 |
| `findAll(class, spec, maxResults)` | 限量查找 |
| `findAll(class, spec, pageable)` | 分页查找 |
| `findOne(class, spec)` | 查找单个 |
| `count(class, spec)` | 统计 |
| `exists(class, spec)` | 判断存在 |
| `update(class)` | 创建 UpdateSpec |
| `delete(class)` | 创建 DeleteSpec |
