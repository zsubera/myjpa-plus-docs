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
    <version>1.0.0</version>
</dependency>
```

Gradle 用户：

```groovy
implementation 'io.github.zsubera:myjpa-plus:1.0.0'
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

## 下一步

- [QuerySpec 指南](./query-spec) - 了解所有查询操作
- [关联查询](./joins) - 使用关联关系查询
- [批量操作](./bulk-operations) - 更新和删除操作
