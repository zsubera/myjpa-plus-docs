# MyJpaTemplate

`MyJpaTemplate` 是一个便利类，为常见操作提供更简单的 API。

## 配置

MyJpaTemplate 是自动配置的，直接注入即可：

```java
@Autowired
private MyJpaTemplate template;
```

## 查询操作

### 查找所有

```java
// 使用 QuerySpec
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"));

// 限制返回数量
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"), 100);

// 使用 EntityGraph
List<User> users = template.findAll(User.class, 
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    EntityGraphHelper.forEntity(User.class).add("department"));
```

### 查找单个

```java
Optional<User> user = template.findOne(User.class,
    new QuerySpec<User>().eq(User::getEmail, "john@example.com"));
```

### 统计

```java
long count = template.count(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"));
```

### 判断存在

```java
boolean exists = template.exists(User.class,
    new QuerySpec<User>().eq(User::getEmail, "john@example.com"));
```

## 更新操作

```java
int count = template.update(User.class)
    .set(User::setStatus, "INACTIVE")
    .eq(User::getStatus, "PENDING")
    .execute(em);
```

## 删除操作

```java
int count = template.delete(User.class)
    .eq(User::getStatus, "DELETED")
    .execute(em);
```

## 分页

```java
// 使用 Pageable
Page<User> page = template.findAll(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"),
    PageRequest.of(0, 20, Sort.by("name")));
```

## EntityGraph

```java
// 创建 EntityGraph 辅助器
EntityGraphHelper<User> graph = EntityGraphHelper.forEntity(User.class)
    .add("department")
    .add("roles.permissions");

// 在查询中使用
List<User> users = template.findAll(User.class,
    new QuerySpec<User>().eq(User::getStatus, "ACTIVE"), graph);
```

## 自定义配置

```java
// MyJpaTemplate 接受自定义的最大结果数和分页阈值
MyJpaTemplate template = new MyJpaTemplate(5000, 50000);
```
