# CTE (Common Table Expression)

CTE allows you to define temporary result sets within a query, making complex queries more readable and maintainable. `CteSpec` provides a type-safe CTE builder.

## Non-Recursive CTE

### Basic Usage

```java
List<Object[]> results = CteSpec
    .with("active_users")
    .as("SELECT id, name FROM users WHERE active = true")
    .select("SELECT * FROM active_users")
    .getResultList(em);
```

Generated SQL:
```sql
WITH active_users AS (SELECT id, name FROM users WHERE active = true)
SELECT * FROM active_users
```

### CTE with Column Definitions

```java
List<Object[]> results = CteSpec
    .with("active_users")
    .columns("id", "name")
    .as("SELECT id, name FROM users WHERE active = true")
    .select("SELECT * FROM active_users WHERE name LIKE :name")
    .setParameter("name", "%John%")
    .getResultList(em);
```

### Parameter Binding

```java
List<Object[]> results = CteSpec
    .with("recent_orders")
    .as("SELECT * FROM orders WHERE created_at > :cutoff")
    .setParameter("cutoff", LocalDate.now().minusDays(7))
    .select("SELECT * FROM recent_orders WHERE amount > :minAmount")
    .setParameter("minAmount", 100.0)
    .getResultList(em);
```

## Recursive CTE

### Tree Query

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

### Employee Hierarchy Query

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

## Multiple CTE Chaining

```java
List<Object[]> results = CteSpec
    .with("active_users").as("SELECT * FROM users WHERE active = true")
    .and("recent_orders").as("SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '7 days'")
    .select("SELECT u.*, o.total FROM active_users u JOIN recent_orders o ON u.id = o.user_id")
    .getResultList(em);
```

## Query Results

### Get Result List

```java
List<Object[]> results = CteSpec
    .with("tmp").as("SELECT * FROM users")
    .select("SELECT * FROM tmp")
    .getResultList(em);
```

### Get Single Result

```java
Optional<Object[]> result = CteSpec
    .with("count_query").as("SELECT COUNT(*) as cnt FROM users")
    .select("SELECT * FROM count_query")
    .getSingleResult(em);
```

### Get Scalar Value

```java
Long count = CteSpec
    .with("count_query").as("SELECT COUNT(*) as cnt FROM users")
    .select("SELECT cnt FROM count_query")
    .getScalarResult(em, Long.class);
```

### Streaming Results

```java
CteSpec.with("tmp").as("SELECT * FROM users")
    .select("SELECT * FROM tmp")
    .getResultStream(em, stream -> {
        stream.forEach(row -> processRow(row));
    });
```

## Build SQL Only (Debugging)

```java
String sql = CteSpec
    .with("tmp").as("SELECT * FROM users WHERE active = true")
    .select("SELECT * FROM tmp WHERE name LIKE :name")
    .buildSql();

System.out.println(sql);
// WITH tmp AS (SELECT * FROM users WHERE active = true)
// SELECT * FROM tmp WHERE name LIKE :name
```

## Security Notes

- CTE names and column names are validated (only letters, digits, underscores allowed)
- `?N` placeholders in SQL templates are replaced with named parameters
- In strict mode, dangerous SQL keywords throw exceptions
- **Important**: CTE SQL should be written by developers and should not contain user input
