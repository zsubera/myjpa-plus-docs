# CTE 公共表表达式

CTE（Common Table Expression，公共表表达式）允许你在查询中定义临时结果集，使复杂查询更易读和维护。`CteSpec` 提供类型安全的 CTE 构建器。

## 非递归 CTE

### 基本用法

```java
List<Object[]> results = CteSpec
    .with("active_users")
    .as("SELECT id, name FROM users WHERE active = true")
    .select("SELECT * FROM active_users")
    .getResultList(em);
```

生成的 SQL：
```sql
WITH active_users AS (SELECT id, name FROM users WHERE active = true)
SELECT * FROM active_users
```

### 带列定义的 CTE

```java
List<Object[]> results = CteSpec
    .with("active_users")
    .columns("id", "name")
    .as("SELECT id, name FROM users WHERE active = true")
    .select("SELECT * FROM active_users WHERE name LIKE :name")
    .setParameter("name", "%John%")
    .getResultList(em);
```

### 参数绑定

```java
List<Object[]> results = CteSpec
    .with("recent_orders")
    .as("SELECT * FROM orders WHERE created_at > :cutoff")
    .setParameter("cutoff", LocalDate.now().minusDays(7))
    .select("SELECT * FROM recent_orders WHERE amount > :minAmount")
    .setParameter("minAmount", 100.0)
    .getResultList(em);
```

## 递归 CTE

### 树形查询

```java
List<Object[]> results = CteSpec
    .withRecursive("category_tree")
    .columns("id", "name", "parent_id", "depth")
    .as("SELECT id, name, parent_id, 0 FROM categories WHERE parent_id IS NULL"
        + " UNION ALL "
        + "SELECT c.id, c.name, c.parent_id, ct.depth + 1 FROM categories c "
        + "JOIN category_tree ct ON c.parent_id = ct.id")
    .select("SELECT * FROM category_tree ORDER BY depth")
    .getResultList(em);
```

### 员工层级查询

```java
List<Object[]> results = CteSpec
    .withRecursive("employee_hierarchy")
    .columns("id", "name", "manager_id", "level")
    .as("SELECT id, name, manager_id, 0 FROM employees WHERE manager_id IS NULL"
        + " UNION ALL "
        + "SELECT e.id, e.name, e.manager_id, eh.level + 1 "
        + "FROM employees e JOIN employee_hierarchy eh ON e.manager_id = eh.id")
    .select("SELECT * FROM employee_hierarchy ORDER BY level, name")
    .getResultList(em);
```

## 多 CTE 链式

```java
List<Object[]> results = CteSpec
    .with("active_users").as("SELECT * FROM users WHERE active = true")
    .and("recent_orders").as("SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '7 days'")
    .select("SELECT u.*, o.total FROM active_users u JOIN recent_orders o ON u.id = o.user_id")
    .getResultList(em);
```

## 查询结果

### 获取结果列表

```java
List<Object[]> results = CteSpec
    .with("tmp").as("SELECT * FROM users")
    .select("SELECT * FROM tmp")
    .getResultList(em);
```

### 获取单个结果

```java
Optional<Object[]> result = CteSpec
    .with("count_query").as("SELECT COUNT(*) as cnt FROM users")
    .select("SELECT * FROM count_query")
    .getSingleResult(em);
```

### 获取标量值

```java
Long count = CteSpec
    .with("count_query").as("SELECT COUNT(*) as cnt FROM users")
    .select("SELECT cnt FROM count_query")
    .getScalarResult(em, Long.class);
```

### 流式查询

```java
CteSpec.with("tmp").as("SELECT * FROM users")
    .select("SELECT * FROM tmp")
    .getResultStream(em, stream -> {
        stream.forEach(row -> processRow(row));
    });
```

## 仅构建 SQL（调试用）

```java
String sql = CteSpec
    .with("tmp").as("SELECT * FROM users WHERE active = true")
    .select("SELECT * FROM tmp WHERE name LIKE :name")
    .buildSql();

System.out.println(sql);
// WITH tmp AS (SELECT * FROM users WHERE active = true)
// SELECT * FROM tmp WHERE name LIKE :name
```

## 安全说明

- CTE 名称和列名会进行安全校验（仅允许字母、数字、下划线）
- SQL 模板中的 `?N` 占位符会被替换为命名参数
- 严格模式下检测到危险 SQL 关键字会抛出异常
- **重要**：CTE SQL 应由开发者编写，不应包含用户输入
