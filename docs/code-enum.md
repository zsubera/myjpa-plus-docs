---
sidebar_position: 1
title: Code-based Enum Mapping
---

# Code-based Enum Mapping

`@CodeEnum` and `@CodeEnumValue` annotations provide code-based enum mapping for Hibernate 6, storing enum values as compact codes (CHAR, INT, etc.) instead of ordinal positions or full enum names.

## Why Code-Based Enums?

| Approach | Storage | Refactoring Risk | Readability |
|----------|---------|-----------------|-------------|
| `@Enumerated(ORDINAL)` | `0, 1, 2` | Reordering breaks data | Low |
| `@Enumerated(STRING)` | `'MALE', 'FEMALE'` | Renaming breaks data | High |
| `@CodeEnum` (myjpa-plus) | `'M', 'F'` | Reorder/rename safe | Medium |

## Basic Usage

### 1. Define Enum with Codes

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

### 2. Use in Entity

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

### 3. Persist and Query

```java
// Save
User user = new User();
user.setGender(Gender.MALE);
userRepository.save(user);  // Stored as 'M' in DB

// Query
QuerySpec<User> spec = new QuerySpec<>();
spec.eq(User::getGender, Gender.MALE);
List<User> users = userRepository.findAll(spec);
```

Generated SQL:
```sql
INSERT INTO users (gender) VALUES ('M')
-- Gender.MALE → 'M' in database column
```

## Supported Code Types

### Character Code

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

### Integer Code

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

### String Code

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

## Configuration

`@CodeEnum` uses Hibernate's `UserType` mechanism and requires no additional configuration. The annotations are automatically discovered.

## Limitations

- Requires Hibernate 6+ (not compatible with EclipseLink)
- The `@CodeEnumValue` field in the enum must be `final`
- Only supports `char`, `int`, `long`, and `String` code types
- Enum values must have exactly one `@CodeEnumValue` field
