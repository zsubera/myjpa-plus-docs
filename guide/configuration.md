# 配置

MyJpa-Plus 通过 Spring Boot 的 `application.yml` 或 `application.properties` 进行配置。

## 配置属性

前缀：`myjpa-plus`

### 软删除

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `myjpa-plus.soft-delete.auto-filter` | boolean | `true` | 自动对查询应用软删除过滤 |

### 查询

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `myjpa-plus.query.max-results` | int | `10000` | findAll/find 方法返回的最大行数 |
| `myjpa-plus.query.deep-pagination-offset-threshold` | int | `100000` | 深度分页警告的 offset 阈值 |

## application.yml 示例

```yaml
myjpa-plus:
  soft-delete:
    auto-filter: true
  query:
    max-results: 10000
    deep-pagination-offset-threshold: 100000
```

## application.properties 示例

```properties
myjpa-plus.soft-delete.auto-filter=true
myjpa-plus.query.max-results=10000
myjpa-plus.query.deep-pagination-offset-threshold=100000
```

## 自动配置

当类路径上存在 Spring Data JPA 时，MyJpa-Plus 会自动配置：

- `MyJpaPlusAutoConfiguration` - 主配置类
- `MyJpaTemplate` - 自动配置的模板 Bean
- `SoftDeleteFilterBean` - 当 `auto-filter=true` 时自动配置

## 自定义 MyJpaTemplate

要自定义 `MyJpaTemplate`，创建你自己的 Bean：

```java
@Configuration
public class MyJpaConfig {
    
    @Bean
    public MyJpaTemplate myJpaTemplate() {
        return new MyJpaTemplate(5000, 50000);
    }
}
```
