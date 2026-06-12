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
    <version>1.2.0</version>
</dependency>
```

Or for Gradle:

```groovy
implementation 'io.github.zsubera:myjpa-plus:1.2.0'
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
