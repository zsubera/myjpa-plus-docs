# 软删除

MyJpa-Plus 使用 `@SoftDelete` 注解提供内置的软删除支持。

## 定义软删除实体

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

## 使用 MyJpaRepository

`MyJpaRepository` 接口提供内置的软删除方法：

```java
public interface ProductRepository extends MyJpaRepository<Product, Long> {
}

// 查找所有未删除的产品
List<Product> products = repository.findNotDeletedAll();

// 带条件查找未删除的实体
List<Product> products = repository.findNotDeletedAll(spec);

// 分页查找未删除的实体
Page<Product> products = repository.findNotDeletedAll(spec, pageable);

// 查找单个未删除的实体
Optional<Product> product = repository.findNotDeletedOne(spec);

// 根据 ID 查找未删除的实体
Optional<Product> product = repository.findNotDeletedById(id);

// 统计未删除的实体数量
long count = repository.countNotDeleted();
long count = repository.countNotDeleted(spec);
```

## 使用 SoftDeleteHelper

需要更多控制时，直接使用 `SoftDeleteHelper`：

```java
// 获取未删除实体的 Specification
Specification<Product> notDeleted = SoftDeleteHelper.isNotDeleted(Product.class);
List<Product> products = repository.findAll(notDeleted);

// 仅获取已删除的实体
Specification<Product> deleted = SoftDeleteHelper.isDeleted(Product.class);
List<Product> archived = repository.findAll(deleted);

// 与其他 Specification 组合
Specification<Product> active = SoftDeleteHelper.isNotDeleted(Product.class)
    .and((root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"));
List<Product> products = repository.findAll(active);
```

## 使用 QuerySpec

```java
// 构建带软删除过滤的 QuerySpec
QuerySpec<Product> qs = SoftDeleteHelper.notDeletedQuery(Product.class);
qs.eq(Product::getCategory, "Electronics");
List<Product> products = repository.findAll(qs.toSpecification());
```

## 自动过滤配置

在 `application.yml` 中启用自动软删除过滤：

```yaml
myjpa-plus:
  soft-delete:
    auto-filter: true  # 默认：true
```

## SoftDeleteFilterBean

使用 `SoftDeleteFilterBean` 进行编程控制：

```java
@Autowired
private SoftDeleteFilterBean filterBean;

// 对任何 Specification 应用软删除过滤
Specification<Product> spec = ...;
Specification<Product> filtered = filterBean.apply(spec, Product.class);

// 检查实体是否有软删除字段
boolean hasSoftDelete = filterBean.hasSoftDeleteField(Product.class);

// 注册实体以缓存结果
filterBean.registerEntity(Product.class);
```

## Boolean 与 Nullable Boolean

MyJpa-Plus 处理 `boolean` 和 `Boolean` 两种类型：

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
