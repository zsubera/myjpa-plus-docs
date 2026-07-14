---
sidebar_position: 1
title: Security
---

# Security

MyJpa-Plus implements a 7-layer security defense architecture to protect against SQL injection, data leaks, and other security threats.

## Layer 1: Input Validation

### Identifier Validation

`IdentifierValidator` validates all column and entity names used in query building:

- **Regex validation**: Only allows `[a-zA-Z_$][a-zA-Z0-9_$]*` patterns
- **Unicode homoglyph detection**: Prevents homoglyph attacks (e.g., replacing ASCII letters with visually similar Unicode characters)
- **Max length**: 128 characters

```java
// Validates column name, throws SecurityViolationException on invalid input
IdentifierValidator.validateColumnName(userInput);
```

## Layer 2: Function Whitelist

Database function calls via `func()` are restricted to a hard-coded whitelist of approximately 80 safe functions across 8 categories:

| Category | Examples |
|----------|----------|
| STRING | `UPPER`, `LOWER`, `LENGTH`, `TRIM`, `SUBSTRING`, `CONCAT`, `REPLACE` |
| MATH | `ABS`, `CEIL`, `FLOOR`, `ROUND`, `MOD`, `POWER`, `SQRT` |
| DATE | `CURRENT_DATE`, `CURRENT_TIME`, `CURRENT_TIMESTAMP`, `YEAR`, `MONTH`, `DAY` |
| CONDITION | `COALESCE`, `NULLIF`, `CASE`, `DECODE` |
| JSON | `JSON_EXTRACT`, `JSON_UNQUOTE`, `JSON_CONTAINS`, `JSON_KEYS` |
| AGGREGATE | `COUNT`, `SUM`, `AVG`, `MAX`, `MIN` |
| GEOMETRY/ARRAY | `ST_Distance`, `ST_Within`, `ARRAY_LENGTH`, `UNNEST` |
| TYPE/UUID | `CAST`, `GEN_RANDOM_UUID`, `UUID_GENERATE_V4` |

**The whitelist cannot be disabled.** To extend it safely:

```yaml
myjpa-plus:
  query:
    extra-safe-functions:
      - MY_CUSTOM_FUNC
    extra-boolean-functions:
      - MY_BOOL_CHECK
```

Or programmatically:

```java
FunctionWhitelist.addSafeFunctionNames(List.of("MY_CUSTOM_FUNC"));
FunctionWhitelist.addBooleanFunctionNames(List.of("MY_CUSTOM_CHECK"));
```

## Layer 3: SQL Injection Detection

`CteSpec` implements 4 security checks before executing any CTE query:

| Check | Description |
|-------|-------------|
| Reserved word check | CTE names must not be SQL reserved words |
| Dangerous keyword detection | Blocks `DROP`, `TRUNCATE`, `GRANT`, `REVOKE`, `ALTER`, `CREATE`, `INSERT`, `DELETE`, `UPDATE`, `EXEC`, `EXECUTE` |
| SQL injection pattern detection | Blocks `OR 1=1`, `';`, `--`, `/*`, `UNION`, `pg_sleep` patterns |
| Unbound parameter detection | Detects `?` placeholders without corresponding parameters |

`strictMode` is hard-coded to `true` and cannot be disabled.

## Layer 4: LIKE Wildcard Escaping

All `LIKE` and `NOT LIKE` operations automatically escape wildcards:

- `%` → `\%`
- `_` → `\_`
- Escape character: `\`

```java
// Auto-escapes % and _ characters
spec.like(User::getName, "test%");  // SQL: name LIKE '%test\%%' ESCAPE '\'
```

## Layer 5: Data Sanitization

### Exception Message Masking

`MyJpaPlusException.toString()` automatically masks sensitive patterns:

- Passwords, tokens, keys, secrets, credentials
- Social Security Numbers (SSN)
- Truncates messages over 200 characters

### SQL Log Sanitization

`SqlSanitizer` (powered by JSqlParser) sanitizes SQL before logging:

- Removes string literal values
- Removes numeric values
- Removes SQL comments (single-line and multi-line)
- Removes dollar-quoted strings (PostgreSQL)

```java
SqlSanitizer sanitizer = new SqlSanitizer();
String safeSql = sanitizer.sanitize(sql);  // Cleans values from SQL
```

## Layer 6: Runtime Guards

| Guard | Default Limit | Description |
|-------|--------------|-------------|
| Max results | 10,000 | `findAll()` / `find` max rows |
| Deep pagination warning | 100,000 offset | Warning logged for large offsets |
| Deep pagination hard limit | 1,000,000 offset | Throws exception if exceeded |
| IN clause hard limit | 5,000 | Maximum IN clause parameters |
| Bulk operation rows | 10,000 | Max rows for bulk update/delete |
| Unconditional operation protection | Enabled | Blocks `updateAll()`/`deleteAll()` without explicit opt-in |
| Recursive depth (NodeResolver) | 50 | Max AST nesting depth |
| Recursive depth (CacheKeyBuilder) | 128 | Max cache key chain depth |

```yaml
myjpa-plus:
  query:
    max-results: 10000
    deep-pagination-offset-threshold: 100000
    deep-pagination-offset-limit: 1000000
    in-clause-hard-limit: 5000
    max-bulk-operation-rows: 10000
```

## Layer 7: Encryption Security

### AES-GCM Encryption

- **Algorithm**: AES/GCM/NoPadding (authenticated encryption with integrity protection)
- **IV**: Random 12-byte IV per encryption (never reused)
- **Key derivation**: PBKDF2WithHmacSHA256, 600,000 iterations
- **Output format**: `version:Base64(iv + ciphertext)`

### Key Management

- **Multi-version key rotation**: `v1:key1,v2:key2` format
- **Salt validation**: Production startup fails without configured salt
- **Plaintext zeroing**: `Arrays.fill(plaintextBytes, 0)` after encryption
- **Key zeroing**: `Arrays.fill(keyChars, '\0')` after PBKDF2

### Cipher Pool

- Bounded (64) `ConcurrentLinkedDeque<Cipher>` object pool
- Safe borrow/return for all exception paths
- Prevents cipher reuse in virtual thread scenarios

## Best Practices

1. **Never** construct SQL with string concatenation — always use parameterized queries
2. **Always** configure `@SoftDelete` entities with proper field types
3. **Always** configure encryption salt in production
4. **Test** function whitelist extensions in a staging environment first
5. **Monitor** deep pagination warnings in production — they indicate inefficient queries
6. **Use** `CteSpec` with `asSafe()` instead of `as()` when including user data
