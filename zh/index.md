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
  - icon: 🔒
    title: Lambda 类型安全
    details: 使用方法引用（Entity::getField）替代硬编码字段名字符串，编译期捕获错误，而非运行时。
  - icon: ⛓️
    title: 流式 API
    details: 可链式调用的 AND/OR 条件组合，语法清晰易读，告别 begin/end 样板代码。
  - icon: 🔗
    title: JOIN 支持
    details: 内连接/左连接，支持嵌套条件、子连接和连接缓存。Consumer 模式自动关闭分组。
  - icon: 🔍
    title: EXISTS 子查询
    details: 关联子查询，支持类型安全条件。完整支持 EXISTS 和 NOT EXISTS。
  - icon: 🧩
    title: OR/NOT 分组
    details: 可在 AND 分组内任意嵌套 OR 分组，反之亦然。NOT 条件组用于取反。
  - icon: 🛡️
    title: Null 安全
    details: eq(field, null) 自动转为 IS NULL。所有 Lambda 参数均进行 null 检查，错误信息清晰。
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
    <version>1.2.0</version>
</dependency>
```

<div class="tip custom-block" style="padding-top: 8px">
  <p class="custom-block-title">环境要求</p>
  <p>Java 17+ · Spring Boot 3.x · Spring Data JPA</p>
</div>
