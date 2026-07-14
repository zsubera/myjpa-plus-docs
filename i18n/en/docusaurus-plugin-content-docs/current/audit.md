---
sidebar_position: 1
title: Audit
---

# Audit

MyJpa-Plus auto-configures Spring Data JPA auditing and provides the `AuditUtils` utility class for operational audit logging.

## Spring Data JPA Auditing

MyJpa-Plus automatically registers an `AuditorAware<String>` bean that retrieves the current user from Spring Security's `SecurityContextHolder`. You can use Spring Data JPA's standard auditing annotations directly.

### 1. Enable Auditing

Add `@EntityListeners(AuditingEntityListener.class)` to your entity class:

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

### 2. Supported Annotations

| Annotation | Type | Description |
|------------|------|-------------|
| `@CreatedDate` | `Instant`, `LocalDateTime`, `Date`, `Long` | Creation timestamp |
| `@LastModifiedDate` | `Instant`, `LocalDateTime`, `Date`, `Long` | Last modification timestamp |
| `@CreatedBy` | `String` | Creator |
| `@LastModifiedBy` | `String` | Last modifier |

### 3. Custom AuditorAware

MyJpa-Plus uses `SecurityContextAuditorAware` by default (retrieves the current user from Spring Security). You can override it by providing your own `AuditorAware<String>` bean:

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

`AuditUtils` is an operational audit logging utility for recording stack traces of dangerous operations (such as unconditional UPDATE/DELETE) for production troubleshooting.

### Methods

| Method | Description |
|--------|-------------|
| `getCallStack()` | Get formatted call stack string (default depth: 5) |
| `setMaxStackDepth(int)` | Set maximum call stack depth (1-20) |
| `getMaxStackDepth()` | Get current maximum call stack depth |

### Configuration

```yaml
myjpa-plus:
  audit:
    stack-trace-depth: 5  # Call stack depth, range 1-20, default 5
```

### Example

```java
// Record operation call stack
String callStack = AuditUtils.getCallStack();
log.warn("Unconditional update executed from: {}", callStack);
// Output: UserService <- AdminController <- SecurityFilter
```
