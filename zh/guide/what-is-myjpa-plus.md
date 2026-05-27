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
QuerySpec<User> spec = new QuerySpec<User>()
    .eq(User::getStatus, "ACTIVE")      // 编译期检查!
    .like(User::getName, "%John%")      // 无魔法字符串!
    .gt(User::getAge, 18);
```

## 核心优势

| 特性 | 传统 JPA | MyJpa-Plus |
|------|---------|------------|
| 字段引用 | 字符串 (`"name"`) | 方法引用 (`User::getName`) |
| 类型安全 | 运行时错误 | 编译期错误 |
| Null 处理 | 手动检查 | 自动 IS NULL |
| OR/NOT 分组 | 复杂嵌套 | 简洁的 Consumer API |
| JOIN 条件 | 冗长代码 | 流式构建器 |

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
