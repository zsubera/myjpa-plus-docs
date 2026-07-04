---
sidebar_position: 1
title: Database Compatibility Matrix
---

# Database Compatibility Matrix

## Supported Databases

| Database | Min Version | JDBC Driver | Test Status | UPSERT | Multi-row Batch UPSERT | Soft Delete | Encryption | Slow Query Monitor |
|----------|------------|-------------|-------------|--------|------------------------|-------------|------------|-------------------|
| PostgreSQL | 12+ | `org.postgresql:postgresql` | ✅ Testcontainers | ✅ `ON CONFLICT DO UPDATE` | ✅ | ✅ | ✅ | ✅ |
| MySQL | 8.0+ | `com.mysql:mysql-connector-j` | ✅ Testcontainers | ✅ `ON DUPLICATE KEY UPDATE` | ✅ | ✅ | ✅ | ✅ |
| Oracle | 12c+ | `com.oracle.database.jdbc` | ⚠️ Community | ✅ `MERGE INTO` | ❌ | ✅ | ✅ | ✅ |
| SQL Server | 2016+ | `com.microsoft.sqlserver:mssql-jdbc` | ⚠️ Community | ✅ `MERGE INTO` | ❌ | ✅ | ✅ | ✅ |

**Legend:**
- ✅ Tested/Supported
- ⚠️ Community-verified (not CI-tested)
- ❌ Not supported

## Feature Compatibility Details

### UPSERT/MERGE Dialects

| Database | SQL Dialect | Conflict Detection | Batch Mode |
|----------|------------|-------------------|------------|
| PostgreSQL | `INSERT ... ON CONFLICT (...) DO UPDATE SET ...` | Unique constraint/PK | Multi-row VALUES |
| MySQL | `INSERT ... ON DUPLICATE KEY UPDATE col = VALUES(col)` | Unique key/PK | Multi-row VALUES |
| Oracle | `MERGE INTO t USING (SELECT ... FROM DUAL) ON (...) WHEN NOT MATCHED ...` | Unique constraint | Row-by-row |
| SQL Server | `MERGE INTO t USING (VALUES (...)) AS source(...) ON (...) WHEN NOT MATCHED ...` | Unique constraint | Row-by-row |

### IN Clause Parameter Limits

| Database | Max per Batch | Auto-batching | Hard Limit |
|----------|--------------|---------------|------------|
| PostgreSQL | 1,000 | ✅ | 5,000 |
| MySQL | 1,000 | ✅ | 5,000 |
| Oracle | 1,000 | ✅ | 5,000 |
| SQL Server | 2,100 | ✅ | 5,000 |

Configure via:
```yaml
myjpa-plus:
  query:
    in-clause-max-size: 1000
    in-clause-hard-limit: 5000
```

### Query Timeout Support

| Database | Timeout Mechanism | Granularity |
|----------|------------------|--------------|
| PostgreSQL | `jakarta.persistence.query.timeout` hint | Statement-level |
| MySQL | `jakarta.persistence.query.timeout` hint | Connection-level |
| Oracle | `jakarta.persistence.query.timeout` hint | Statement-level |
| SQL Server | `jakarta.persistence.query.timeout` hint | Statement-level |

### Streaming Queries (fetchSize)

| Database | fetchSize Support | Cursor Mode |
|----------|------------------|-------------|
| PostgreSQL | ✅ requires `fetchSize` | Forward-only cursor |
| MySQL | ✅ requires `fetchSize` + connection param | Forward-only cursor |
| Oracle | ⚠️ additional config needed | REF CURSOR |
| SQL Server | ✅ requires `fetchSize` | Forward-only cursor |

## Test Configuration

### Testcontainers Integration

The project uses Testcontainers for automated integration testing:

```java
@Testcontainers
class PostgreSQLIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("test");

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
}
```

### Running Integration Tests

```bash
# Run all integration tests (requires Docker)
mvn verify -Pintegration-tests

# PostgreSQL only
mvn verify -Pintegration-tests -Dtest=PostgreSQL*

# MySQL only
mvn verify -Pintegration-tests -Dtest=MySQL*
```

## Known Limitations

### Oracle
1. **No multi-row batch UPSERT** — `MERGE INTO` does not support multi-row VALUES, falls back to row-by-row
2. **IN clause limit** — 1,000 bind parameters; `InClauseBuilder` auto-batches
3. **IDENTITY columns** — Oracle uses SEQUENCE, requires explicit conflict column specification

### SQL Server
1. **No multi-row batch UPSERT** — `MERGE INTO` does not support multi-row VALUES
2. **IN clause limit** — 2,100 bind parameters
3. **MERGE restriction** — same target table cannot be referenced multiple times in one `MERGE`

### MySQL
1. **ON DUPLICATE KEY UPDATE** — only triggers on unique key conflicts, no conditional partial column updates
2. **Streaming queries** — requires `useCursorFetch=true` and `defaultFetchSize=100` in JDBC URL

### PostgreSQL
1. **ON CONFLICT DO UPDATE** — conflict columns must have unique constraints or primary keys
2. **Streaming queries** — requires non-zero `fetchSize` for cursor mode

## Upgrade Path

### Upgrading from 1.2.x to 1.3.x

See [MIGRATION.md](https://github.com/zsubera/myjpa-plus/blob/main/MIGRATION.md) for detailed migration guide.

Key changes:
- `SoftDeleteHelper` batch delete methods migrated to `SoftDeleteBulkExecutor`
- `QueryCacheManager` now supports `CacheAdapter` SPI
- Keyset pagination added
- ThreadLocal management for `@IgnoreSoftDelete`

