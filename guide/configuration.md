# Configuration

MyJpa-Plus is configured via Spring Boot's `application.yml` or `application.properties`.

## Configuration Properties

Prefix: `myjpa-plus`

### Soft Delete

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `myjpa-plus.soft-delete.auto-filter` | boolean | `true` | Automatically apply soft delete filtering to queries |

### Query

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `myjpa-plus.query.max-results` | int | `10000` | Maximum rows returned by findAll/find methods |
| `myjpa-plus.query.deep-pagination-offset-threshold` | int | `100000` | Offset threshold for deep pagination warnings |

## System Properties

These are configured via JVM `-D` flags:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `myjpa-plus.lambda-cache-size` | int | `4096` | LRU cache size for `LambdaUtils` property name extraction |
| `myjpa-plus.in-clause-max-size` | int | `1000` | Max values per IN clause batch (Oracle-compatible) |

## application.yml Example

```yaml
myjpa-plus:
  soft-delete:
    auto-filter: true
  query:
    max-results: 10000
    deep-pagination-offset-threshold: 100000
```

## application.properties Example

```properties
myjpa-plus.soft-delete.auto-filter=true
myjpa-plus.query.max-results=10000
myjpa-plus.query.deep-pagination-offset-threshold=100000
```

## JVM Flags Example

```bash
java -Dmyjpa-plus.lambda-cache-size=8192 \
     -Dmyjpa-plus.in-clause-max-size=500 \
     -jar app.jar
```

## Auto-Configuration

When Spring Data JPA is on the classpath, MyJpa-Plus auto-configures:

- `MyJpaPlusAutoConfiguration` - Main configuration class
- `MyJpaTemplate` - Auto-configured template bean
- `SoftDeleteFilterBean` - Auto-configured when `auto-filter=true`

## Custom MyJpaTemplate

To customize `MyJpaTemplate`, create your own bean:

```java
@Configuration
public class MyJpaConfig {
    
    @Bean
    public MyJpaTemplate myJpaTemplate() {
        return new MyJpaTemplate(5000, 50000);
    }
}
```
