---
sidebar_position: 1
title: 基于编码的枚举映射
---

# 基于编码的枚举映射

`@CodeEnum` 和 `@CodeEnumValue` 注解为 Hibernate 6 提供基于编码的枚举映射，将枚举值存储为紧凑的编码（CHAR、INT 等），而不是序数位置或完整的枚举名称。

## 为什么使用基于编码的枚举？

| 方式 | 存储 | 重构风险 | 可读性 |
|------|------|---------|--------|
| `@Enumerated(ORDINAL)` | `0, 1, 2` | 重新排序破坏数据 | 低 |
| `@Enumerated(STRING)` | `'MALE', 'FEMALE'` | 重命名破坏数据 | 高 |
| `@CodeEnum`（myjpa-plus） | `'M', 'F'` | 重新排序/重命名安全 | 中 |

## 基本用法

### 1. 定义带编码的枚举

```java
public enum Gender {
    @CodeEnumValue
    MALE('M'),
    FEMALE('F');

    private final char code;

    Gender(char code) {
        this.code = code;
    }

    public char getCode() {
        return code;
    }
}
```

### 2. 在实体中使用

```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CodeEnum
    @Column(columnDefinition = "CHAR(1)")
    private Gender gender;
}
```

### 3. 持久化和查询

```java
// 保存
User user = new User();
user.setGender(Gender.MALE);
userRepository.save(user);  // 存储为 'M'

// 查询
QuerySpec<User> spec = new QuerySpec<>();
spec.eq(User::getGender, Gender.MALE);
List<User> users = userRepository.findAll(spec);
```

生成的 SQL：
```sql
INSERT INTO users (gender) VALUES ('M')
-- Gender.MALE → 数据库列中的 'M'
```

## 支持的编码类型

### 字符编码

```java
public enum Status {
    @CodeEnumValue
    ACTIVE('A'),
    INACTIVE('I'),
    DELETED('D');

    private final char code;
    Status(char code) { this.code = code; }
}

@Entity
public class Order {
    @CodeEnum
    @Column(columnDefinition = "CHAR(1)")
    private Status status;
}
```

### 整数编码

```java
public enum UserType {
    @CodeEnumValue
    ADMIN(1),
    USER(2),
    GUEST(3);

    private final int code;
    UserType(int code) { this.code = code; }
}

@Entity
public class User {
    @CodeEnum
    private UserType userType;
}
```

### 字符串编码

```java
public enum Color {
    @CodeEnumValue
    RED("R"),
    GREEN("G"),
    BLUE("B");

    private final String code;
    Color(String code) { this.code = code; }
}

@Entity
public class Product {
    @CodeEnum
    @Column(length = 1)
    private Color color;
}
```

## 配置说明

`@CodeEnum` 使用 Hibernate 的 `UserType` 机制运行，无需额外配置。注解会被自动发现。

## 限制

- 需要 Hibernate 6+（不兼容 EclipseLink）
- 枚举中的 `@CodeEnumValue` 字段必须是 `final` 的
- 仅支持 `char`、`int`、`long` 和 `String` 编码类型
- 每个枚举值只能有一个 `@CodeEnumValue` 字段
