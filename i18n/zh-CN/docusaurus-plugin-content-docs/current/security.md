---
sidebar_position: 1
title: 安全
---

# 安全

MyJpa-Plus 实现了 7 层安全防御架构，防止 SQL 注入、数据泄露和其他安全威胁。

## 第一层：输入验证

### 标识符验证

`IdentifierValidator` 验证查询构建中使用的所有列名和实体名：

- **正则验证**：仅允许 `[a-zA-Z_$][a-zA-Z0-9_$]*` 模式
- **Unicode 同形字检测**：防止同形字攻击（如用视觉相似的 Unicode 字符替换 ASCII 字母）
- **最大长度**：128 个字符

```java
// 验证列名，输入无效时抛出 SecurityViolationException
IdentifierValidator.validateColumnName(userInput);
```

## 第二层：函数白名单

通过 `func()` 调用的数据库函数被限制在硬编码的白名单中，约 80 个安全函数，分 8 个类别：

| 类别 | 示例 |
|------|------|
| STRING | `UPPER`、`LOWER`、`LENGTH`、`TRIM`、`SUBSTRING`、`CONCAT`、`REPLACE` |
| MATH | `ABS`、`CEIL`、`FLOOR`、`ROUND`、`MOD`、`POWER`、`SQRT` |
| DATE | `CURRENT_DATE`、`CURRENT_TIME`、`CURRENT_TIMESTAMP`、`YEAR`、`MONTH`、`DAY` |
| CONDITION | `COALESCE`、`NULLIF`、`CASE`、`DECODE` |
| JSON | `JSON_EXTRACT`、`JSON_UNQUOTE`、`JSON_CONTAINS`、`JSON_KEYS` |
| AGGREGATE | `COUNT`、`SUM`、`AVG`、`MAX`、`MIN` |
| GEOMETRY/ARRAY | `ST_Distance`、`ST_Within`、`ARRAY_LENGTH`、`UNNEST` |
| TYPE/UUID | `CAST`、`GEN_RANDOM_UUID`、`UUID_GENERATE_V4` |

**白名单不可禁用。** 安全扩展方式：

```yaml
myjpa-plus:
  query:
    extra-safe-functions:
      - MY_CUSTOM_FUNC
    extra-boolean-functions:
      - MY_BOOL_CHECK
```

或编程方式：

```java
FunctionWhitelist.addSafeFunctionNames(List.of("MY_CUSTOM_FUNC"));
FunctionWhitelist.addBooleanFunctionNames(List.of("MY_CUSTOM_CHECK"));
```

## 第三层：SQL 注入检测

`CteSpec` 在执行任何 CTE 查询前进行 4 项安全检查：

| 检查项 | 说明 |
|--------|------|
| 保留字检查 | CTE 名称不能是 SQL 保留字 |
| 危险关键词检测 | 阻止 `DROP`、`TRUNCATE`、`GRANT`、`REVOKE`、`ALTER`、`CREATE`、`INSERT`、`DELETE`、`UPDATE`、`EXEC`、`EXECUTE` |
| SQL 注入模式检测 | 阻止 `OR 1=1`、`';`、`--`、`/*`、`UNION`、`pg_sleep` 模式 |
| 未绑定参数检测 | 检测没有对应参数的 `?` 占位符 |

`strictMode` 硬编码为 `true`，不可禁用。

## 第四层：LIKE 通配符转义

所有 `LIKE` 和 `NOT LIKE` 操作自动转义通配符：

- `%` → `\%`
- `_` → `\_`
- 转义字符：`\`

```java
// 自动转义 % 和 _ 字符
spec.like(User::getName, "test%");  // SQL: name LIKE '%test\%%' ESCAPE '\'
```

## 第五层：数据清理

### 异常消息脱敏

`MyJpaPlusException.toString()` 自动屏蔽敏感模式：

- 密码、令牌、密钥、机密、凭证
- 社会安全号码（SSN）
- 超过 200 字符的消息会被截断

### SQL 日志清理

`SqlSanitizer`（基于 JSqlParser）在记录日志前清理 SQL：

- 移除字符串字面值
- 移除数值
- 移除 SQL 注释（单行和多行）
- 移除美元引号字符串（PostgreSQL）

```java
SqlSanitizer sanitizer = new SqlSanitizer();
String safeSql = sanitizer.sanitize(sql);  // 从 SQL 中清理值
```

## 第六层：运行时防护

| 防护项 | 默认限制 | 说明 |
|--------|---------|------|
| 最大结果数 | 10,000 | `findAll()` / `find` 的最大行数 |
| 深度分页警告 | 100,000 offset | 大偏移量时记录警告 |
| 深度分页硬限制 | 1,000,000 offset | 超出时抛出异常 |
| IN 子句硬限制 | 5,000 | IN 子句最大参数数量 |
| 批量操作行数 | 10,000 | 批量更新/删除的最大行数 |
| 无条件操作保护 | 已启用 | 需要显式启用才能使用 `updateAll()`/`deleteAll()` |
| 递归深度（NodeResolver） | 50 | AST 最大嵌套深度 |
| 递归深度（CacheKeyBuilder） | 128 | 缓存键链最大深度 |

```yaml
myjpa-plus:
  query:
    max-results: 10000
    deep-pagination-offset-threshold: 100000
    deep-pagination-offset-limit: 1000000
    in-clause-hard-limit: 5000
    max-bulk-operation-rows: 10000
```

## 第七层：加密安全

### AES-GCM 加密

- **算法**：AES/GCM/NoPadding（带完整性保护的身份验证加密）
- **IV**：每次加密随机生成 12 字节 IV（永不重用）
- **密钥派生**：PBKDF2WithHmacSHA256，600,000 次迭代
- **输出格式**：`version:Base64(iv + ciphertext)`

### 密钥管理

- **多版本密钥轮换**：`v1:key1,v2:key2` 格式
- **盐值验证**：生产环境启动时未配置盐值则失败
- **明文清零**：加密后 `Arrays.fill(plaintextBytes, 0)`
- **密钥清零**：PBKDF2 后 `Arrays.fill(keyChars, '\0')`

### 密码池

- 有界（64）`ConcurrentLinkedDeque<Cipher>` 对象池
- 所有异常路径的安全借用/归还
- 防止虚拟线程场景中的密码重复使用

## 最佳实践

1. **永远不要**使用字符串拼接构造 SQL——始终使用参数化查询
2. **始终**为 `@SoftDelete` 实体配置正确的字段类型
3. **始终**在生产环境配置加密盐值
4. **在**测试环境中先验证函数白名单扩展
5. **监控**生产环境中的深度分页警告——它们表示低效的查询
6. **使用** `CteSpec` 的 `asSafe()` 而不是 `as()`，当包含用户数据时
