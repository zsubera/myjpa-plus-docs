# Soft Delete

MyJpa-Plus provides built-in soft delete support using the `@SoftDelete` annotation.

## Define Soft Delete Entity

```java
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @SoftDelete
    private Boolean deleted = false;
    
    // getters and setters...
}
```

## Using MyJpaRepository

The `MyJpaRepository` interface provides built-in soft delete methods:

```java
public interface ProductRepository extends MyJpaRepository<Product, Long> {
}

// Find all non-deleted products
List<Product> products = repository.findNotDeletedAll();

// Find non-deleted entities with conditions
List<Product> products = repository.findNotDeletedAll(spec);

// Paginated non-deleted entities
Page<Product> products = repository.findNotDeletedAll(spec, pageable);

// Find single non-deleted entity
Optional<Product> product = repository.findNotDeletedOne(spec);

// Find non-deleted entity by ID
Optional<Product> product = repository.findNotDeletedById(id);

// Count non-deleted entities
long count = repository.countNotDeleted();
long count = repository.countNotDeleted(spec);
```

## Using SoftDeleteHelper

For more control, use `SoftDeleteHelper` directly:

```java
// Get Specification for non-deleted entities
Specification<Product> notDeleted = SoftDeleteHelper.isNotDeleted(Product.class);
List<Product> products = repository.findAll(notDeleted);

// Get only deleted entities
Specification<Product> deleted = SoftDeleteHelper.isDeleted(Product.class);
List<Product> archived = repository.findAll(deleted);

// Combine with other Specifications
Specification<Product> active = SoftDeleteHelper.isNotDeleted(Product.class)
    .and((root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"));
List<Product> products = repository.findAll(active);
```

## Using QuerySpec

```java
// Build QuerySpec with soft delete filter
QuerySpec<Product> qs = SoftDeleteHelper.notDeletedQuery(Product.class);
qs.eq(Product::getCategory, "Electronics");
List<Product> products = repository.findAll(qs.toSpecification());
```

## Utility Methods

```java
// Find the soft delete field name
String fieldName = SoftDeleteHelper.findSoftDeleteField(Product.class);

// Check if an entity instance is soft-deleted
boolean isDeleted = SoftDeleteHelper.isSoftDeleted(Product.class, product);
```

## Auto-Filter Configuration

Enable automatic soft delete filtering in `application.yml`:

```yaml
myjpa-plus:
  soft-delete:
    auto-filter: true  # Default: true
```

## SoftDeleteFilterBean

Use `SoftDeleteFilterBean` for programmatic control:

```java
@Autowired
private SoftDeleteFilterBean filterBean;

// Apply soft delete filter to any Specification
Specification<Product> spec = ...;
Specification<Product> filtered = filterBean.apply(spec, Product.class);

// Check if entity has soft delete field
boolean hasSoftDelete = filterBean.hasSoftDeleteField(Product.class);

// Register entity for caching
filterBean.registerEntity(Product.class);
```

## Boolean vs Nullable Boolean

MyJpa-Plus handles both `boolean` and `Boolean` types:

```java
// Primitive boolean - WHERE deleted = false
@SoftDelete
private boolean deleted;

// Wrapper Boolean - WHERE deleted IS NULL OR deleted = false
@SoftDelete
private Boolean deleted;
```

The nullable `Boolean` type allows three states:
- `null` or `false` = not deleted
- `true` = deleted
