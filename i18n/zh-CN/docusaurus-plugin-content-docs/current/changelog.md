---
sidebar_position: 1
title: 更新日志
---

# 更新日志

所有显著变更均记录在本文件中。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.3.1] - 2026-07-14

### 新增
- **持久化上下文策略** — `AbstractBulkOperationSpec.persistenceStrategy()` 和 `MergeSpec.persistenceStrategy()` 支持 `PersistenceContextStrategy.DEFER_TO_CALLER`，允许调用者管理批量操作后的 flush/clear；默认保持 `AUTO_CLEAR` 以向后兼容
- **线程安全的批量更新/删除限制** — 增强了行限制检查的线程安全性，修复了并发下限制绕过的缺陷

### 变更
- **Caffeine 缓存统一** — 所有手写缓存实现替换为 Caffeine，消除了约 1000 行手动缓存代码
  - `SampledEvictionCache`：内部实现从 ConcurrentHashMap + 采样淘汰变更为 Caffeine（13 个以上引用）
  - `QueryCacheManager`：从 847 行手写代码降至约 300 行 Caffeine 实现
  - `EncryptionKeyManager`：密钥缓存从 ConcurrentHashMap + RWLock + 手动 LRU 变更为 Caffeine
  - `DialectDetector`：方言缓存从 ConcurrentHashMap + 手动淘汰变更为 Caffeine
  - `QueryMetricsCollector`：指标存储从 ConcurrentHashMap + 手动淘汰变更为 Caffeine
  - 13 个 `ConcurrentReferenceHashMap` 弱引用缓存替换为 `Caffeine.newBuilder().weakKeys()`
  - 移除了 `EncryptionKeyManager` 中的 `ReentrantReadWriteLock` 和手动 LRU 淘汰
- **CteSpec UNION SELECT 检测移除** — 移除了 UNION SELECT / UNION ALL SELECT 注入检测模式；它们在非递归和递归 CTE 中是合法语法（如 `WITH cte AS (SELECT 1 UNION ALL SELECT 2)`），导致误报
- **BulkTransactionHelper 清理时机** — `em.clear()` 移至 `tx.commit()` 之后，修复了新事务中提交后 L1 缓存丢失的问题
- **CacheEvictionHelper Hibernate 检测** — 添加了 `hibernateSessionClass.isInstance()` 空安全检查，防止非 Hibernate 环境中的 `ClassCastException`

### 修复
- **EncryptConverter Cipher 池 RuntimeException 泄漏** — `cipher.init()` 抛出 RuntimeException 时 Cipher 未归还池中；添加了 `cipherReturned` 标志确保所有异常路径都能归还
- **DefaultMyJpaRepository 批量操作忽略 AUTO_FILTER_OVERRIDE** — `update()` 和 `delete()` 默认方法现在委托给 `shouldApplySoftDeleteFilter()`
- **SoftDeleteHelper.isSoftDeleted NPE** — 在弱引用缓存重建时添加了防御性空检查
- **SoftDeleteBulkExecutor 计数查询** — 修复了布尔类型软删除实体的有效行计数
- **SoftDeleteHelper.clearCaches 方言缓存** — 添加了 `cachedDialect = null` 清理以支持上下文切换
- **DeleteSpec.executeAsSoftDelete 行限制** — COUNT 查询现在包含软删除过滤以准确匹配
- **DeleteSpec JTA 回滚** — 在 JTA 环境的 `rollback()` 前添加了 `IllegalStateException` 捕获
- **executeCountQuery 缺少 AUTO_FILTER_OVERRIDE** — 修复了分页计数查询未检查 ThreadLocal 的问题
- **批量保存异常处理和缓存清理** — 修复了批量保存失败时缓存未清理的问题
- **Condition 节点空值处理** — 修复了不一致的空值处理，增加了 71 个测试覆盖
- **批量操作安全漏洞** — 修复了 SQL 注入和行限制绕过问题
- **批量操作重复行处理** — 修复了基于游标的批处理中由于不稳定排序导致的重复处理问题
- **17 项正确性修复** — 涵盖数据完整性、并发安全、安全漏洞和崩溃风险
- **EntityManagerHelper 多数据源竞态条件** — 修复了并发注册竞态
- **SQL 标识符引用** — 修复了标识符引用和多数据源支持

### 优化
- **查询性能和加密转换器** — 优化了多个组件的性能和线程安全性
- **批量保存模板版本处理** — 修复了版本方法处理和安全警告日志

## [1.3.0] - 2026-07-04

### 新增
- **executeWithCallbacks** — `MergeSpec.executeWithCallbacks(em)` 先 flush 持久化上下文触发 JPA 生命周期回调后再执行原生 UPSERT
- **多行 UPSERT 批处理** — `MergeSpec.executeBatch()` 自动使用 `INSERT INTO ... VALUES (...), (...) ON CONFLICT ...` 多行语法（MySQL/PostgreSQL），方言不支持时回退逐行
- **supportsBatchUpsert()** — `DialectStrategy` 新增能力检测方法，`MergeSpec` 改用能力检查而非 try-catch
- **SoftDeleteBulkExecutor** — 从 `SoftDeleteHelper` 提取批量软删除操作（~450 行），Helper 降至 ~740 行，保留所有公共 API 委托保持向后兼容
- **查询 Lambda 便捷重载** — `MyJpaRepository` 和 `MyJpaTemplate` 新增 `Consumer<QuerySpec<T>>` Lambda 重载，无需 `new QuerySpec<>()`
  - `findAll(consumer)`, `findOne(consumer)`, `count(consumer)`, `exists(consumer)`
  - `MyJpaTemplate` 同步新增对应 Lambda 重载
- **QuerySpec.of() 工厂方法** — 新增 `QuerySpec.of(consumer)` 静态工厂方法，将 3 行创建代码简化为 1 行
- **虚拟线程兼容性** — `SoftDeleteContext` 和 `DefaultMyJpaRepository` 完全兼容 Java 21+ 虚拟线程
  - 新增 `withIgnore(Runnable)` 和 `withIgnore(Supplier)` 便捷方法，自动管理生命周期
  - 虚拟线程隔离性验证测试
- **UPSERT 方言扩展** — `MergeSpec` 支持 4 种数据库方言
  - 新增 `OracleDialect`（`MERGE INTO ... USING ... ON ... WHEN MATCHED/NOT MATCHED`）
  - 新增 `SqlServerDialect`（`[方括号]` 转义 + `MERGE INTO`）
  - `DialectDetector` 默认注册 postgresql、mysql、oracle、sqlserver 四种方言
  - 新增 `removeDialect()` 运行时移除方言方法
- **聚合查询工具类** — 新增 `QueryAggregates` 提供独立的 `count`/`sum`/`avg`/`max`/`min` 聚合表达式工厂方法
- **softDeleteAll 行数保护** — `SoftDeleteHelper.softDeleteAll()` 新增 `maxRows` 参数，默认最多更新 10000 行
- **multiLike 嵌套字段校验** — `multiLike(keyword, "address.city")` 现在对每段调用 `IdentifierValidator.validateColumnName()` 进行安全校验
- **EncryptConverter 事务清理** — 新增 `registerTransactionCleanupIfNeeded()`，在事务中自动注册 `afterCompletion` 回调清理 Cipher ThreadLocal
- **CacheAdapter SPI** — 新增可插拔缓存适配器接口，支持注入 Redis/Caffeine 等分布式缓存
  - 新增 `CacheAdapter` 接口、`DisabledCacheAdapter` 无操作实现
  - `QueryCacheManager` 实现 `CacheAdapter`（向后兼容）
  - `MyJpaTemplate` 内部使用 `CacheAdapter`，新增 `setCacheAdapter()`/`getCacheAdapter()`
- **Java 模块系统兼容性** — 完整的 `--add-opens` 修复指引
- **Op.resolve() 策略模式** — `Op` 枚举作为谓词构建的唯一真实来源

### 优化
- **EncryptionKeyManager LRU 缓存淘汰** — 密钥缓存从 FIFO 改为 LRU 策略
- **SlowQueryDataSourceProxy 移除冗余锁** — 直接使用 `SampledEvictionCache.computeIfAbsent()` 的原子性保证线程安全
- **QuerySpec 拆分** — 从 1265 行拆分为 887 行 + 7 个辅助类
- **Deprecated API 清理** — 移除 11 个废弃方法
- **QuerySpec.copy() 性能优化** — 空条件树使用快速路径，跳过深拷贝

### 修复
- **EncryptConverter Cipher 对象池泄漏** — 修复加密/解密失败路径中 Cipher 对象未归还到对象池的问题
- **BulkOperationTemplate 迭代计数** — 修复失败批次 iteration 双重递增问题
- **MergeSpec 事务管理** — 提取 `safeRollback()` 方法消除重复的 rollback 逻辑
- **QuerySpec.copy() 深拷贝** — 修复浅拷贝导致嵌套条件共享可变状态的问题
- **NodeResolver LEFT JOIN 软删除过滤位置** — 软删除条件从 WHERE 子句移至 ON 子句
- **EncryptConverter GCM Cipher 生命周期** — 移除 ThreadLocal Cipher 缓存，每次操作新建实例（JDK-8201324）
- **CacheKeyBuilder 递归深度保护** — 添加 128 层递归深度限制
- 另有 20+ 项缺陷修复（详见源码 CHANGELOG.md）

## [1.2.0] - 2026-06-12

### 新增
- **UPSERT/MERGE 支持** — `MergeSpec` 构建器，支持 PostgreSQL `ON CONFLICT`、MySQL `ON DUPLICATE KEY`、H2 `MERGE`
- **CTE 支持** — `CteSpec` 支持普通和递归 Common Table Expression
- **SQL 慢查询监控** — `SqlSlowQueryInterceptor` + `myjpa-plus.monitoring` 配置
- **字段加密** — `@Encrypt` 注解 + `EncryptConverter`（AES/GCM，随机 IV）
- **字段脱敏** — `@Mask` 注解 + `MaskSerializer`（Jackson，支持 PHONE/EMAIL/ID_CARD/NAME）
- **乐观锁自动重试** — `@RetryOnOptimisticLock` 注解，指数退避
- **查询结果缓存** — `QueryCacheManager`，TTL 过期策略
- **数据库函数调用** — `func(field, functionName, comparisonOp, value)` 条件方法
- **Case-insensitive 字符串查询** — `eqIgnoreCase`、`neIgnoreCase`、`likeIgnoreCase`
- **多字段 LIKE 搜索** — `multiLike(keyword, "field1", "field2")` 支持字符串字段名
- **String 类型软删除** — 支持 `@SoftDelete` 注解的 String 类型 deletedValue

### 变更
- **移除 H2 数据库支持** — 测试统一使用 MySQL
- **移除 BaseEntity 类** — 审计字段通过 `AuditEntityListener` 自动填充
- **重构实体字段提取和方言检测**
- **重构批量操作模板** — 优化事务管理和内存控制
- **重构条件构建器接口** — 拆分为 8 个子接口

### 修复
- **not() 语义一致性** — 修复否定条件组的语义问题
- **缓存驱逐** — 修复批量操作中的缓存驱逐问题
- **LIKE 通配符转义** — 修复 `likeSafe()` 的通配符转义问题
- **null 校验统一** — 统一条件方法的 null 校验逻辑

## [1.1.0] - 2026-05-31

### 新增
- **枚举转换支持** — `@CodeEnum` + `@CodeEnumValue` 注解解决 Hibernate 6 枚举映射问题
  - 支持 CHAR(1) 存储枚举编码（如 '0'、'1'、'M'、'F'）
  - 支持 int、long、String 类型的 code 字段
  - 无需创建转换器类，只需在枚举和实体字段上添加注解
- **multiLike 支持字符串字段名** — `multiLike(keyword, "field1", "field2")` 适用于动态字段名场景
- **软删除 Integer 类型支持** — `@SoftDelete(deletedIntValue = 1)` 支持用整数值标记删除状态
- **MyJpaTemplate.count() 方法** — 新增便捷的计数方法
- **聚合函数 API** — 新增聚合查询功能

### 变更
- `ConditionBuilder` 添加 `notBetween` 和 `likeIgnoreCase` 的条件变体
- `SubQuerySpec` 和 `AbstractBulkOperationSpec` 添加更多条件便捷方法
- 优化 `LambdaUtils` 缓存驱逐策略，使用 CAS 操作避免竞态条件
- 优化 `InClauseBuilder` 批次处理，避免内存泄漏

### 修复
- 修复 EXISTS 子查询关联限制，支持从 Join 路径关联
- 修复 `MyJpaTemplate.findAllStream` 废弃策略
- 修复 `DefaultMyJpaRepository.deleteById` 方法，正确处理软删除实体

## [1.0.0] - 2026-05-28

### 破坏性变更
- `DeleteSpec` 现在要求显式 WHERE 条件
- 修复 `resolveOr()` 空分组语义

### 新增
- `eqIgnoreCase` / `likeIgnoreCase` — 不区分大小写的字符串条件
- `groupBy(SFunction...)` — GROUP BY 子句支持
- `having(BiFunction)` — HAVING 子句
- `not(Consumer)` — 否定条件组
- `startsWith` / `endsWith` / `contains` — 便捷 LIKE 方法
- Consumer 模式：`or(Consumer)` / `join(field, Consumer)` / `leftJoin(field, Consumer)`
- Spring Boot 自动配置
- `ProjectionSpec` — DTO 投影查询
- `MyJpaTemplate` 流式 API 和批量操作
- `EntityGraphHelper` — 动态 JPA EntityGraph 构建器
- `PageableHelper` — QuerySpec/Pageable 排序集成

### 修复
- `SubQuerySpec` 条件不再互相覆盖
- `SoftDeleteHelper.findSoftDeleteField()` 竞态条件修复

## [0.0.2] - 2026-05-28

### 新增
- **批量操作 LIMIT 支持** — `executeWithMaxRows()` 方法
- **大型 IN 子句处理** — 自动拆分超过数据库参数限制的 IN 子句
- **GroupBy + Having 支持** — `groupBy(SFunction...)` 和 `having(BiFunction)`
- **SubQuerySpec 关联** — `correlate(root)` 支持子查询关联
- **Spring Boot 自动配置** — 自动注册 `MyJpaTemplate` 和相关组件

## [0.0.1] - 2026-05-26

### 初始发布
- 基于 Lambda API 的类型安全 JPA `Specification` 构建器
- `QuerySpec<T>`：eq, ne, gt, ge, lt, le, like, notLike, in, notIn, between, isNull, isNotNull
- JOIN 支持：`join()`、`leftJoin()` 配合 `JoinGroup`
- OR 分组：`or()` 配合 `OrGroup`
- EXISTS 子查询配合 `SubQuerySpec`
- 通过 `multiLike` 实现多字段 LIKE 搜索
- 针对 Hibernate 延迟代理的 Jackson 序列化器

