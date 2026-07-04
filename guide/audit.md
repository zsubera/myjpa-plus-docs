# Audit Annotations

MyJpa-Plus provides audit annotations that automatically populate entity creation/update timestamps and user information.

## Basic Usage

### 1. Define Audit Fields

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

### 2. Implement AuditUserProvider

```java
@Component
public class SecurityAuditUserProvider implements AuditUserProvider {
    @Override
    public String getCurrentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
```

## Supported Annotations

### @CreatedAt

Automatically populates creation timestamp. Supported types:
- `Instant`
- `LocalDateTime`
- `Date`
- `Long` (epoch millis)

```java
@CreatedAt
private Instant createdAt;
```

### @UpdatedAt

Automatically populates update timestamp. Same supported types as above.

```java
@UpdatedAt
private Instant updatedAt;
```

### @CreatedBy

Automatically populates the creating user. Must be `String` type.

```java
@CreatedBy
private String createdBy;
```

### @UpdatedBy

Automatically populates the updating user. Must be `String` type.

```java
@UpdatedBy
private String updatedBy;
```

## Configuration

### Timezone Setting

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

### Auto-Configuration

Spring Boot auto-configuration automatically registers `AuditEntityListener`, no manual configuration needed.

## How It Works

1. `AuditEntityListener` auto-populates fields via `@PrePersist` and `@PreUpdate` callbacks
2. `AuditUserProvider` interface provides current user information
3. Field types and annotations are validated at startup; unsupported types throw exceptions

## Notes

- `@CreatedBy` and `@UpdatedBy` must be `String` type
- `@CreatedAt` and `@UpdatedAt` must be supported time types
- Implementations must be registered as Spring Beans
- Audit fields are automatically populated on every persist/update
