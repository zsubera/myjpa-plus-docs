---
sidebar_position: 1
title: 字段脱敏
---

# 字段脱敏

`@Mask` 注解配合 `MaskSerializer` 提供 JSON 序列化层的自动数据脱敏。设计上与 `@Encrypt` 配合使用，实现"存储加密 + 展示脱敏"的双重保护。

## 支持的脱敏类型

| MaskType | 输入示例 | 输出示例 | 说明 |
|----------|---------|---------|------|
| `PHONE` | `13812341234` | `138****1234` | 隐藏中间 4 位 |
| `EMAIL` | `user@example.com` | `u***@example.com` | 隐藏用户名部分 |
| `ID_CARD` | `110101199001011234` | `110***********1234` | 保留前 3 后 4 |
| `NAME` | `张三` | `张*` | 保留首字符 |
| `BANK_CARD` | `6222021234561234` | `6222********1234` | 保留前 4 后 4 |
| `ADDRESS` | `北京市海淀区中关村` | `北京市****` | 保留省市 |
| `LICENSE_PLATE` | `京A12345` | `京A****` | 隐藏地区码后内容 |

## 基本用法

### 1. 在实体字段上应用 @Mask

```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Mask(type = MaskType.PHONE)
    private String phone;

    @Mask(type = MaskType.EMAIL)
    private String email;

    @Mask(type = MaskType.ID_CARD)
    private String idCard;

    @Mask(type = MaskType.NAME)
    private String name;
}
```

### 2. 自动脱敏的 JSON 输出

```java
User user = new User();
user.setPhone("13812341234");
user.setEmail("user@example.com");

// 序列化为 JSON 时（如通过 REST API）
// {"phone": "138****1234", "email": "u***@example.com"}
```

### 3. 手动脱敏

```java
String masked = MaskSerializer.mask("13812341234", MaskType.PHONE);
// 返回: "138****1234"
```

## 与 @Encrypt 集成

`@Mask` 与 `@Encrypt` 天然配合，实现纵深防御：

```java
@Entity
public class User {
    @Encrypt                          // 存储时加密（AES/GCM）
    @Mask(type = MaskType.PHONE)      // 展示时脱敏（JSON）
    private String phone;

    @Encrypt
    @Mask(type = MaskType.ID_CARD)
    private String idCard;
}
```

## 自定义 ObjectMapper 配置

### Spring Boot 自动配置

使用 Spring Boot 时，`MaskModule` 会自动注册，无需手动配置。

### 手动配置

```java
ObjectMapper mapper = new ObjectMapper();
mapper.registerModule(new MaskSerializer.MaskModule());
```

### 自定义 MaskSerializer

```java
// 独立使用
MaskSerializer serializer = new MaskSerializer(MaskType.EMAIL);
String masked = serializer.mask("user@example.com", MaskType.EMAIL);
```

## 配置说明

除在 Jackson `ObjectMapper` 上注册 `MaskModule` 外，`@Mask` 不需要额外配置。Spring Boot 自动配置会自动处理。

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| Spring Boot 自动配置 | 已启用 | 自动注册 MaskModule |
| 手动注册 | 可选 | `ObjectMapper.registerModule(new MaskSerializer.MaskModule())` |

## 安全说明

- `@Mask` 作用于序列化层——数据库中原值保持不变
- 敏感数据存储时必须使用 `@Encrypt`；仅 `@Mask` 不能替代加密
- 脱敏后的值不可逆（单向转换）
- 在部署前请使用代表性数据测试脱敏配置
