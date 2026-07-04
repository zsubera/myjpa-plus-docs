---
sidebar_position: 1
title: 审计注解
---

# 审计注解

MyJpa-Plus 提供审计注解，自动填充实体的创建/更新时间和用户信息。

## 基本用法

### 1. 定义审计字段

```java
@Entity
@EntityListeners(AuditEntityListener.class)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedAt
    private Instant createdAt;

    @UpdatedAt
    private Instant updatedAt;

    @CreatedBy
    private String createdBy;

    @UpdatedBy
    private String updatedBy;

    private String name;
}
```

### 2. 实现 AuditUserProvider

```java
@Component
public class SecurityAuditUserProvider implements AuditUserProvider {
    @Override
    public String getCurrentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
```

## 支持的注解

### @CreatedAt

自动填充创建时间，支持类型：
- `Instant`
- `LocalDateTime`
- `Date`
- `Long`（epoch millis）

```java
@CreatedAt
private Instant createdAt;
```

### @UpdatedAt

自动填充更新时间，支持类型同上。

```java
@UpdatedAt
private Instant updatedAt;
```

### @CreatedBy

自动填充创建用户，必须为 `String` 类型。

```java
@CreatedBy
private String createdBy;
```

### @UpdatedBy

自动填充更新用户，必须为 `String` 类型。

```java
@UpdatedBy
private String updatedBy;
```

## 配置

### 时区设置

```java
@Configuration
public class AuditConfig {
    @Bean
    public AuditEntityListener auditEntityListener() {
        AuditEntityListener.setAuditZoneId(ZoneId.of("Asia/Shanghai"));
        return new AuditEntityListener();
    }
}
```

### 自动配置

Spring Boot 自动配置会自动注册 `AuditEntityListener`，无需手动配置。

## 工作原理

1. `AuditEntityListener` 通过 `@PrePersist` 和 `@PreUpdate` 回调自动填充字段
2. `AuditUserProvider` 接口提供当前用户信息
3. 字段类型和注解在启动时校验，不支持的类型会抛出异常

## 注意事项

- `@CreatedBy` 和 `@UpdatedBy` 必须是 `String` 类型
- `@CreatedAt` 和 `@UpdatedAt` 必须是支持的时间类型
- 实现类需要注册为 Spring Bean
- 审计字段会在每次持久化/更新时自动填充

