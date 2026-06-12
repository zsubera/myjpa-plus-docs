# 代码生成

`EntityCodeGenerator` 提供轻量级代码生成功能，快速生成 JPA 实体和仓库骨架代码。

## 实体生成

### 基本用法

```java
// 定义列
List<EntityCodeGenerator.ColumnDef> columns = List.of(
    new EntityCodeGenerator.ColumnDef("name", "String", false),
    new EntityCodeGenerator.ColumnDef("price", "BigDecimal", true),
    new EntityCodeGenerator.ColumnDef("createdAt", "Instant", false)
);

// 生成实体源码
String entitySrc = EntityCodeGenerator.generateEntity(
    "products",          // 表名
    columns,             // 列定义
    "com.example.domain" // 包名
);
```

生成的代码：
```java
package com.example.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "price")
    private BigDecimal price;

    @Column(name = "created_at")
    private Instant createdAt;

    // getters and setters...
}
```

## 仓库生成

```java
String repoSrc = EntityCodeGenerator.generateRepository(
    "products",              // 表名
    columns,                 // 列定义
    "com.example.domain",    // 实体包名
    "com.example.repo"       // 仓库包名
);
```

生成的代码：
```java
package com.example.repo;

import com.example.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

## ColumnDef 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| name | String | 列名（Java 属性名） |
| type | String | Java 类型（如 "String", "Integer", "BigDecimal"） |
| nullable | boolean | 是否可为 null |

## 支持的类型

- `String`
- `Integer` / `int`
- `Long` / `long`
- `BigDecimal`
- `Boolean` / `boolean`
- `Instant`
- `LocalDateTime`
- `Date`

## 使用场景

- 快速搭建新项目实体骨架
- 根据数据库表结构生成实体类
- 批量生成多个实体类
- 代码审查和模板参考
