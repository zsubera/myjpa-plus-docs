---
sidebar_position: 1
title: 什么是 MyJpa-Plus?
---

# 什么是 MyJpa-Plus?

MyJpa-Plus 是一个为 Spring Data JPA 设计的类型安全 JPA Specification 构建器。它使用 Lambda 表达式和方法引用提供流式 API 来构建动态查询，消除硬编码的字段名字符串。

## 问题

传统 JPA Criteria API 代码冗长且容易出错：

```java
// 传统方式 - 容易出错
Root<User> root = query.from(User.class);
Predicate predicate = cb.and(
    cb.equal(root.get("status"), "ACTIVE"),      // 魔法字符串!
    cb.like(root.get("name"), "%John%"),          // 拼写错误风险!
    cb.greaterThan(root.get("age"), 18)
);
```

## 解决方案

MyJpa-Plus 提供了简洁、类型安全的替代方案：

```java
// MyJpa-Plus - 类型安全
// toSpecification() 是可选的 - QuerySpec 直接实现了 Specification 接口
QuerySpec<User> spec = new QuerySpec<User>()
    .eq(User::getStatus, "ACTIVE")      // 编译期检查!
    .like(User::getName, "John")           // 无魔法字符串! 自动添加 % 前后缀
    .gt(User::getAge, 18);

// 直接传递给 findAll()
userRepository.findAll(spec);

// 或者使用 toSpecification() 明确表达意图
userRepository.findAll(spec.toSpecification());
```

## 核心优势

| 特性 | 传统 JPA | MyJpa-Plus |
|------|---------|------------|
| 字段引用 | 字符串 (`"name"`) | 方法引用 (`User::getName`) |
| 类型安全 | 运行时错误 | 编译期错误 |
| Null 处理 | 手动检查 | 自动 IS NULL |
| OR/NOT 分组 | 复杂嵌套 | 简洁的 Consumer API |
| JOIN 条件 | 冗长代码 | 流式构建器 |

## 核心 API 入口

### MyJpaRepository\<T, ID\>

继承 `JpaRepository` 和 `JpaSpecificationExecutor` 的基础仓库接口：

- 所有标准 Spring Data JPA 方法
- 查询自动软删除过滤
- Lambda 便捷方法：`findAll(Consumer)`、`findOne(Consumer)`、`count(Consumer)`、`exists(Consumer)`
- 批量操作：`update(Consumer)`、`delete(Consumer)`、`merge(Consumer)`
- `deleteByIdIfExists(ID)` 安全按 ID 软删除

```java
public interface UserRepository extends MyJpaRepository<User, Long> {
    // 你的自定义查询方法...
}

// Lambda 风格（v1.3.0+）
List<User> users = repository.findAll(s -> s.eq(User::getStatus, "ACTIVE"));
```

### MyJpaTemplate

仓库上下文外的便利操作模板：

- 查询方法：支持最大结果数、EntityGraph、流式、分页
- 批量保存：`saveAllBatched()`、`saveAllBatchedPure()`、`saveAllBatchedInSeparateTransactions()`
- 游标分页：`findKeysetPage()` 游标分页
- UPSERT 执行：`execute(MergeSpec)`
- 可配置缓存、深度分页保护、最大结果数限制

```java
@Autowired
private MyJpaTemplate template;

List<User> users = template.findAll(User.class, s -> s.eq(User::getStatus, "ACTIVE"));
template.saveAllBatched(users, 100);
```

### QuerySpec\<T\>

实现 `Specification<T>` 的核心查询构建器：

- 30+ 条件方法：eq、ne、gt、lt、like、in、between 等
- JOIN、LEFT JOIN、FETCH JOIN 支持
- OR/NOT 分组，支持嵌套条件
- EXISTS/NOT EXISTS 子查询
- GROUP BY、HAVING、ORDER BY、DISTINCT
- `QuerySpec.of(consumer)` 一行代码工厂方法

```java
QuerySpec<User> spec = QuerySpec.of(s -> s
    .eq(User::getStatus, "ACTIVE")
    .join(User::getDepartment, j -> j.eq(Department::getName, "Engineering"))
    .orderByDesc(User::getCreatedAt)
);
```

## 功能特性

### 查询构建 (QuerySpec)
- Lambda 类型安全，使用方法引用
- 流式 API，支持 AND/OR 条件组合
- JOIN 支持，带嵌套条件
- EXISTS 和 NOT EXISTS 子查询
- OR/NOT 分组，使用 Consumer 模式
- 多字段搜索 (multiLike)
- 不区分大小写查询
- 集合操作 (isEmpty, isNotEmpty)
- GROUP BY 和 HAVING 支持
- 数据库函数调用

### 批量操作 (UpdateSpec / DeleteSpec)
- 类型安全的批量更新和删除
- 表达式 SET，支持原子操作
- 安全限制，防止无条件操作
- 行数限制

### UPSERT / MergeSpec
- 类型安全的 UPSERT 操作
- 冲突列指定
- 选择性列更新
- 多数据库方言支持 (PostgreSQL, MySQL, Oracle, SQL Server)
- 多行批量 UPSERT 优化
- executeWithCallbacks 触发 JPA 生命周期回调

### CTE 公共表表达式
- 非递归和递归 CTE
- 参数绑定
- SQL 预览用于调试

### 投影查询
- QuerySpec.select() / selectAs() / asDto() 字段选择
- 聚合函数（count/sum/avg/max/min）
- DTO 构造函数投影，按名称匹配
- JOIN 和分页支持

### 软删除
- @SoftDelete 支持 Boolean、Integer、Enum、String 类型
- 删除时间戳自动填充
- @IgnoreSoftDelete 临时覆盖
- SoftDeleteBulkExecutor 批量操作
- 虚拟线程兼容

### 字段加密 (@Encrypt)
- AES-GCM 加密
- 透明的 JPA AttributeConverter
- 多版本密钥轮换
- 生产环境盐值管理

### 字段脱敏 (@Mask)
- PHONE、EMAIL、ID_CARD、NAME、BANK_CARD、ADDRESS、LICENSE_PLATE
- Jackson 序列化器集成
- JSON 输出自动脱敏

### 审计注解
- @CreatedAt、@UpdatedAt、@CreatedBy、@UpdatedBy
- 自动填充字段
- AuditUserProvider SPI 自定义用户解析

### 多数据源支持
- 按实体类型解析不同的 EntityManagerFactory
- 自动 EntityManagerFactory 检测
- EntityClassResolver 多数据源场景支持

### 其他特性
- QuerySpec.of() 工厂方法和 Lambda 便捷重载
- CacheAdapter SPI 可插拔缓存后端（Redis/Caffeine）
- QueryAggregates 独立聚合表达式
- 游标分页（Keyset Pagination）适用于大数据集
- 深度分页保护，可配置阈值
- 批量保存，自动检测 persist/merge
- @RetryOnOptimisticLock 自动重试
- SQL 慢查询监控 via DataSource 代理
- @CodeEnum/@CodeEnumValue Hibernate 6 枚举映射
- 虚拟线程（Java 21+）兼容
- Spring Boot 自动配置，零配置启动
- EntityGraphHelper 动态 EntityGraph 构建
- PageableHelper QuerySpec/Pageable 排序集成
- InClauseBuilder 大型 IN 子句自动批处理（Oracle 兼容）
- FunctionWhitelist 自定义函数注册
- IdentifierValidator SQL 注入防护

### 代码生成
- 实体和仓库代码生成

## 架构

MyJpa-Plus 构建在 Spring Data JPA 的 `Specification<T>` 接口之上。它生成标准的 JPA Criteria 谓词，可与任何 JPA 提供者（Hibernate、EclipseLink 等）配合使用。

```
┌─────────────────────────────────────────────────┐
│                   你的应用                        │
├─────────────────────────────────────────────────┤
│              MyJpa-Plus (QuerySpec)              │
├─────────────────────────────────────────────────┤
│          Spring Data JPA (Specification)         │
├─────────────────────────────────────────────────┤
│              JPA Criteria API                    │
├─────────────────────────────────────────────────┤
│        JPA 提供者 (Hibernate/EclipseLink)         │
└─────────────────────────────────────────────────┘
```

