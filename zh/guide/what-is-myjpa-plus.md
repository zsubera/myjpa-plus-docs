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
    .like(User::getName, "%John%")      // 无魔法字符串!
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
- 多数据库方言支持 (PostgreSQL, MySQL)

### CTE 公共表表达式
- 非递归和递归 CTE
- 参数绑定
- SQL 预览用于调试

### 投影查询 (ProjectionSpec)
- 类型安全的字段选择
- 聚合函数
- DTO 构造函数投影
- JOIN 和分页支持

### 软删除
- @SoftDelete 支持 Boolean、Integer、Enum 类型
- @IgnoreSoftDelete 临时覆盖
- 仓库方法查询软删除实体

### 字段加密 (@Encrypt)
- AES-GCM 加密
- 透明的 JPA AttributeConverter
- 多版本密钥轮换

### 审计注解
- @CreatedAt、@UpdatedAt、@CreatedBy、@UpdatedBy
- 自动填充字段

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
