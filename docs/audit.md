---
sidebar_position: 1
title: Audit
---

# Audit

MyJpa-Plus 自动配置 Spring Data JPA 审计功能，并提供 `AuditUtils` 工具类用于操作审计日志。

## Spring Data JPA 审计

MyJpa-Plus 自动注册 `AuditorAware<String>` Bean，从 Spring Security `SecurityContextHolder` 获取当前用户。您可以直接使用 Spring Data JPA 的标准审计注解。

### 1. 启用审计

在实体类上添加 `@EntityListeners(AuditingEntityListener.class)`：

```java
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @CreatedBy
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;

    // getters and setters...
}
```

### 2. 支持的注解

| 注解 | 类型 | 说明 |
|------|------|------|
| `@CreatedDate` | `Instant`, `LocalDateTime`, `Date`, `Long` | 创建时间戳 |
| `@LastModifiedDate` | `Instant`, `LocalDateTime`, `Date`, `Long` | 最后修改时间戳 |
| `@CreatedBy` | `String` | 创建人 |
| `@LastModifiedBy` | `String` | 最后修改人 |

### 3. 自定义 AuditorAware

MyJpa-Plus 默认使用 `SecurityContextAuditorAware`（从 Spring Security 获取当前用户）。您可以通过提供 `AuditorAware<String>` Bean 覆盖：

```java
@Configuration
public class AuditConfig {
    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> Optional.ofNullable(
            SecurityContextHolder.getContext().getAuthentication()?.getName()
        );
    }
}
```

## AuditUtils

`AuditUtils` 是操作审计日志工具类，用于记录危险操作（如无条件 UPDATE/DELETE）的调用栈信息，便于生产环境追踪。

### 方法

| 方法 | 说明 |
|------|------|
| `getCallStack()` | 获取格式化调用栈字符串（默认深度 5 层） |
| `setMaxStackDepth(int)` | 设置最大调用栈深度（1-20） |
| `getMaxStackDepth()` | 获取当前最大调用栈深度 |

### 配置

```yaml
myjpa-plus:
  audit:
    stack-trace-depth: 5  # 调用栈深度，范围 1-20，默认 5
```

### 示例

```java
// 记录操作调用栈
String callStack = AuditUtils.getCallStack();
log.warn("Unconditional update executed from: {}", callStack);
// 输出: UserService <- AdminController <- SecurityFilter
```
