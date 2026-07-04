# API 参考

## SFunction\<T, R\>

可序列化的 `Function<T, R>`，用于方法引用（如 `Entity::getField`）。支持通过 `SerializedLambda` 在运行时提取属性名。

## QuerySpec\<T\>

构建类型安全查询的核心类。实现 `Specification<T>`。

### 静态工厂

| 方法 | 说明 |
|------|------|
| `QuerySpec.of(consumer)` | 一行代码创建和配置 QuerySpec |

### 条件方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `eq(field, value)` | 等于；null 值 → IS NULL | `.eq(User::getStatus, "ACTIVE")` |
| `ne(field, value)` | 不等于；null 值 → IS NOT NULL | `.ne(User::getStatus, "DELETED")` |
| `eqStrict(field, value)` | 等于（null 值抛出异常） | `.eqStrict(User::getEmail, email)` |
| `neStrict(field, value)` | 不等于（null 值抛出异常） | `.neStrict(User::getCode, code)` |
| `gt(field, value)` | 大于 | `.gt(User::getAge, 18)` |
| `ge(field, value)` | 大于等于 | `.ge(User::getAge, 18)` |
| `lt(field, value)` | 小于 | `.lt(User::getAge, 65)` |
| `le(field, value)` | 小于等于 | `.le(User::getAge, 65)` |
| `between(field, start, end)` | 范围（包含） | `.between(User::getAge, 18, 65)` |
| `notBetween(field, start, end)` | 不在范围内 | `.notBetween(User::getAge, 0, 17)` |
| `like(field, value)` | LIKE（自动拼接 `%value%`，通配符自动转义） | `.like(User::getName, "John")` |
| `notLike(field, value)` | NOT LIKE（自动拼接 `%value%`，通配符自动转义） | `.notLike(User::getName, "test")` |
| `startsWith(field, value)` | LIKE `value%`，自动转义 | `.startsWith(User::getName, "John")` |
| `endsWith(field, value)` | LIKE `%value`，自动转义 | `.endsWith(User::getName, "son")` |
| `notStartsWith(field, value)` | NOT LIKE `value%`，自动转义 | `.notStartsWith(User::getName, "test")` |
| `notEndsWith(field, value)` | NOT LIKE `%value`，自动转义 | `.notEndsWith(User::getName, "test")` |
| `eqIgnoreCase(field, value)` | UPPER 等值比较；null → IS NULL | `.eqIgnoreCase(User::getName, "john")` |
| `neIgnoreCase(field, value)` | UPPER 不等于；null → IS NOT NULL | `.neIgnoreCase(User::getName, "john")` |
| `likeIgnoreCase(field, value)` | UPPER LIKE `%value%` | `.likeIgnoreCase(User::getName, "john")` |
| `in(field, values...)` | IN | `.in(User::getStatus, "A", "B")` |
| `in(field, collection)` | IN（集合） | `.in(User::getStatus, List.of("A", "B"))` |
| `notIn(field, values...)` | NOT IN | `.notIn(User::getStatus, "C", "D")` |
| `notIn(field, collection)` | NOT IN（集合） | `.notIn(User::getStatus, List.of("C", "D"))` |
| `isNull(field)` | IS NULL | `.isNull(User::getDeletedAt)` |
| `isNotNull(field)` | IS NOT NULL | `.isNotNull(User::getEmail)` |
| `isEmpty(field)` | IS EMPTY（集合） | `.isEmpty(User::getRoles)` |
| `isNotEmpty(field)` | IS NOT EMPTY（集合） | `.isNotEmpty(User::getRoles)` |
| `multiLike(keyword, fields...)` | 多字段 OR LIKE（SFunction） | `.multiLike("test", User::getName, User::getEmail)` |
| `multiLike(keyword, fieldNames...)` | 多字段 OR LIKE（字符串） | `.multiLike("test", "name", "email")` |
| `func(field, functionName, params...)` | 数据库函数（白名单） | `.func(User::getMetadata, "jsonb_exists", "key")` |
| `inSubQuery(field, subEntity, config)` | IN 子查询 | `.inSubQuery(User::getDeptId, Department.class, sub -> ...)` |
| `notInSubQuery(field, subEntity, config)` | NOT IN 子查询 | `.notInSubQuery(User::getDeptId, Department.class, sub -> ...)` |
| `where(BiFunction)` | 原始谓词 `(Path, CB) → Predicate` | `.where((path, cb) -> ...)` |
| `where(Function)` | 原始谓词 `(Root) → Predicate` | `.where(root -> ...)` |

### 条件守卫方法

所有条件方法都有 `boolean condition` 第一参数的变体。仅当 `true` 时添加条件：

```java
.eq(condition, field, value)
.ne(condition, field, value)
.gt(condition, field, value)
.like(condition, field, pattern)
.in(condition, field, collection)
.between(condition, field, start, end)
.multiLike(condition, keyword, fields...)
.func(condition, field, functionName, params...)
// ... 等等
```

### 分组方法

| 方法 | 说明 |
|------|------|
| `or(config)` | OR 分组（Consumer 模式，自动关闭） |
| `not(config)` | NOT 分组（Consumer 模式，自动关闭） |
| `join(field, config)` | INNER JOIN（Consumer 模式，自动关闭） |
| `leftJoin(field, config)` | LEFT JOIN（Consumer 模式，自动关闭） |
| `fetchJoin(field, config)` | FETCH JOIN（Consumer 模式，自动关闭） |
| `leftFetchJoin(field, config)` | LEFT FETCH JOIN（Consumer 模式，自动关闭） |
| `or()` | 打开 OR 分组（手动关闭，使用 `endOr()`） |
| `join(field)` | 打开 JOIN（手动关闭，使用 `endJoin()`） |
| `leftJoin(field)` | 打开 LEFT JOIN |
| `fetchJoin(field)` | 打开 FETCH JOIN |
| `leftFetchJoin(field)` | 打开 LEFT FETCH JOIN |
| `exists(class, config)` | EXISTS 子查询 |
| `notExists(class, config)` | NOT EXISTS 子查询 |
| `inSubQuery(field, class, config)` | IN 子查询 |
| `notInSubQuery(field, class, config)` | NOT IN 子查询 |

### 查询设置

| 方法 | 说明 |
|------|------|
| `distinct()` | 启用 DISTINCT |
| `groupBy(fields...)` | GROUP BY 子句 |
| `having(BiFunction)` | HAVING 子句 `(Path, CB) → Predicate` |
| `having(Function)` | HAVING 子句 `(Path) → Predicate` |
| `havingCount(field, op, value)` | 类型安全的 HAVING COUNT |
| `havingSum(field, op, value)` | 类型安全的 HAVING SUM |
| `havingAvg(field, op, value)` | 类型安全的 HAVING AVG |
| `havingMax(field, op, value)` | 类型安全的 HAVING MAX |
| `havingMin(field, op, value)` | 类型安全的 HAVING MIN |
| `orderByAsc(fields...)` | 升序排列 |
| `orderByDesc(fields...)` | 降序排列 |
| `timeout(seconds)` | 查询超时 |
| `lockMode(mode)` | 悲观锁模式 |

### 转换方法

| 方法 | 说明 |
|------|------|
| `toSpecification()` | 转换为 Specification |
| `toSpecification(external)` | 与外部 Specification 组合 |
| `toDescription()` | 人类可读的查询描述 |
| `and(other)` | 与另一个 QuerySpec 进行 AND 组合 → Specification |
| `or(other)` | 与另一个 QuerySpec 进行 OR 组合 → Specification |
| `then(other)` | 合并另一个 QuerySpec 的条件到当前实例 |
| `copy()` | QuerySpec 的防御性深拷贝 |
| `getSort()` | 获取 Sort 用于 Spring Data |
| `getQueryTimeout()` | 获取超时设置（未设置返回 null） |
| `getLockMode()` | 获取锁模式（未设置返回 null） |
| `applyQuerySettings(query)` | 应用超时/锁到 TypedQuery |
| `cacheKey()` | 生成缓存键字符串（包含值哈希） |

## JoinGroup\<T, J\>

JOIN 条件构建器。继承 `ConditionBuilder<J>`，包含所有条件方法。

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

OR 条件构建器。继承 `ConditionBuilder<T>`，包含所有条件方法。

| 方法 | 说明 |
|------|------|
| `or(config)` | 嵌套 OR 分组 |
| `or()` | 打开嵌套 OR（手动关闭） |
| `join(field)` | OR 内的 JOIN（手动关闭） |
| `leftJoin(field)` | OR 内的 LEFT JOIN（手动关闭） |
| `join(field, config)` | OR 内的 JOIN（Consumer 模式） |
| `leftJoin(field, config)` | OR 内的 LEFT JOIN（Consumer 模式） |
| `endOr()` | 关闭 OR 分组并返回 QuerySpec |

## NotGroup\<T\>

NOT 条件构建器。继承 `ConditionBuilder<T>`，包含所有条件方法。用于 `QuerySpec.not(config)` 内部。

| 方法 | 说明 |
|------|------|
| `join(field, config)` | NOT 内的 INNER JOIN（Consumer 模式） |
| `leftJoin(field, config)` | NOT 内的 LEFT JOIN（Consumer 模式） |

所有条件方法均可继承使用：`eq`、`ne`、`gt`、`ge`、`lt`、`le`、`like`、`notLike`、`startsWith`、`endsWith`、`in`、`notIn`、`between`、`isNull`、`isNotNull` 等。

## SubQuerySpec\<S\>

EXISTS/NOT EXISTS 子查询构建器，使用即时求值。

### 条件方法

| 方法 | 说明 |
|------|------|
| `eq`, `ne`, `eqStrict`, `neStrict`, `gt`, `ge`, `lt`, `le` | 比较运算符 |
| `like`, `notLike`, `startsWith`, `endsWith`, `notStartsWith`, `notEndsWith` | 字符串运算符 |
| `eqIgnoreCase`, `neIgnoreCase`, `likeIgnoreCase` | 忽略大小写字符串运算符 |
| `in`, `notIn`（可变参数和 Collection） | 集合运算符 |
| `between`, `notBetween` | 范围运算符 |
| `isNull`, `isNotNull` | Null 检查 |
| `isEmpty`, `isNotEmpty` | 集合空检查 |
| `multiLike(keyword, fields...)` | 多字段 LIKE |

### 特殊方法

| 方法 | 说明 |
|------|------|
| `select(field)` | 自定义 SELECT 子句（用于 IN 子查询） |
| `correlated()` | 获取关联的外部 Root |
| `correlatedEq(outer, inner)` | 类型化关联谓词 |
| `where(Function)` | 原始谓词 `(Root) → Predicate` |

## UpdateSpec\<T\>

批量 UPDATE 操作构建器。继承 `AbstractBulkOperationSpec`。

| 方法 | 说明 |
|------|------|
| `set(field, value)` | SET 子句 |
| `set(condition, field, value)` | 条件 SET |
| `setAdd(field, amount)` | SET field = field + amount（原子操作） |
| `setSubtract(field, amount)` | SET field = field - amount（原子操作） |
| `withVersionIncrement(enabled)` | 启用乐观锁版本递增 |
| `allowUnconditional(boolean)` | 允许无条件 UPDATE |
| `execute(em)` | 在现有事务中执行（需要 WHERE） |
| `executeInTransaction(em)` | 带事务管理执行 |
| `executeLimited(em, limit)` | 限量执行（通过 ID 子查询批处理） |
| `executeLimited(em, limit, pessimisticLock)` | 限量执行带悲观锁 |
| `updateAll(em)` | 无条件更新（需要 `allowUnconditional(true)`） |
| `updateAllInTransaction(em)` | 无条件更新带事务 |
| `toUpdate(em)` | 构建 CriteriaUpdate 不执行 |
| `countBeforeExecute(em)` | 执行前统计受影响行数 |

所有条件方法可用：`eq`, `ne`, `eqStrict`, `neStrict`, `gt`, `ge`, `lt`, `le`, `like`, `notLike`, `startsWith`, `endsWith`, `notStartsWith`, `notEndsWith`, `eqIgnoreCase`, `neIgnoreCase`, `likeIgnoreCase`, `in`, `notIn`, `between`, `notBetween`, `isNull`, `isNotNull`, `isEmpty`, `isNotEmpty`, `multiLike`, `func`, `where`, `or`, `not`。

### 静态方法

| 方法 | 说明 |
|------|------|
| `evictEntityCache(em, entityClass)` | 驱逐实体类型的 L1 缓存（Hibernate SessionFactory 或 em.clear() 回退） |

## DeleteSpec\<T\>

批量 DELETE 操作构建器。继承 `AbstractBulkOperationSpec`。

| 方法 | 说明 |
|------|------|
| `execute(em)` | 在现有事务中执行（需要 WHERE） |
| `executeInTransaction(em)` | 带事务管理执行 |
| `executeLimited(em, limit)` | 限量执行（通过 ID 子查询批处理） |
| `executeLimited(em, limit, pessimisticLock)` | 限量执行带悲观锁 |
| `executeAsSoftDelete(em, fieldName, deletedValue)` | 将硬删除转换为软删除 |
| `allowUnconditional(boolean)` | 允许无条件 DELETE |
| `deleteAll(em)` | 无条件删除（需要 `allowUnconditional(true)`） |
| `deleteAllInTransaction(em)` | 无条件删除带事务 |
| `toDelete(em)` | 构建 CriteriaDelete 不执行 |
| `countBeforeExecute(em)` | 执行前统计受影响行数 |

所有条件方法可用（与 UpdateSpec 相同）。

## MergeSpec\<T\>

UPSERT 操作构建器。支持 PostgreSQL、MySQL、Oracle、SQL Server。

| 方法 | 说明 |
|------|------|
| `MergeSpec(entityClass)` | 构造函数 |
| `getEntityClass()` | 获取实体类 |
| `withEntity(entity)` | 设置要 upsert 的实体 |
| `onConflict(fields...)` | 指定冲突列 |
| `updateOnConflict(fields...)` | 冲突时更新的列 |
| `dialect(strategy)` | 设置自定义方言（覆盖自动检测） |
| `execute(em)` | 在现有事务中执行 |
| `executeWithCallbacks(em)` | 执行时触发 JPA 生命周期回调 |
| `executeInTransaction(em)` | 带事务管理执行 |
| `executeBatch(entities, em)` | 批量 UPSERT（方言支持时自动多行） |
| `executeBatch(entities, em, batchSize)` | 批量 UPSERT 指定批次大小 |
| `executeBatchInTransaction(entities, em)` | 批量 UPSERT 带事务 |
| `executeBatchInSeparateTransactions(entities, em, batchSize)` | 每批独立事务提交 |

## CteSpec

公共表表达式构建器。

| 方法 | 说明 |
|------|------|
| `CteSpec.with(name)` | 非递归 CTE |
| `CteSpec.withRecursive(name)` | 递归 CTE |
| `columns(columns...)` | 设置 CTE 列名 |
| `as(sql)` | 设置 CTE 主体 SQL（不安全） |
| `asSafe(sqlTemplate, params...)` | 参数化 CTE 主体（推荐） |
| `and(name)` | 添加另一个 CTE |
| `select(sql)` | 设置主查询 |
| `setParameter(name, value)` | 设置命名参数 |
| `getResultList(em)` | 执行并返回 `List<Object[]>` |
| `getSingleResult(em)` | 执行并返回 `Optional<Object[]>` |
| `getResultStream(em, consumer)` | 流式查询结果 |
| `buildSql()` | 仅构建 SQL 不执行 |
| `isStrictMode()` | 返回 true（始终强制） |

## ProjectionSpec\<T\>

DTO 投影查询构建器，支持 Tuple 和构造函数 DTO 投影。

| 方法 | 说明 |
|------|------|
| `ProjectionSpec(entityClass)` | 构造函数（自动检测 @SoftDelete） |
| `withDefaults(entityClass)` | 静态工厂（同构造函数） |
| `select(field)` | 添加字段到 SELECT |
| `distinct()` | 启用 SELECT DISTINCT |
| `selectCount()` | `COUNT(*)` 别名为 `"count"` |
| `selectCountDistinct()` | `COUNT(DISTINCT root)` 别名为 `"count_distinct"` |
| `selectSum(field)` | `SUM(field)` 别名为 `"sum_<name>"` |
| `selectAvg(field)` | `AVG(field)` 别名为 `"avg_<name>"` |
| `selectMax(field)` | `MAX(field)` 别名为 `"max_<name>"` |
| `selectMin(field)` | `MIN(field)` 别名为 `"min_<name>"` |
| `asDto(dtoClass)` | 指定 DTO 类用于构造函数投影 |
| `withSoftDeleteFilter()` | 显式启用软删除过滤 |
| `withDeepPaginationThreshold(int)` | 设置深度分页警告阈值 |
| `withDeepPaginationLimit(int)` | 设置深度分页硬限制（-1 禁用） |
| `groupBy(fields...)` | GROUP BY 子句 |
| `having(predicate)` | HAVING 子句（BiFunction） |
| `join(field, config)` | INNER JOIN 带条件 |
| `leftJoin(field, config)` | LEFT JOIN 带条件 |
| `orderByAsc(field)` | 升序排列 |
| `orderByDesc(field)` | 降序排列 |
| `where(config)` | 通过 `Consumer<QuerySpec<T>>` 添加 WHERE 条件 |
| `conditions()` | 直接访问底层 QuerySpec |
| `toTupleQuery(em)` | 构建 Tuple 查询（默认最大结果数） |
| `toTupleQuery(em, maxResults)` | 构建 Tuple 查询指定最大结果数 |
| `toDtoQuery(em)` | 构建 DTO 构造函数查询（需要先调用 `asDto()`） |
| `toDtoQuery(em, maxResults)` | 构建 DTO 查询指定最大结果数 |
| `getResultStream(em)` | 流式 Tuple 结果（必须使用 try-with-resources） |
| `findPage(em, pageable)` | 分页 Tuple 查询 |

### ProjectionSpec.ProjectionJoinGroup\<E\>

投影查询中的 JOIN 条件构建器。实现 `ConditionBuilder<E>`，包含所有条件方法（eq, ne, like, in, between, isNull, isNotNull 等）。

## MyJpaTemplate

常见操作的便利模板。自动配置的 Spring Bean。

### 查询方法

| 方法 | 说明 |
|------|------|
| `findById(class, id)` | 根据 ID 查找实体（软删除感知） |
| `findOne(class, spec)` | 查找单个实体 |
| `findOne(class, consumer)` | Lambda 便利方法 |
| `count(class, spec)` | 统计实体数量 |
| `count(class, consumer)` | Lambda 便利方法 |
| `findAll(class, spec)` | 查找所有（受 `maxResults` 限制） |
| `findAll(class, spec, maxResults)` | 自定义限制查找（-1 = 无限制） |
| `findAll(class, spec, sort)` | 带排序查找 |
| `findAll(class, spec, entityGraph)` | 带 EntityGraph 查找 |
| `findAll(class, spec, entityGraph, maxResults)` | 带 EntityGraph 和限制查找 |
| `findAll(class, spec, pageable)` | 分页查询 |
| `findAll(class, consumer)` | Lambda 便利方法 |
| `findAll(class, consumer, maxResults)` | Lambda + 自定义限制 |
| `findAll(class, consumer, sort)` | Lambda + 排序 |
| `findAll(class, consumer, pageable)` | Lambda + 分页 |
| `findAllStream(class, spec, consumer)` | 流式结果（无内存限制） |
| `findAllStream(class, spec, entityGraph, consumer)` | 流式 + EntityGraph |
| `findAllStream(class, consumer, consumer)` | Lambda 流式 |
| `find(class, spec)` | 使用原始 Specification 查找 |
| `find(class, spec, maxResults)` | 使用原始 Specification 和限制查找 |
| `findPage(class, spec, pageable)` | 使用原始 Specification 分页 |
| `findSlice(class, spec, pageable)` | 切片查询（无 count 查询） |
| `findAllById(class, ids)` | 批量按 ID 查找（自动 IN 子句拆分） |
| `findNotDeletedAllById(class, ids)` | 按 ID 排除软删除的记录 |
| `findKeysetPage(class, spec, sort, pageSize, lastValues)` | 基于游标的分页 |
| `findAllCached(class, spec, ttlSeconds)` | 缓存查询 |
| `findAllCached(class, consumer, ttlSeconds)` | Lambda 缓存查询 |

### 变更方法

| 方法 | 说明 |
|------|------|
| `update(class)` | 创建 UpdateSpec |
| `delete(class)` | 创建 DeleteSpec |
| `execute(UpdateSpec)` | 在事务中执行更新 |
| `execute(DeleteSpec)` | 在事务中执行删除 |
| `execute(MergeSpec)` | 在事务中执行 upsert |
| `executeBatch(UpdateSpec, batchSize)` | 批量更新（flush/clear） |
| `executeBatch(DeleteSpec, batchSize)` | 批量删除（flush/clear） |
| `executeBatch(MergeSpec, entities, batchSize)` | 批量 upsert |
| `executeWithMaxRows(UpdateSpec, maxRows)` | 限量更新 |
| `executeWithMaxRows(DeleteSpec, maxRows)` | 限量删除 |
| `executeBatchInSeparateTransactions(UpdateSpec, batchSize)` | 更新每批独立提交 |
| `executeBatchInSeparateTransactions(DeleteSpec, batchSize)` | 删除每批独立提交 |
| `executeBatchInSeparateTransactions(UpdateSpec, batchSize, strategy)` | 带失败策略 |
| `executeBatchInSeparateTransactions(DeleteSpec, batchSize, strategy)` | 带失败策略 |

### 批量保存方法

| 方法 | 说明 |
|------|------|
| `saveAllBatched(entities, batchSize)` | 基于 Merge 的批量保存（upsert） |
| `saveAllBatchedPure(entities, batchSize)` | 仅持久化批量保存（仅插入） |
| `saveAllBatchedInSeparateTransactions(entities, batchSize)` | 每批独立事务提交 |

### 常量

| 常量 | 默认值 | 说明 |
|------|--------|------|
| `DEFAULT_MAX_RESULTS` | `10000` | findAll/find 的默认最大结果数 |
| `DEFAULT_DEEP_PAGINATION_OFFSET_THRESHOLD` | `100000` | 深度分页警告的 offset 阈值 |
| `DEFAULT_DEEP_PAGINATION_OFFSET_LIMIT` | `1000000` | 深度分页硬限制 |

### BatchResult Record

批量操作（独立事务）返回的结果。

| 字段 | 类型 | 说明 |
|------|------|------|
| `totalRows` | `int` | 总影响行数 |
| `batchCount` | `int` | 执行的批次数 |
| `success` | `boolean` | 所有批次是否成功 |
| `failedBatchIndex` | `int` | 失败批次索引（-1 表示无） |
| `failureCause` | `Throwable` | 批次失败时的异常（成功时为 null） |

### BatchFailureStrategy 枚举

| 值 | 说明 |
|----|------|
| `CONTINUE` | 失败时继续处理剩余批次 |
| `ABORT` | 首个批次失败时停止处理 |

### BatchPartialCommitException

当使用 `CONTINUE` 策略的批量操作部分失败时抛出。携带失败前已提交的信息。

| 方法 | 说明 |
|------|------|
| `getOperationName()` | 操作名称（如 "UPDATE"、"DELETE"） |
| `getCommittedRows()` | 失败前已提交的行数 |
| `getCompletedBatches()` | 失败前已完成的批次数 |

```java
try {
    template.executeBatchInSeparateTransactions(updateSpec, 500, BatchFailureStrategy.CONTINUE);
} catch (BatchPartialCommitException e) {
    log.warn("部分提交：{} 行，{} 个批次成功",
        e.getCommittedRows(), e.getCompletedBatches());
}
```

## MyJpaRepository\<T, ID\>

基础仓库接口。继承 `JpaRepository<T, ID>` 和 `JpaSpecificationExecutor<T>`。

### 查询方法（Lambda 便利）

| 方法 | 说明 |
|------|------|
| `findAll(Consumer<QuerySpec<T>>)` | Lambda 查找所有 |
| `findAll(Consumer<QuerySpec<T>>, Pageable)` | Lambda 分页查找 |
| `findAll(Consumer<QuerySpec<T>>, Sort)` | Lambda 排序查找 |
| `findOne(Consumer<QuerySpec<T>>)` | Lambda 查找单个 |
| `count(Consumer<QuerySpec<T>>)` | Lambda 统计 |
| `exists(Consumer<QuerySpec<T>>)` | Lambda 判断存在 |

### 查询方法（Specification）

| 方法 | 说明 |
|------|------|
| `findAll(Specification<T>)` | 使用 Specification 查找所有 |
| `findAll(Specification<T>, Pageable)` | 使用 Specification 分页查找 |
| `findAll(Specification<T>, Sort)` | 使用 Specification 排序查找 |
| `findOne(Specification<T>)` | 使用 Specification 查找单个 |
| `count(Specification<T>)` | 使用 Specification 统计 |
| `exists(Specification<T>)` | 使用 Specification 判断存在 |

### 批量操作方法（Lambda）

| 方法 | 说明 |
|------|------|
| `update(Consumer<UpdateSpec<T>>)` | Lambda 批量更新 |
| `delete(Consumer<DeleteSpec<T>>)` | Lambda 批量删除 |
| `merge(Consumer<MergeSpec<T>>)` | Lambda 批量 upsert |

### 批量操作方法（Execute）

| 方法 | 说明 |
|------|------|
| `execute(UpdateSpec<T>)` | 执行预构建的 update |
| `execute(DeleteSpec<T>)` | 执行预构建的 delete |
| `execute(MergeSpec<T>)` | 执行预构建的 merge |

### 软删除方法

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

JPA EntityGraph 构建辅助器，用于急切加载策略。

| 方法 | 说明 |
|------|------|
| `forEntity(class)` | 创建新实例 |
| `add(path)` | 添加属性路径（支持点号表示法，如 `"roles.permissions"`） |
| `add(paths...)` | 添加多个路径 |
| `nest(attribute)` | 从上次添加的路径链接嵌套路径 |
| `remove(path)` | 移除属性路径 |
| `clear()` | 移除所有路径 |
| `loadGraph()` | 设置 LOAD 图模式 |
| `fetchGraph()` | 设置 FETCH 图模式（默认） |
| `buildGraph(em)` | 构建 JPA EntityGraph |
| `toHints(em)` | 转换为查询提示 Map |
| `apply(query, em)` | 应用到 TypedQuery |

## SoftDeleteHelper

软删除工具类，带缓存的 Specification。

| 方法 | 说明 |
|------|------|
| `isNotDeleted(class)` | 未删除实体的 Specification（缓存） |
| `isDeleted(class)` | 已删除实体的 Specification（缓存） |
| `notDeletedQuery(class)` | 带软删除过滤的新 QuerySpec |
| `findSoftDeleteField(class)` | 查找 `@SoftDelete` 字段名（缓存） |
| `isSoftDeleted(class, entity)` | 检查实体实例是否已软删除 |
| `buildNotDeleted(cb, root, fieldName, entityClass)` | 构建谓词（用于 JOIN 场景） |
| `shutdown()` | 清除所有缓存 |

## SoftDeleteBulkExecutor

批量软删除操作的静态工具类。

| 方法 | 说明 |
|------|------|
| `softDeleteAll(em, class, allowUnconditional)` | 软删除所有（带行数保护） |
| `softDeleteAll(em, class, allowUnconditional, maxRows)` | 软删除所有（自定义最大行数） |
| `softDeleteByIds(em, class, ids)` | 按 ID 软删除（原生 SQL） |
| `softDeleteAllUsingCriteriaUpdate(em, class, allowUnconditional)` | 使用 CriteriaUpdate |
| `softDeleteAllUsingCriteriaUpdate(em, class, allowUnconditional, maxRows)` | 使用 CriteriaUpdate 指定最大行数 |
| `softDeleteByIdsUsingEntityManager(em, class, ids)` | 使用 EntityManager |
| `setEventPublisher(publisher)` | 设置删除后事件发布者 |

## SoftDeleteContext

虚拟线程兼容的软删除上下文管理器。

| 方法 | 说明 |
|------|------|
| `isIgnoreSoftDelete()` | 检查当前是否禁用软删除过滤 |
| `withIgnore(Runnable)` | 禁用软删除过滤执行 Runnable |
| `withIgnore(Supplier<T>)` | 禁用软删除过滤执行 Supplier |
| `ignoreScope()` | 返回 AutoCloseable 用于 try-with-resources |
| `pushIgnore()` | 推入忽略标志（旧方式） |
| `popIgnore()` | 弹出忽略标志（旧方式） |
| `reset()` | 强制重置所有忽略标志 |
| `captureAndResetForAsync()` | 为异步边界捕获状态 |
| `restoreForAsync(state)` | 在异步任务中恢复状态 |
| `getIgnoreCount()` | 当前忽略深度 |
| `getMaxIgnoreCount()` | 最大允许忽略深度 |

## @SoftDelete

注解，用于标记字段为软删除标志。支持 `boolean`、`Boolean`、`Integer`、`String` 和 `Enum` 类型。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `deletedValue` | `String` | `""` | Enum 类型的"已删除"状态常量名 |
| `deletedIntValue` | `int` | `1` | Integer 类型的"已删除"值 |
| `deletedStringValue` | `String` | `"1"` | String 类型的"已删除"值 |
| `deletedTimestampField` | `String` | `""` | 自动设置删除时间戳的字段名 |

- **boolean/Boolean**: `true` = 已删除，`false`/`null` = 未删除
- **Integer**: 匹配 `deletedIntValue` 的值 = 已删除，`null` = 未删除
- **String**: 匹配 `deletedStringValue` 的值 = 已删除，`null` = 未删除
- **Enum**: 匹配 `deletedValue` 的值 = 已删除，其他 = 未删除

## @IgnoreSoftDelete

注解，用于跳过方法或类型的自动软删除过滤。

- **目标**: `METHOD`, `TYPE`
- **保留**: `RUNTIME`

## @Encrypt

AES-GCM 字段级加密的标记注解。无属性。

- **Target**: `FIELD`
- **Retention**: `RUNTIME`
- **Requires**: `EncryptConverter`（自动配置）
- **Field type**: `String` only

## @Mask

JSON 序列化的字段脱敏注解。

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | `MaskType` | 脱敏策略（必填） |

### MaskType

| 值 | 示例输出 |
|----|----------|
| `PHONE` | `138****1234` |
| `EMAIL` | `u***@example.com` |
| `ID_CARD` | `110***********1234` |
| `NAME` | `张*` |
| `BANK_CARD` | `6222***********1234` |
| `ADDRESS` | `北京市****` |
| `LICENSE_PLATE` | `京A****` |

## @RetryOnOptimisticLock

方法级注解，用于乐观锁异常时自动重试。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxRetries` | `int` | `3` | 最大重试次数 |
| `backoffMs` | `long` | `100` | 初始退避（指数退避：backoffMs * 2^attempt） |

## @CodeEnum / @CodeEnumValue

Hibernate 6 枚举到列编码的转换。

- `@CodeEnum` — 标记枚举字段使用编码存储
- `@CodeEnumValue` — 标记枚举中持有数据库值的字段

```java
public enum Gender {
    @CodeEnumValue
    MALE('M'),
    FEMALE('F');

    private final char code;
}

@Entity
public class User {
    @CodeEnum
    @Column(columnDefinition = "CHAR(1)")
    private Gender gender;
}
```

## Spec

用于通过布尔逻辑组合 `Specification<T>` 对象的静态工具类。

| 方法 | 说明 |
|------|------|
| `Spec.all(specs...)` | AND 组合多个 Specification |
| `Spec.any(specs...)` | OR 组合多个 Specification |
| `Spec.not(spec)` | 取反 Specification |
| `Spec.always()` | 始终为真（匹配所有） |
| `Spec.never()` | 始终为假（不匹配任何） |
| `Spec.when(condition, spec)` | 条件应用 Specification |

```java
Specification<User> active = (root, query, cb) -> cb.equal(root.get("status"), "ACTIVE");
Specification<User> adult = (root, query, cb) -> cb.greaterThan(root.get("age"), 18);

// AND：两者都必须匹配
Specification<User> combined = Spec.all(active, adult);

// OR：任一匹配
Specification<User> combined = Spec.any(active, adult);

// NOT：取反
Specification<User> combined = Spec.not(active);

// 条件应用
Specification<User> combined = Spec.when(includeDeleted, Spec.always());
```

## FunctionWhitelist

用于 `func()` 的数据库函数名的运行时可扩展白名单。函数必须同时通过安全白名单和（在布尔上下文中）布尔白名单。

| 方法 | 说明 |
|------|------|
| `addSafeFunctionNames(collection)` | 启动时添加安全函数名 |
| `addBooleanFunctionNames(collection)` | 启动时添加布尔函数名 |
| `freezeExtraFunctionNames()` | 冻结为不可变快照（添加后自动调用） |
| `containsSafeFunction(name)` | 检查函数是否在安全白名单中 |
| `containsBooleanFunction(name)` | 检查函数是否在布尔白名单中 |
| `reset()` | 清除所有扩展（用于测试） |

```java
// 启动时编程注册
FunctionWhitelist.addSafeFunctionNames(List.of("MY_CUSTOM_FUNC", "JSONB_EXTRACT"));
FunctionWhitelist.addBooleanFunctionNames(List.of("MY_CUSTOM_CHECK"));

// 或通过配置（推荐）
// myjpa-plus.query.extra-safe-functions=MY_CUSTOM_FUNC,JSONB_EXTRACT
// myjpa-plus.query.extra-boolean-functions=MY_CUSTOM_CHECK
```

## PageableHelper

分页工具类。

| 方法 | 说明 |
|------|------|
| `unsorted(page, size)` | 无排序的 PageRequest（保留 QuerySpec 排序） |
| `merge(pageable, spec)` | 合并 Pageable 排序和 QuerySpec 排序（QuerySpec 优先） |
| `sorted(page, size, sort)` | 带显式排序的 PageRequest |
| `determineFetchSize(em)` | 获取方言特定的流式 fetch size（PostgreSQL=100，MySQL=MIN_VALUE，其他=0） |

## LambdaUtils

Lambda 工具类。LRU 缓存（默认 4096，可通过 `-Dmyjpa-plus.lambda-cache-size` 配置）。

| 方法 | 说明 |
|------|------|
| `getPropertyName(function)` | 从方法引用提取属性名 |

## InClauseBuilder

IN 子句批处理工具。自动拆分大型 IN 子句以兼容 Oracle（每批最多 1000 个，可通过 `-Dmyjpa-plus.in-clause-max-size` 配置）。

| 方法 | 说明 |
|------|------|
| `in(cb, path, values...)` | 带自动批处理的 IN |
| `in(cb, path, collection)` | 带自动批处理的 IN |
| `notIn(cb, path, values...)` | 带自动批处理的 NOT IN |
| `notIn(cb, path, collection)` | 带自动批处理的 NOT IN |

## BaseEntity

`@MappedSuperclass` 提供通用审计字段和 JPA 生命周期回调。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `Long` | 自动生成的 ID（`@GeneratedValue(IDENTITY)`） |
| `createdAt` | `Instant` | 创建时间戳（persist 时自动设置） |
| `updatedAt` | `Instant` | 更新时间戳（persist/update 时自动设置） |

## QueryAggregates

聚合表达式的静态工具类。

| 方法 | 说明 |
|------|------|
| `count(root, cb)` | COUNT(*) 表达式 |
| `count(root, field, cb)` | COUNT(field) 表达式 |
| `countDistinct(root, field, cb)` | COUNT(DISTINCT field) 表达式 |
| `sum(root, field, cb)` | SUM 表达式 |
| `avg(root, field, cb)` | AVG 表达式 |
| `max(root, field, cb)` | MAX 表达式 |
| `min(root, field, cb)` | MIN 表达式 |

## CacheAdapter

可插拔的查询结果缓存 SPI。

| 方法 | 说明 |
|------|------|
| `get(key)` | 获取缓存值 |
| `put(key, value, ttlSeconds)` | 写入缓存指定 TTL |
| `evict(key)` | 移除条目 |
| `evictByPrefix(prefix)` | 按前缀移除 |
| `clear()` | 清除所有条目 |
| `size()` | 条目数 |
| `getHitRate()` | 命中率（0.0-1.0） |
| `getHitCount()` | 命中次数 |
| `getMissCount()` | 未命中次数 |
| `resetStats()` | 重置统计 |
| `putAll(entries, defaultTtl)` | 批量写入 |
| `evictAll(keys)` | 批量移除 |
| `close()` | 释放资源 |
| `CacheAdapter.disabled()` | 禁用的缓存适配器工厂方法 |

## DeepPaginationGuard

| 方法 | 说明 |
|------|------|
| `check(offset, threshold, hardLimit, lastWarnTime)` | 检查分页深度；警告或抛出异常 |

## KeysetPage\<T\>

| 方法 | 说明 |
|------|------|
| `getContent()` | 页面结果 |
| `hasNext()` | 是否有下一页 |
| `getLastSortValues()` | 下一页的游标 |

## MyJpaPlusException

MyJpa-Plus 的基础运行时异常。构造函数：`(String message)`, `(String message, Throwable cause)`。

## BulkOperationException

批量操作失败时抛出的异常。继承 `MyJpaPlusException`。

## QueryBuildException

查询构建失败时抛出的异常。继承 `MyJpaPlusException`。

## SecurityViolationException

SQL 注入或安全检查失败时抛出的异常。继承 `MyJpaPlusException`。

## DialectStrategy

数据库特定 UPSERT SQL 生成的接口。

| 方法 | 说明 |
|------|------|
| `name()` | 方言标识符 |
| `escapeIdentifier(String)` | 转义 SQL 标识符 |
| `buildUpsertSql(...)` | 构建单行 UPSERT SQL |
| `supportsBatchUpsert()` | 检查多行 UPSERT 支持 |
| `buildBatchUpsertSql(...)` | 构建多行 UPSERT SQL |

### 内置实现

| 类 | 数据库 |
|----|--------|
| `PostgresDialect` | PostgreSQL |
| `MysqlDialect` | MySQL |
| `OracleDialect` | Oracle |
| `SqlServerDialect` | SQL Server |

### DialectDetector

| 方法 | 说明 |
|------|------|
| `detectDialect(em)` | 从 EntityManager 自动检测数据库方言 |
| `registerDialect(name, strategy)` | 注册自定义方言 |
| `getDialectStrategy(name)` | 按名称获取方言 |

## EncryptConverter

透明 AES/GCM 加密转换器。密钥来自 `MYJPA_ENCRYPT_KEY` 环境变量或 `myjpa.encrypt.key` 系统属性。

| 方法 | 说明 |
|------|------|
| `convertToDatabaseColumn(String)` | 写入时加密 |
| `convertToEntityAttribute(String)` | 读取时解密 |
| `reEncrypt(String)` | 使用当前密钥重新加密（用于密钥轮换） |
| `clearCaches()` | 清除密钥缓存和密码池 |
| `warmUpKeyCache()` | 异步密钥预热 |
| `warmUpKeyCacheSync()` | 同步密钥预热 |
| `refreshKeyVersion()` | 强制刷新密钥版本 |
| `validateKeyConfiguration()` | 启动时验证密钥 |
| `setPbkdf2Iterations(int)` | 配置 PBKDF2 迭代次数 |
| `setSkipSaltCheck(boolean)` | 开发模式跳过盐值检查 |
| `shutdownWarmUpExecutor()` | 清理 |

## QueryMetricsCollector

收集查询性能指标（执行次数、总/平均/最大时间、慢查询检测）的单例。

| 方法 | 说明 |
|------|------|
| `getInstance()` | 获取单例实例 |
| `setEnabled(boolean)` | 启用/禁用指标收集 |
| `isEnabled()` | 检查是否启用 |
| `setSlowQueryThresholdMs(long)` | 设置慢查询阈值（毫秒） |
| `recordQuery(name, durationNanos)` | 记录一次查询执行 |
| `getStats(name)` | 获取指定查询的统计 |
| `getAllStats()` | 获取所有查询统计 |
| `getExecutionCount(name)` | 获取指定查询的执行次数 |
| `reset()` | 重置所有指标 |
| `reset(name)` | 重置指定查询的指标 |

### QueryStats（内部类）

| 方法 | 说明 |
|------|------|
| `getExecutionCount()` | 执行次数 |
| `getTotalTimeMs()` | 总执行时间（毫秒） |
| `getAverageTimeMs()` | 平均执行时间（毫秒） |
| `getMaxTimeMs()` | 最大执行时间（毫秒） |

```java
QueryMetricsCollector metrics = QueryMetricsCollector.getInstance();
metrics.setSlowQueryThresholdMs(500);

// 记录查询
long start = System.nanoTime();
try {
    // 执行查询
} finally {
    metrics.recordQuery("findAll", System.nanoTime() - start);
}

// 获取统计
QueryMetricsCollector.QueryStats stats = metrics.getStats("findAll");
```

## SlowQueryDataSourceProxy

包装 JDBC 连接用于慢查询检测的 DataSource 代理。

## SlowQueryListener

慢查询事件的回调接口。

## EntityModifiedEvent

当实体被修改时发布的 Spring 事件，用于触发缓存失效。当缓存自动失效机制不足时，可使用 `ApplicationEventPublisher` 手动发布此事件。

| 方法 | 说明 |
|------|------|
| `EntityModifiedEvent(entityClass, affectedRows)` | 按实体类构造 |
| `EntityModifiedEvent(entityName, affectedRows)` | 按实体名构造 |
| `getEntityName()` | 获取实体名称 |
| `getAffectedRows()` | 获取受影响行数 |

```java
@Autowired
private ApplicationEventPublisher publisher;

// 在自定义批量操作后触发缓存失效
publisher.publishEvent(new EntityModifiedEvent(User.class, 500));
```

## SampledEvictionCache\<K, V\>

基于采样淘汰的固定大小缓存。内部被 `LambdaUtils` 使用，也可作为独立缓存供自定义场景使用。

| 方法 | 说明 |
|------|------|
| `SampledEvictionCache(maxSize, evictionTargetRatio, samplingInterval, initialCapacity)` | 完整构造函数 |
| `SampledEvictionCache(maxSize, evictionTargetRatio, samplingInterval)` | 构造函数（默认初始容量 64） |
| `get(key)` | 按 key 获取值 |
| `computeIfAbsent(key, mappingFunction)` | 按需计算并添加（带采样淘汰） |
| `put(key, value)` | 写入键值对 |
| `size()` | 当前缓存大小 |
| `setMaxSize(maxSize)` | 动态调整最大容量 |
| `clear()` | 清除所有条目 |

## MaskSerializer

用于 `@Mask` 注解的 Jackson 序列化器。同时提供 Jackson 模块和静态工具方法。

| 方法 | 说明 |
|------|------|
| `MaskSerializer()` | 默认构造函数（使用 `MaskType.NAME`） |
| `MaskSerializer(maskType)` | 指定脱敏类型的构造函数 |
| `mask(value, maskType)` | 静态脱敏工具方法（可独立使用） |

### MaskModule（内部类）

自动发现 `@Mask` 注解的 Jackson 模块。在 `ObjectMapper` 上注册：

```java
ObjectMapper mapper = new ObjectMapper();
mapper.registerModule(new MaskSerializer.MaskModule());
```

或直接在实体字段上使用 `@Mask` 注解——Spring Boot 自动配置支持。

## EntityCodeGenerator

从表定义生成实体和仓库代码的静态工具类（实验性）。

| 方法 | 说明 |
|------|------|
| `generateEntity(tableName, columns, entityPackage)` | 生成实体类 |
| `generateEntity(tableName, columns, entityPackage, template)` | 使用自定义模板生成 |
| `generateRepository(tableName, columns, entityPackage, repoPackage)` | 生成仓库接口 |
| `generateRepository(tableName, columns, entityPackage, repoPackage, template)` | 使用自定义模板生成 |
| `loadTemplateFromClasspath(classpathLocation)` | 从 classpath 加载模板 |
| `loadTemplateFromFile(templatePath)` | 从文件加载模板 |
