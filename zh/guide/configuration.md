# 配置

MyJpa-Plus 通过 Spring Boot 的 `application.yml` 或 `application.properties` 进行配置。

## 配置属性

前缀：`myjpa-plus`

### 软删除

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `myjpa-plus.soft-delete.auto-filter` | boolean | `true` | 自动对查询应用软删除过滤 |
| `myjpa-plus.soft-delete.block-unconditional-delete` | boolean | `true` | 阻止无 WHERE 条件的无条件 DELETE/UPDATE |

### 查询

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `myjpa-plus.query.max-results` | int | `10000` | findAll/find 方法返回的最大行数 |
| `myjpa-plus.query.deep-pagination-offset-threshold` | int | `100000` | 深度分页警告的 offset 阈值 |
| `myjpa-plus.query.deep-pagination-offset-limit` | int | `-1` | 分页偏移量硬限制（-1 = 禁用） |
| `myjpa-plus.query.in-clause-max-size` | int | `1000` | 每批 IN 子句的最大值数量（Oracle 兼容） |
| `myjpa-plus.query.in-clause-hard-limit` | int | `5000` | IN 子句总值数硬限制 |
| `myjpa-plus.query.lambda-cache-size` | int | `4096` | `LambdaUtils` 属性名提取的 LRU 缓存大小 |
| `myjpa-plus.query.max-bulk-operation-rows` | int | `10000` | 批量 UPDATE/DELETE 操作的最大行数 |
| `myjpa-plus.query.pbkdf2-iterations` | int | `600000` | 加密密钥派生的 PBKDF2 迭代次数（100k-10M） |
| `myjpa-plus.query.extra-safe-functions` | `List` | `[]` | 扩展函数白名单 |
| `myjpa-plus.query.extra-boolean-functions` | `List` | `[]` | 扩展布尔函数白名单 |
| `myjpa-plus.query.max-upsert-batch-iterations` | int | `10000` | UPSERT 操作的最大批处理迭代次数 |

### 监控

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `myjpa-plus.monitoring.enabled` | boolean | `false` | 启用 SQL 慢查询监控 |
| `myjpa-plus.monitoring.slow-query-threshold-ms` | long | `1000` | 慢查询阈值（毫秒） |

### 缓存

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `myjpa-plus.cache.auto-invalidation-enabled` | boolean | `true` | 实体变更时自动失效缓存 |
| `myjpa-plus.cache.max-entries` | int | `10000` | 最大缓存条目数 |

### 加密

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `MYJPA_ENCRYPT_KEY` (环境变量) | `String` | — | 加密密钥（16/24/32 字节，或多版本格式） |
| `myjpa.encrypt.key` (系统属性) | `String` | — | 加密密钥（环境变量的替代方式） |
| `MYJPA_ENCRYPT_SALT` (环境变量) | `String` | — | 密钥派生的唯一盐值（生产环境必须配置） |
| `MYJPA_ENCRYPT_KEY_VERSION` (环境变量) | `String` | — | 多版本轮换时的活动密钥版本 |

### 自动配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `myjpa-plus.auto-repository-base-class` | boolean | `true` | 自动注册 MyJpaRepository 作为仓库基类 |

## application.yml 示例

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

## application.properties 示例

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

## 自动配置的 Bean

当类路径上存在 Spring Data JPA 时，MyJpa-Plus 会自动配置：

| Bean | 类型 | 条件 |
|------|------|------|
| `myJpaPlusGlobalConfig` | `MyJpaPlusGlobalConfig` | `@ConditionalOnMissingBean` |
| `auditorAware` | `AuditorAware` | `@ConditionalOnMissingBean` |
| `myJpaTemplate` | `MyJpaTemplate` | `@ConditionalOnMissingBean(MyJpaTemplateOperations)` |
| `queryCacheManager` | `QueryCacheManager` | `@ConditionalOnMissingBean` |
| `cacheAdapter` | `CacheAdapter` | `@ConditionalOnMissingBean` |
| `cacheInvalidationListener` | `CacheInvalidationListener` | `@ConditionalOnMissingBean` + `cache.auto-invalidation-enabled=true` |
| `slowQueryDataSourceProxyPostProcessor` | `SlowQueryDataSourceProxyPostProcessor` | `@ConditionalOnMissingBean` + `monitoring.enabled=true` |
| `repositoryBaseClassPostProcessor` | `RepositoryBaseClassPostProcessor` | `@ConditionalOnMissingBean` + `auto-repository-base-class=true` |

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

## 自定义 CacheAdapter

使用分布式缓存后端：

```java
@Configuration
public class CacheConfig {
    @Bean
    public CacheAdapter cacheAdapter(RedisTemplate<String, Object> redis) {
        return new RedisCacheAdapter(redis);
    }
}
```

禁用缓存：

```java
@Configuration
public class CacheConfig {
    @Bean
    public CacheAdapter cacheAdapter() {
        return CacheAdapter.disabled();
    }
}
```
