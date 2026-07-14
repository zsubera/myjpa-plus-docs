---
sidebar_position: 1
title: Getting Started
---

# Getting Started

## Requirements

- Java 17 or later
- Spring Boot 3.x
- Spring Data JPA

## Installation

Add the dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>io.github.zsubera</groupId>
    <artifactId>myjpa-plus</artifactId>
    <version>1.3.0</version>
</dependency>
```

Or for Gradle:

```groovy
implementation 'io.github.zsubera:myjpa-plus:1.3.0'
```

## Quick Start

### 1. Define Your Entity

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
    
    // getters and setters...
}
```

### 2. Create Repository

```java
public interface UserRepository extends MyJpaRepository<User, Long> {
}
```

### 3. Query with QuerySpec

```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> findActiveUsers() {
        // toSpecification() is optional - QuerySpec implements Specification directly
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

### 4. Lambda Convenience Methods (v1.3.0+)

With `MyJpaRepository`, you can use Consumer-based Lambda overloads -- no need to create `QuerySpec` manually:

```java
// Using Consumer<QuerySpec> directly -- QuerySpec created internally
List<User> users = userRepository.findAll(s -> s.eq(User::getStatus, "ACTIVE"));

// With pagination
Page<User> page = userRepository.findAll(
    s -> s.eq(User::getStatus, "ACTIVE"),
    PageRequest.of(0, 20)
);

// Count, exists, find one
long count = userRepository.count(s -> s.eq(User::getStatus, "ACTIVE"));
boolean exists = userRepository.exists(s -> s.eq(User::getEmail, "john@example.com"));
Optional<User> user = userRepository.findOne(s -> s.eq(User::getId, 1L));
```

### 5. QuerySpec.of() Factory (v1.3.0+)

Use `QuerySpec.of()` as a one-liner factory instead of `new QuerySpec<>()`:

```java
// Before (2 lines)
QuerySpec<User> spec = new QuerySpec<>();
spec.eq(User::getStatus, "ACTIVE");

// After (1 line)
QuerySpec<User> spec = QuerySpec.of(s -> s.eq(User::getStatus, "ACTIVE"));

// Reusable across multiple queries
QuerySpec<User> activeFilter = QuerySpec.of(s -> s.eq(User::getStatus, "ACTIVE"));
repository.findAll(activeFilter);
repository.count(activeFilter);
```

## Next Steps

- [QuerySpec Guide](./query-spec) - Learn all query operations
- [Join Queries](./joins) - Query with associations
- [Sub Queries](./sub-queries) - EXISTS and NOT EXISTS queries
- [Update & Delete](./bulk-operations) - Bulk update and delete operations
- [UPSERT / MergeSpec](./upsert) - INSERT ... ON CONFLICT UPDATE
- [CTE](./cte) - Common Table Expressions
- [Soft Delete](./soft-delete) - Soft delete with @SoftDelete
- [Encryption](./encryption) - Field-level encryption with @Encrypt
- [Audit](./audit) - Audit annotations for created/updated fields
- [MyJpaTemplate](./myjpa-template) - Query template with caching
- [Projection](./projection) - Projection queries
- [Code Generation](./code-generation) - Generate entity and repository code

