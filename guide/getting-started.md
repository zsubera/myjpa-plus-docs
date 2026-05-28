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
    <version>0.0.3</version>
</dependency>
```

Or for Gradle:

```groovy
implementation 'io.github.zsubera:myjpa-plus:0.0.3'
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
- [Bulk Operations](./bulk-operations) - Update and delete operations
