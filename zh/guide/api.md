# API 参考

## SFunction\<T, R\>

可序列化的 `Function<T, R>`，用于方法引用（如 `Entity::getField`）。支持通过 `SerializedLambda` 在运行时提取属性名。

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
| `notIn(field, collection)` | NOT IN（集合） | `.notIn(User::getStatus, List.of("C", "D"))` |
| `isNull(field)` | IS NULL | `.isNull(User::getDeletedAt)` |
| `isNotNull(field)` | IS NOT NULL | `.isNotNull(User::getEmail)` |
| `isEmpty(field)` | IS EMPTY | `.isEmpty(User::getRoles)` |
| `isNotEmpty(field)` | IS NOT EMPTY | `.isNotEmpty(User::getRoles)` |
| `multiLike(keyword, fields...)` | 多字段 LIKE | `.multiLike("test", User::getName, User::getEmail)` |
| `where(predicate)` | 原始谓词 | `.where((path, cb) -> ...)` |

### 条件守卫方法

所有条件方法都有 `boolean condition` 第一参数的变体：

```java
.eq(condition, field, value)
.ne(condition, field, value)
.gt(condition, field, value)
// ... 等等
```

### 分组方法

| 方法 | 说明 |
|------|------|
| `or(config)` | OR 分组（Consumer 模式） |
| `not(config)` | NOT 分组（Consumer 模式） |
| `join(field, config)` | INNER JOIN（Consumer 模式） |
| `leftJoin(field, config)` | LEFT JOIN（Consumer 模式） |
| `fetchJoin(field, config)` | FETCH JOIN（Consumer 模式） |
| `leftFetchJoin(field, config)` | LEFT FETCH JOIN（Consumer 模式） |
| `or()` | 打开 OR 分组（手动关闭） |
| `join(field)` | 打开 JOIN（手动关闭） |
| `leftJoin(field)` | 打开 LEFT JOIN（手动关闭） |
| `fetchJoin(field)` | 打开 FETCH JOIN（手动关闭） |
| `leftFetchJoin(field)` | 打开 LEFT FETCH JOIN（手动关闭） |

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
| `getSort()` | 获取 Sort 用于 Spring Data |
| `getQueryTimeout()` | 获取超时设置 |
| `getLockMode()` | 获取锁模式 |
| `applyQuerySettings(query)` | 应用设置到 TypedQuery |

## JoinGroup\<T, J\>

JOIN 条件构建器。继承 `ConditionBuilder<J>`。

| 方法 | 说明 |
|------|------|
| `or(config)` | JOIN 内的 OR 分组 |
| `or()` | 打开 OR 分组（手动关闭） |
| `join(field)` | 嵌套 JOIN（手动关闭） |
| `leftJoin(field)` | 嵌套 LEFT JOIN（手动关闭） |
| `join(field, config)` | 嵌套 JOIN（Consumer 模式） |
| `leftJoin(field, config)` | 嵌套 LEFT JOIN（Consumer 模式） |
| `endJoin()` | 关闭 JOIN 并返回 QuerySpec |

## OrGroup\<T\>

OR 条件构建器。继承 `ConditionBuilder<T>`。

| 方法 | 说明 |
|------|------|
| `or(config)` | 嵌套 OR 分组 |
| `or()` | 打开嵌套 OR（手动关闭） |
| `join(field)` | OR 内的 JOIN（手动关闭） |
| `leftJoin(field)` | OR 内的 LEFT JOIN（手动关闭） |
| `join(field, config)` | OR 内的 JOIN（Consumer 模式） |
| `leftJoin(field, config)` | OR 内的 LEFT JOIN（Consumer 模式） |
| `endOr()` | 关闭 OR 分组并返回 QuerySpec |

## SubQuerySpec\<S\>

EXISTS/NOT EXISTS 子查询构建器。

| 方法 | 说明 |
|------|------|
| `correlated()` | 获取关联的外部根 |
| `correlatedEq(outer, inner)` | 类型化关联谓词 |
| `select(field)` | 自定义 SELECT 子句 |
| `where(predicate)` | 原始谓词 |

所有 QuerySpec 条件方法也可用。

## UpdateSpec\<T\>

批量 UPDATE 操作构建器。

| 方法 | 说明 |
|------|------|
| `set(field, value)` | SET 子句 |
| `set(condition, field, value)` | 条件 SET |
| `execute(em)` | 在现有事务中执行 |
| `executeInTransaction(em)` | 带事务管理执行 |
| `executeLimited(em, limit)` | 限量执行 |
| `updateAll(em)` | 无条件更新 |
| `updateAllInTransaction(em)` | 无条件更新带事务 |
| `toUpdate(em)` | 转换为 CriteriaUpdate 不执行 |

所有 `ConditionBuilder` 的条件方法都可用（eq、ne、gt 等）。

## DeleteSpec\<T\>

批量 DELETE 操作构建器。

| 方法 | 说明 |
|------|------|
| `execute(em)` | 在现有事务中执行 |
| `executeInTransaction(em)` | 带事务管理执行 |
| `executeLimited(em, limit)` | 限量执行 |
| `deleteAll(em)` | 无条件删除 |
| `deleteAllInTransaction(em)` | 无条件删除带事务 |
| `toDelete(em)` | 转换为 CriteriaDelete 不执行 |

所有 `ConditionBuilder` 的条件方法都可用（eq、ne、gt 等）。

## ProjectionSpec\<T\>

DTO 投影查询构建器。

| 方法 | 说明 |
|------|------|
| `select(field)` | 添加字段到 SELECT |
| `asDto(class)` | 指定 DTO 类用于构造函数投影 |
| `join(field, config)` | INNER JOIN 带条件 |
| `leftJoin(field, config)` | LEFT JOIN 带条件 |
| `orderByAsc(field)` | 升序排列 |
| `orderByDesc(field)` | 降序排列 |
| `where(config)` | 添加 WHERE 条件 |
| `conditions()` | 访问底层 QuerySpec |
| `toTupleQuery(em)` | 构建 Tuple 查询 |
| `toDtoQuery(em)` | 构建 DTO 构造函数查询 |
| `findPage(em, pageable)` | 分页 Tuple 查询 |

## MyJpaTemplate

常见操作的便利模板。

| 方法 | 说明 |
|------|------|
| `findAll(class, spec)` | 查找所有 |
| `findAll(class, spec, maxResults)` | 限量查找 |
| `findAll(class, spec, entityGraph)` | 带 EntityGraph 查找 |
| `findAll(class, spec, entityGraph, maxResults)` | 带 EntityGraph 和限制查找 |
| `findAll(class, spec, pageable)` | 分页查询 |
| `findAllStream(class, spec)` | 流式结果 |
| `findAllStream(class, spec, entityGraph)` | 带 EntityGraph 的流式 |
| `find(class, Specification)` | 使用原始 Specification 查找 |
| `find(class, Specification, maxResults)` | 使用原始 Specification 和限制查找 |
| `findPage(class, Specification, pageable)` | 使用原始 Specification 分页 |
| `update(class)` | 创建 UpdateSpec |
| `delete(class)` | 创建 DeleteSpec |
| `execute(UpdateSpec)` | 在事务中执行更新 |
| `execute(DeleteSpec)` | 在事务中执行删除 |
| `executeBatch(UpdateSpec, batchSize)` | 批量更新 |
| `executeBatch(DeleteSpec, batchSize)` | 批量删除 |

## MyJpaRepository\<T, ID\>

基础仓库接口。继承 `JpaRepository<T, ID>` 和 `JpaSpecificationExecutor<T>`。

| 方法 | 说明 |
|------|------|
| `findNotDeletedAll()` | 所有未删除实体 |
| `findNotDeletedAll(spec)` | 带条件的未删除实体 |
| `findNotDeletedAll(spec, pageable)` | 分页未删除实体 |
| `findNotDeletedOne(spec)` | 单个未删除实体 |
| `findNotDeletedById(id)` | 根据 ID 查找未删除实体 |
| `countNotDeleted()` | 统计未删除数量 |
| `countNotDeleted(spec)` | 带条件统计未删除数量 |

## EntityGraphHelper\<T\>

JPA EntityGraph 构建辅助器。

| 方法 | 说明 |
|------|------|
| `forEntity(class)` | 创建新实例 |
| `add(path)` | 添加属性路径（支持点号表示法） |
| `add(paths...)` | 添加多个路径 |
| `loadGraph()` | 设置 LOAD 图模式 |
| `fetchGraph()` | 设置 FETCH 图模式（默认） |
| `buildGraph(em)` | 构建 EntityGraph |
| `toHints(em)` | 转换为查询提示 |
| `apply(query, em)` | 应用到 TypedQuery |

## SoftDeleteHelper

软删除工具类。

| 方法 | 说明 |
|------|------|
| `isNotDeleted(class)` | 未删除实体的 Specification |
| `isDeleted(class)` | 已删除实体的 Specification |
| `notDeletedQuery(class)` | 带软删除过滤的 QuerySpec |
| `findSoftDeleteField(class)` | 查找 @SoftDelete 字段名 |
| `isSoftDeleted(class, entity)` | 检查实体是否已软删除 |

## PageableHelper

分页工具类。

| 方法 | 说明 |
|------|------|
| `unsorted(page, size)` | 无排序的 PageRequest |
| `merge(pageable, spec)` | 合并 Pageable 排序和 QuerySpec 排序 |
| `sorted(page, size, sort)` | 带显式排序的 PageRequest |

## LambdaUtils

Lambda 工具类。

| 方法 | 说明 |
|------|------|
| `getPropertyName(function)` | 从方法引用提取属性名 |

## InClauseBuilder

IN 子句批处理工具（Oracle 兼容，每批最多 1000 个）。

| 方法 | 说明 |
|------|------|
| `in(cb, path, values...)` | 带自动批处理的 IN |
| `in(cb, path, collection)` | 带自动批处理的 IN |
| `notIn(cb, path, values...)` | 带自动批处理的 NOT IN |
| `notIn(cb, path, collection)` | 带自动批处理的 NOT IN |

## BaseEntity

`@MappedSuperclass` 提供通用审计字段。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `Long` | 自动生成的 ID |
| `createdAt` | `Instant` | 创建时间戳（自动设置） |
| `updatedAt` | `Instant` | 更新时间戳（自动设置） |

## @SoftDelete

注解，用于标记布尔字段为软删除标志。

- `true` = 已删除
- `false` / `null` = 未删除

## MyJpaPlusException

MyJpa-Plus 的基础运行时异常。
