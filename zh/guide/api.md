# API 参考

## SFunction\<T, R\>

可序列化的 `Function<T, R>`，用于方法引用（如 `Entity::getField`）。支持通过 `SerializedLambda` 在运行时提取属性名。

## QuerySpec\<T\>

构建类型安全查询的核心类。实现 `Specification<T>`。

### 条件方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `eq(field, value)` | 等于；null 值 → IS NULL | `.eq(User::getStatus, "ACTIVE")` |
| `ne(field, value)` | 不等于；null 值 → IS NOT NULL | `.ne(User::getStatus, "DELETED")` |
| `gt(field, value)` | 大于 | `.gt(User::getAge, 18)` |
| `ge(field, value)` | 大于等于 | `.ge(User::getAge, 18)` |
| `lt(field, value)` | 小于 | `.lt(User::getAge, 65)` |
| `le(field, value)` | 小于等于 | `.le(User::getAge, 65)` |
| `between(field, start, end)` | 范围（包含） | `.between(User::getAge, 18, 65)` |
| `notBetween(field, start, end)` | 不在范围内 | `.notBetween(User::getAge, 0, 17)` |
| `like(field, pattern)` | LIKE（调用者提供通配符） | `.like(User::getName, "%John%")` |
| `notLike(field, pattern)` | NOT LIKE | `.notLike(User::getName, "%test%")` |
| `startsWith(field, value)` | LIKE `value%`，自动转义 | `.startsWith(User::getName, "John")` |
| `endsWith(field, value)` | LIKE `%value`，自动转义 | `.endsWith(User::getName, "son")` |
| `contains(field, value)` | LIKE `%value%`，自动转义 | `.contains(User::getName, "oh")` |
| `rawLike(field, pattern)` | LIKE `%pattern%`，自动转义并包裹 | `.rawLike(User::getName, "oh")` |
| `eqIgnoreCase(field, value)` | UPPER 等值比较；null → IS NULL | `.eqIgnoreCase(User::getName, "john")` |
| `likeIgnoreCase(field, pattern)` | UPPER LIKE | `.likeIgnoreCase(User::getName, "%john%")` |
| `in(field, values...)` | IN | `.in(User::getStatus, "A", "B")` |
| `in(field, collection)` | IN（集合） | `.in(User::getStatus, List.of("A", "B"))` |
| `notIn(field, values...)` | NOT IN | `.notIn(User::getStatus, "C", "D")` |
| `notIn(field, collection)` | NOT IN（集合） | `.notIn(User::getStatus, List.of("C", "D"))` |
| `isNull(field)` | IS NULL | `.isNull(User::getDeletedAt)` |
| `isNotNull(field)` | IS NOT NULL | `.isNotNull(User::getEmail)` |
| `isEmpty(field)` | IS EMPTY（集合） | `.isEmpty(User::getRoles)` |
| `isNotEmpty(field)` | IS NOT EMPTY（集合） | `.isNotEmpty(User::getRoles)` |
| `multiLike(keyword, fields...)` | 多字段 OR LIKE | `.multiLike("test", User::getName, User::getEmail)` |
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
| `or()` | 打开 OR 分组（手动关闭） |
| `join(field)` | 打开 JOIN（手动关闭） |
| `leftJoin(field)` | 打开 LEFT JOIN |
| `fetchJoin(field)` | 打开 FETCH JOIN |
| `leftFetchJoin(field)` | 打开 LEFT FETCH JOIN |
| `exists(class, config)` | EXISTS 子查询 |
| `notExists(class, config)` | NOT EXISTS 子查询 |

### 查询设置

| 方法 | 说明 |
|------|------|
| `distinct()` | 启用 DISTINCT |
| `groupBy(fields...)` | GROUP BY 子句 |
| `having(BiFunction)` | HAVING 子句 `(Path, CB) → Predicate` |
| `having(Function)` | HAVING 子句 `(Path) → Predicate` |
| `orderByAsc(fields...)` | 升序排列 |
| `orderByDesc(fields...)` | 降序排列 |
| `timeout(seconds)` | 查询超时 |
| `lockMode(mode)` | 悲观锁模式 |

### 转换方法

| 方法 | 说明 |
|------|------|
| `toSpecification()` | 转换为 Specification |
| `toSpecification(external)` | 与外部 Specification 组合 |
| `and(other)` | 与另一个 QuerySpec 进行 AND 组合 → Specification |
| `or(other)` | 与另一个 QuerySpec 进行 OR 组合 → Specification |
| `then(other)` | 合并另一个 QuerySpec 的条件到当前实例 |
| `getSort()` | 获取 Sort 用于 Spring Data |
| `getQueryTimeout()` | 获取超时设置（未设置返回 null） |
| `getLockMode()` | 获取锁模式（未设置返回 null） |
| `applyQuerySettings(query)` | 应用超时/锁到 TypedQuery |

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

## SubQuerySpec\<S\>

EXISTS/NOT EXISTS 子查询构建器，使用即时求值。

### 条件方法

| 方法 | 说明 |
|------|------|
| `eq`, `ne`, `gt`, `ge`, `lt`, `le` | 比较运算符 |
| `like`, `notLike`, `startsWith`, `endsWith`, `contains` | 字符串运算符 |
| `eqIgnoreCase`, `likeIgnoreCase` | 忽略大小写字符串运算符 |
| `in`, `notIn`（可变参数和 Collection） | 集合运算符 |
| `between`, `notBetween` | 范围运算符 |
| `isNull`, `isNotNull` | Null 检查 |
| `isEmpty`, `isNotEmpty` | 集合空检查 |
| `multiLike(keyword, fields...)` | 多字段 LIKE |

### 特殊方法

| 方法 | 说明 |
|------|------|
| `correlated()` | 获取关联的外部 Root |
| `correlatedEq(outer, inner)` | 类型化关联谓词 |
| `select(field)` | 自定义 SELECT 子句 |
| `where(Function)` | 原始谓词 `(Root) → Predicate` |

## UpdateSpec\<T\>

批量 UPDATE 操作构建器。继承 `AbstractBulkOperationSpec`。

| 方法 | 说明 |
|------|------|
| `set(field, value)` | SET 子句 |
| `set(condition, field, value)` | 条件 SET |
| `execute(em)` | 在现有事务中执行（需要 WHERE） |
| `executeInTransaction(em)` | 带事务管理执行 |
| `executeLimited(em, limit)` | 限量执行（通过 ID 子查询批处理） |
| `updateAll(em)` | 无条件更新 |
| `updateAllInTransaction(em)` | 无条件更新带事务 |
| `toUpdate(em)` | 构建 CriteriaUpdate 不执行 |

所有条件方法可用：`eq`, `ne`, `gt`, `ge`, `lt`, `le`, `like`, `notLike`, `startsWith`, `endsWith`, `contains`, `eqIgnoreCase`, `likeIgnoreCase`, `in`, `notIn`, `between`, `notBetween`, `isNull`, `isNotNull`, `where`, `or`, `not`。

## DeleteSpec\<T\>

批量 DELETE 操作构建器。继承 `AbstractBulkOperationSpec`。

| 方法 | 说明 |
|------|------|
| `execute(em)` | 在现有事务中执行（需要 WHERE） |
| `executeInTransaction(em)` | 带事务管理执行 |
| `executeLimited(em, limit)` | 限量执行（通过 ID 子查询批处理） |
| `deleteAll(em)` | 无条件删除 |
| `deleteAllInTransaction(em)` | 无条件删除带事务 |
| `toDelete(em)` | 构建 CriteriaDelete 不执行 |

所有条件方法可用（与 UpdateSpec 相同）。

## ProjectionSpec\<T\>

DTO 投影查询构建器，支持 Tuple 和构造函数 DTO 投影。

| 方法 | 说明 |
|------|------|
| `select(field)` | 添加字段到 SELECT |
| `asDto(class)` | 指定 DTO 类用于构造函数投影 |
| `join(field, config)` | INNER JOIN 带条件 |
| `leftJoin(field, config)` | LEFT JOIN 带条件 |
| `orderByAsc(field)` | 升序排列 |
| `orderByDesc(field)` | 降序排列 |
| `where(config)` | 通过 `Consumer<QuerySpec<T>>` 添加 WHERE 条件 |
| `conditions()` | 直接访问底层 QuerySpec |
| `toTupleQuery(em)` | 构建 Tuple 查询 |
| `toDtoQuery(em)` | 构建 DTO 构造函数查询（需要先调用 `asDto()`） |
| `findPage(em, pageable)` | 分页 Tuple 查询 |

### ProjectionSpec.JoinGroup\<E\>

投影查询中的 JOIN 条件构建器。支持：`eq`, `ne`, `like`, `gt`, `lt`, `isNull`, `isNotNull`。

## MyJpaTemplate

常见操作的便利模板。自动配置的 Spring Bean。

### 查询方法

| 方法 | 说明 |
|------|------|
| `findById(class, id)` | 根据 ID 查找实体 |
| `findOne(class, QuerySpec)` | 查找单个实体 |
| `findAll(class, spec)` | 查找所有（受 `maxResults` 限制） |
| `findAll(class, spec, maxResults)` | 自定义限制查找 |
| `findAll(class, spec, entityGraph)` | 带 EntityGraph 查找 |
| `findAll(class, spec, entityGraph, maxResults)` | 带 EntityGraph 和限制查找 |
| `findAll(class, spec, pageable)` | 分页查询 |
| `findAllStream(class, spec)` | 流式结果（无内存限制） |
| `findAllStream(class, spec, entityGraph)` | 带 EntityGraph 的流式 |
| `find(class, Specification)` | 使用原始 Specification 查找 |
| `find(class, Specification, maxResults)` | 使用原始 Specification 和限制查找 |
| `findPage(class, Specification, pageable)` | 使用原始 Specification 分页 |

### 变更方法

| 方法 | 说明 |
|------|------|
| `update(class)` | 创建 UpdateSpec |
| `delete(class)` | 创建 DeleteSpec |
| `execute(UpdateSpec)` | 在事务中执行更新 |
| `execute(DeleteSpec)` | 在事务中执行删除 |
| `executeBatch(UpdateSpec, batchSize)` | 批量更新（flush/clear） |
| `executeBatch(DeleteSpec, batchSize)` | 批量删除（flush/clear） |

### 常量

| 常量 | 默认值 | 说明 |
|------|--------|------|
| `DEFAULT_MAX_RESULTS` | `10000` | findAll/find 的默认最大结果数 |
| `DEFAULT_DEEP_PAGINATION_OFFSET_THRESHOLD` | `100000` | 深度分页警告的 offset 阈值 |

## MyJpaRepository\<T, ID\>

基础仓库接口。继承 `JpaRepository<T, ID>` 和 `JpaSpecificationExecutor<T>`。

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

## @SoftDelete

注解，用于标记字段为软删除标志。支持 `boolean`、`Boolean` 和 `Enum` 类型。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `deletedValue` | `String` | `""` | Enum 类型的"已删除"状态常量名 |

- **boolean/Boolean**: `true` = 已删除，`false`/`null` = 未删除
- **Enum**: 匹配 `deletedValue` 的值 = 已删除，其他 = 未删除

## @IgnoreSoftDelete

注解，用于跳过方法或类型的自动软删除过滤。

- **目标**: `METHOD`, `TYPE`
- **保留**: `RUNTIME`

## PageableHelper

分页工具类。

| 方法 | 说明 |
|------|------|
| `unsorted(page, size)` | 无排序的 PageRequest（保留 QuerySpec 排序） |
| `merge(pageable, spec)` | 合并 Pageable 排序和 QuerySpec 排序（QuerySpec 优先） |
| `sorted(page, size, sort)` | 带显式排序的 PageRequest |

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

## MyJpaPlusException

MyJpa-Plus 的基础运行时异常。构造函数：`(String message)`, `(String message, Throwable cause)`。
