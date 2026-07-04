---
layout: home

hero:
  name: MyJpa-Plus
  text: 类型安全的 JPA 查询构建器
  tagline: 使用 Lambda 表达式构建动态查询，告别魔法字符串
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/zsubera/myjpa-plus

features:
  - icon: 🔍
    title: 类型安全查询
    details: 基于 Lambda 的 QuerySpec，支持 eq/ne/gt/lt/like/in/between。编译期捕获字段名错误。
  - icon: ⚡
    title: 批量操作
    details: 类型安全的 UPDATE/DELETE，支持行数限制、批量执行和条件 SET 子句。
  - icon: 🔀
    title: UPSERT / MERGE
    details: PostgreSQL、MySQL、Oracle、SQL Server 的 INSERT ... ON CONFLICT。多行批量优化。
  - icon: 📊
    title: 投影与聚合
    details: DTO 构造函数投影、Tuple 查询、GROUP BY/HAVING 和独立聚合函数。
  - icon: 🌳
    title: CTE 支持
    details: 非递归和递归公共表表达式，支持参数化查询。
  - icon: 🔐
    title: 加密与脱敏
    details: 通过 @Encrypt 实现 AES-GCM 字段加密。通过 @Mask 实现手机号/邮箱/身份证脱敏。
  - icon: 🗑️
    title: 软删除
    details: Boolean、Enum、Integer、String 软删除类型。自动过滤、批量执行器、虚拟线程支持。
  - icon: 🔄
    title: 乐观锁重试
    details: "@RetryOnOptimisticLock 指数退避。OptimisticLockException 自动重试。"
  - icon: 📈
    title: 慢查询监控
    details: DataSource 代理自动检测慢 SQL。可配置阈值。
  - icon: 🔌
    title: 可插拔缓存
    details: CacheAdapter SPI 支持 Redis/Caffeine/Hazelcast。带 TTL 和前驱逐的查询结果缓存。
---

## 快速示例

```java
// 简单查询，null 安全（toSpecification() 是可选的）
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .eq(User::getStatus, "ACTIVE")
        .eq(User::getDeletedAt, null)  // → IS NULL
);

// OR 条件组合（Consumer 模式）
List<User> users = userRepository.findAll(
    new QuerySpec<User>()
        .like(User::getName, "%John%")
        .or(g -> g.eq(User::getRole, "ADMIN").eq(User::getRole, "MODERATOR"))
        .toSpecification()
);

// JOIN 嵌套条件
List<Order> orders = orderRepository.findAll(
    new QuerySpec<Order>()
        .join(Order::getCustomer, j -> j
            .eq(Customer::getCountry, "CN")
            .gt(Customer::getLevel, 3))
        .contains(Order::getRemark, "紧急")
        .toSpecification()
);
```

## 安装

```xml
<dependency>
    <groupId>io.github.zsubera</groupId>
    <artifactId>myjpa-plus</artifactId>
    <version>1.3.0</version>
</dependency>
```

<div class="tip custom-block" style="padding-top: 8px">
  <p class="custom-block-title">环境要求</p>
  <p>Java 17+ · Spring Boot 3.x · Spring Data JPA</p>
</div>
