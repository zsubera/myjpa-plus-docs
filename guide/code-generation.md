# Code Generation

`EntityCodeGenerator` provides lightweight code generation for quickly generating JPA entity and repository skeleton code.

::: warning Experimental
`EntityCodeGenerator` is marked as `@apiNote Experimental`. It is a standalone scaffolding tool, not part of the core API.
:::

## Entity Generation

### Basic Usage

```java
// Define columns
List<EntityCodeGenerator.ColumnDef> columns = List.of(
    new EntityCodeGenerator.ColumnDef("name", "String", false),
    new EntityCodeGenerator.ColumnDef("price", "BigDecimal", true),
    new EntityCodeGenerator.ColumnDef("createdAt", "Instant", false)
);

// Generate entity source code
String entitySrc = EntityCodeGenerator.generateEntity(
    "products",          // table name
    columns,             // column definitions
    "com.example.domain" // package name
);
```

Generated code:
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

## Repository Generation

```java
String repoSrc = EntityCodeGenerator.generateRepository(
    "products",              // table name
    columns,                 // column definitions
    "com.example.domain",    // entity package
    "com.example.repo"       // repository package
);
```

Generated code:
```java
package com.example.repo;

import com.example.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

## ColumnDef Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| name | String | Column name (Java property name) |
| type | String | Java type (e.g., "String", "Integer", "BigDecimal") |
| nullable | boolean | Whether the column is nullable |

## Supported Types

- `String`
- `Integer` / `int`
- `Long` / `long`
- `BigDecimal`
- `Boolean` / `boolean`
- `Instant`
- `LocalDateTime`
- `Date`

## Use Cases

- Quickly scaffold new project entities
- Generate entity classes from database table structures
- Batch generate multiple entity classes
- Code review and template reference
