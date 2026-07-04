---
sidebar_position: 1
title: 快速开始
---

# 快速开始

## 环境要求

- Java 17 或更高版本
- Spring Boot 3.x
- Spring Data JPA

## 安装

在 `pom.xml` 中添加依赖：

```xml
<dependency>
    <groupId>io.github.zsubera</groupId>
    <artifactId>myjpa-plus</artifactId>
    <version>1.3.1</version>
</dependency>
```

Gradle 用户：

```groovy
implementation 'io.github.zsubera:myjpa-plus:1.3.1'
```

## 快速上手

### 1. 定义实体

```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String email;
    private String status;
    private Integer age;
    
    @ManyToOne
    private Department department;
    
    // getter 和 setter...
}
```

### 2. 创建仓库

```java
public interface UserRepository extends MyJpaRepository<User, Long> {
}
```

### 3. 使用 QuerySpec 查询

```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> findActiveUsers() {
        // toSpecification() 是可选的 - QuerySpec 直接实现了 Specification 接口
        return userRepository.findAll(
            new QuerySpec<User>()
                .eq(User::getStatus, "ACTIVE")
                .toSpecification()
        );
    }
    
    public List<User> searchUsers(String keyword) {
        return userRepository.findAll(
            new QuerySpec<User>()
                .multiLike(keyword, User::getName, User::getEmail)
                .toSpecification()
        );
    }
}
```

### 4. Lambda 便捷方法（v1.3.0+）

使用 `MyJpaRepository` 时，可以使用 Consumer 风格的 Lambda 重载，无需手动创建 `QuerySpec`：

```java
// 直接使用 Consumer<QuerySpec> — 内部自动创建 QuerySpec
List<User> users = userRepository.findAll(s -> s.eq(User::getStatus, "ACTIVE"));

// 带分页
Page<User> page = userRepository.findAll(
    s -> s.eq(User::getStatus, "ACTIVE"),
    PageRequest.of(0, 20)
);

// 计数、存在性检查、查询单个
long count = userRepository.count(s -> s.eq(User::getStatus, "ACTIVE"));
boolean exists = userRepository.exists(s -> s.eq(User::getEmail, "john@example.com"));
Optional<User> user = userRepository.findOne(s -> s.eq(User::getId, 1L));
```

### 5. QuerySpec.of() 工厂方法（v1.3.0+）

使用 `QuerySpec.of()` 一行代码替代 `new QuerySpec<>()`：

```java
// 之前（2 行）
QuerySpec<User> spec = new QuerySpec<>();
spec.eq(User::getStatus, "ACTIVE");

// 之后（1 行）
QuerySpec<User> spec = QuerySpec.of(s -> s.eq(User::getStatus, "ACTIVE"));

// 跨多个查询复用
QuerySpec<User> activeFilter = QuerySpec.of(s -> s.eq(User::getStatus, "ACTIVE"));
repository.findAll(activeFilter);
repository.count(activeFilter);
```

## 下一步

- [QuerySpec 指南](./query-spec) - 了解所有查询操作
- [关联查询](./joins) - 使用关联关系查询
- [子查询](./sub-queries) - EXISTS 和 NOT EXISTS 查询
- [批量更新与删除](./bulk-operations) - 批量更新和删除操作
- [UPSERT / MergeSpec](./upsert) - INSERT ... ON CONFLICT UPDATE
- [CTE](./cte) - 公共表表达式
- [软删除](./soft-delete) - 使用 @SoftDelete 软删除
- [字段加密](./encryption) - 使用 @Encrypt 字段级加密
- [审计注解](./audit) - 审计创建/更新时间字段
- [MyJpaTemplate](./myjpa-template) - 带缓存的查询模板
- [投影查询](./projection) - 投影查询
- [代码生成](./code-generation) - 生成实体和仓库代码

