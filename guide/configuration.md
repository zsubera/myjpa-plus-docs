# Configuration

MyJpa-Plus is configured via Spring Boot's `application.yml` or `application.properties`.

## Configuration Properties

Prefix: `myjpa-plus`

### Soft Delete

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `myjpa-plus.soft-delete.auto-filter` | boolean | `true` | Automatically apply soft delete filtering to queries |
| `myjpa-plus.soft-delete.block-unconditional-delete` | boolean | `true` | Block unconditional DELETE/UPDATE without WHERE conditions |

### Query

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `myjpa-plus.query.max-results` | int | `10000` | Maximum rows returned by findAll/find methods |
| `myjpa-plus.query.deep-pagination-offset-threshold` | int | `100000` | Offset threshold for deep pagination warnings |
| `myjpa-plus.query.deep-pagination-offset-limit` | int | `-1` | Hard limit for pagination offset (-1 = disabled) |
| `myjpa-plus.query.in-clause-max-size` | int | `1000` | Max values per IN clause batch (Oracle-compatible) |
| `myjpa-plus.query.in-clause-hard-limit` | int | `5000` | Hard limit for IN clause total values |
| `myjpa-plus.query.lambda-cache-size` | int | `4096` | LRU cache size for LambdaUtils property name extraction |
| `myjpa-plus.query.max-bulk-operation-rows` | int | `10000` | Maximum rows for bulk UPDATE/DELETE operations |
| `myjpa-plus.query.pbkdf2-iterations` | int | `600000` | PBKDF2 iterations for encryption key derivation (100k-10M) |
| `myjpa-plus.query.extra-safe-functions` | `List` | `[]` | Additional safe function names for raw predicate whitelist |
| `myjpa-plus.query.extra-boolean-functions` | `List` | `[]` | Additional boolean function names for raw predicate whitelist |
| `myjpa-plus.query.max-upsert-batch-iterations` | int | `10000` | Maximum batch iterations for UPSERT operations |

### Monitoring

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `myjpa-plus.monitoring.enabled` | boolean | `false` | Enable SQL slow query monitoring |
| `myjpa-plus.monitoring.slow-query-threshold-ms` | long | `1000` | Slow query threshold in milliseconds |

### Cache

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `myjpa-plus.cache.auto-invalidation-enabled` | boolean | `true` | Auto-invalidate cache on entity mutations |
| `myjpa-plus.cache.max-entries` | int | `10000` | Maximum cache entries |

### Encryption

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `MYJPA_ENCRYPT_KEY` (env) | `String` | — | Encryption key (16/24/32 bytes, or multi-version format) |
| `myjpa.encrypt.key` (system prop) | `String` | — | Encryption key (alternative to env var) |
| `MYJPA_ENCRYPT_SALT` (env) | `String` | — | Unique salt for key derivation (required in production) |
| `MYJPA_ENCRYPT_KEY_VERSION` (env) | `String` | — | Active key version for multi-version rotation |

### Auto-Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `myjpa-plus.auto-repository-base-class` | boolean | `true` | Auto-register MyJpaRepository as repository base class |

::: tip Auto-Configuration Resilience (v1.3.1)
`RepositoryBaseClassPostProcessor` wraps each repository initialization in a try-catch block. A failure in one repository won't prevent the remaining repositories — and the entire application — from starting. Startup logs include per-repository status to help identify problematic repositories.
:::

## application.yml Example

```yaml
myjpa-plus:
  soft-delete:
    auto-filter: true
    block-unconditional-delete: true
  query:
    max-results: 10000
    deep-pagination-offset-threshold: 100000
    deep-pagination-offset-limit: -1
    in-clause-max-size: 1000
    lambda-cache-size: 4096
    max-bulk-operation-rows: 10000
    extra-safe-functions:
      - ARRAY_TO_STRING
      - REGEXP_REPLACE
    extra-boolean-functions:
      - MY_CUSTOM_CHECK
  monitoring:
    enabled: false
    slow-query-threshold-ms: 1000
  cache:
    auto-invalidation-enabled: true
    max-entries: 10000
```

## application.properties Example

```properties
myjpa-plus.soft-delete.auto-filter=true
myjpa-plus.soft-delete.block-unconditional-delete=true
myjpa-plus.query.max-results=10000
myjpa-plus.query.deep-pagination-offset-threshold=100000
myjpa-plus.query.deep-pagination-offset-limit=-1
myjpa-plus.monitoring.enabled=false
myjpa-plus.monitoring.slow-query-threshold-ms=1000
myjpa-plus.cache.auto-invalidation-enabled=true
myjpa-plus.cache.max-entries=10000
```

## Auto-Configured Beans

When Spring Data JPA is on the classpath, MyJpa-Plus auto-configures:

| Bean | Type | Condition |
|------|------|-----------|
| `myJpaPlusGlobalConfig` | `MyJpaPlusGlobalConfig` | `@ConditionalOnMissingBean` |
| `auditorAware` | `AuditorAware` | `@ConditionalOnMissingBean` |
| `myJpaTemplate` | `MyJpaTemplate` | `@ConditionalOnMissingBean(MyJpaTemplateOperations)` |
| `queryCacheManager` | `QueryCacheManager` | `@ConditionalOnMissingBean` |
| `cacheAdapter` | `CacheAdapter` | `@ConditionalOnMissingBean` |
| `cacheInvalidationListener` | `CacheInvalidationListener` | `@ConditionalOnMissingBean` + `cache.auto-invalidation-enabled=true` |
| `slowQueryDataSourceProxyPostProcessor` | `SlowQueryDataSourceProxyPostProcessor` | `@ConditionalOnMissingBean` + `monitoring.enabled=true` |
| `repositoryBaseClassPostProcessor` | `RepositoryBaseClassPostProcessor` | `@ConditionalOnMissingBean` + `auto-repository-base-class=true` |

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

## Custom CacheAdapter

To use a distributed cache backend:

```java
@Configuration
public class CacheConfig {
    @Bean
    public CacheAdapter cacheAdapter(RedisTemplate<String, Object> redis) {
        return new RedisCacheAdapter(redis);
    }
}
```

To disable caching:

```java
@Configuration
public class CacheConfig {
    @Bean
    public CacheAdapter cacheAdapter() {
        return CacheAdapter.disabled();
    }
}
```
