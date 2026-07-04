# 软删除

MyJpa-Plus 使用 `@SoftDelete` 注解提供内置的软删除支持。

## 定义软删除实体

### 基于 Boolean（最常用）

```java
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @SoftDelete
    private Boolean deleted = false;
    
    // getter 和 setter...
}
```

### 基于 Enum

```java
public enum Status {
    ACTIVE, INACTIVE, DELETED
}

@Entity
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @SoftDelete(deletedValue = "DELETED")
    private Status status = Status.ACTIVE;
}
```

### Boolean 与 Nullable Boolean

```java
// 基本类型 boolean - WHERE deleted = false
@SoftDelete
private boolean deleted;

// 包装类型 Boolean - WHERE deleted IS NULL OR deleted = false
@SoftDelete
private Boolean deleted;
```

可空的 `Boolean` 类型允许三种状态：
- `null` 或 `false` = 未删除
- `true` = 已删除

### Integer 类型

```java
@Entity
public class AuditLog {
    @SoftDelete(deletedIntValue = 1)
    private Integer deleted = 0;
}
```

### String 类型

```java
@Entity
public class Document {
    @SoftDelete(deletedStringValue = "ARCHIVED")
    private String status = "ACTIVE";
}
```

### 删除时间戳

软删除时自动设置时间戳：

```java
@Entity
public class User {
    @SoftDelete
    private Boolean deleted;

    @SoftDelete(deletedTimestampField = "deletedAt")
    private LocalDateTime deletedAt;
}
```

## 使用 MyJpaRepository

`MyJpaRepository` 接口提供内置的软删除方法：

```java
public interface ProductRepository extends MyJpaRepository<Product, Long> {
}
```

```java
// 查找所有未删除的产品
List<Product> products = repository.findNotDeletedAll();
```

生成的 SQL：
```sql
SELECT * FROM products WHERE deleted = false
```

```java
// 带条件查找未删除的实体
List<Product> products = repository.findNotDeletedAll(spec);
```

生成的 SQL：
```sql
SELECT * FROM products WHERE deleted = false AND status = 'ACTIVE'
```

```java
// 分页查找未删除的实体
Page<Product> products = repository.findNotDeletedAll(spec, pageable);
```

生成的 SQL：
```sql
-- 统计
SELECT COUNT(*) FROM products WHERE deleted = false AND status = 'ACTIVE'

-- 数据
SELECT * FROM products WHERE deleted = false AND status = 'ACTIVE' LIMIT 20 OFFSET 0
```

```java
// 查找单个未删除的实体
Optional<Product> product = repository.findNotDeletedOne(spec);
```

生成的 SQL：
```sql
SELECT * FROM products WHERE deleted = false AND status = 'ACTIVE' LIMIT 1
```

```java
// 根据 ID 查找未删除的实体
Optional<Product> product = repository.findNotDeletedById(id);
```

生成的 SQL：
```sql
SELECT * FROM products WHERE id = ? AND deleted = false
```

```java
// 统计未删除的实体数量
long count = repository.countNotDeleted();
```

生成的 SQL：
```sql
SELECT COUNT(*) FROM products WHERE deleted = false
```

## 使用 SoftDeleteHelper

需要更多控制时，直接使用 `SoftDeleteHelper`：

```java
// 获取未删除实体的 Specification（缓存）
Specification<Product> notDeleted = SoftDeleteHelper.isNotDeleted(Product.class);
List<Product> products = repository.findAll(notDeleted);
```

生成的 SQL：
```sql
SELECT * FROM products WHERE deleted = false
```

```java
// 仅获取已删除的实体（缓存）
Specification<Product> deleted = SoftDeleteHelper.isDeleted(Product.class);
List<Product> archived = repository.findAll(deleted);
```

生成的 SQL：
```sql
SELECT * FROM products WHERE deleted = true
```

## 使用 QuerySpec

```java
// 构建带软删除过滤的 QuerySpec
QuerySpec<Product> qs = SoftDeleteHelper.notDeletedQuery(Product.class);
qs.eq(Product::getCategory, "Electronics");
List<Product> products = repository.findAll(qs.toSpecification());
```

生成的 SQL：
```sql
SELECT * FROM products WHERE deleted = false AND category = 'Electronics'
```

## @IgnoreSoftDelete

使用 `@IgnoreSoftDelete` 跳过特定方法或类型的自动过滤：

```java
// 跳过特定仓库方法
@IgnoreSoftDelete
@Query("SELECT p FROM Product p WHERE p.id = :id")
Optional<Product> findByIdIncludingDeleted(@Param("id") Long id);
```

生成的 SQL：
```sql
SELECT * FROM products WHERE id = ?
-- 注意：没有 deleted = false 条件，包含已删除的记录
```

## SoftDeleteBulkExecutor

批量软删除操作：

```java
// 软删除所有实体（带行数保护）
int affected = SoftDeleteBulkExecutor.softDeleteAll(em, User.class, true);
```

生成的 SQL：
```sql
UPDATE users SET deleted = true WHERE deleted = false
```

```java
// 按 ID 软删除
int affected = SoftDeleteBulkExecutor.softDeleteByIds(em, User.class, List.of(1L, 2L, 3L));
```

生成的 SQL：
```sql
UPDATE users SET deleted = true WHERE id IN (1, 2, 3) AND deleted = false
```

## SoftDeleteContext（虚拟线程支持）

虚拟线程（Java 21+）场景：

```java
// 使用 withIgnore — 推荐用于虚拟线程
List<User> allUsers = SoftDeleteContext.withIgnore(() -> repository.findAll());
```

生成的 SQL（临时禁用软删除过滤）：
```sql
SELECT * FROM users
-- 注意：没有 deleted = false 条件，包含所有记录
```
