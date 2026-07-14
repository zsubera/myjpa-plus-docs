---
sidebar_position: 1
title: Field Masking
---

# Field Masking

`@Mask` annotation with `MaskSerializer` provides automatic data masking at the JSON serialization layer. Designed to pair with `@Encrypt` for "encrypt at rest + mask on display."

## Supported Mask Types

| MaskType | Example Input | Example Output | Description |
|----------|--------------|----------------|-------------|
| `PHONE` | `13812341234` | `138****1234` | Mask middle 4 digits |
| `EMAIL` | `user@example.com` | `u***@example.com` | Mask username part |
| `ID_CARD` | `110101199001011234` | `110***********1234` | Keep first 3 and last 4 |
| `NAME` | `Zhang San` | `Z**n S**` | Mask middle characters |
| `BANK_CARD` | `6222021234561234` | `6222********1234` | Keep first 4 and last 4 |
| `ADDRESS` | `Beijing Haidian District` | `Beijing***********` | Keep province/city |
| `LICENSE_PLATE` | `京A12345` | `京A****` | Mask after region code |

## Basic Usage

### 1. Apply @Mask to Entity Fields

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

### 2. Auto-Masked JSON Output

```java
User user = new User();
user.setPhone("13812341234");
user.setEmail("user@example.com");

// When serialized to JSON (e.g., via REST API)
// {"phone": "138****1234", "email": "u***@example.com"}
```

### 3. Manual Masking

```java
String masked = MaskSerializer.mask("13812341234", MaskType.PHONE);
// Returns: "138****1234"
```

## Integration with @Encrypt

`@Mask` pairs naturally with `@Encrypt` for defense in depth:

```java
@Entity
public class User {
    @Encrypt                          // Encrypted at rest (AES/GCM)
    @Mask(type = MaskType.PHONE)      // Masked on display (JSON)
    private String phone;

    @Encrypt
    @Mask(type = MaskType.ID_CARD)
    private String idCard;
}
```

## Custom ObjectMapper Configuration

### Spring Boot Auto-Configuration

With Spring Boot, the `MaskModule` is auto-registered. No manual configuration needed.

### Manual Configuration

```java
ObjectMapper mapper = new ObjectMapper();
mapper.registerModule(new MaskSerializer.MaskModule());
```

### Custom MaskSerializer

```java
// Standalone usage
MaskSerializer serializer = new MaskSerializer(MaskType.EMAIL);
String masked = serializer.mask("user@example.com", MaskType.EMAIL);
```

## Configuration

`@Mask` requires no additional configuration beyond registering the `MaskModule` on your Jackson `ObjectMapper`. With Spring Boot auto-configuration, this is handled automatically.

| Property | Default | Description |
|----------|---------|-------------|
| Spring Boot auto-config | Enabled | Auto-registers MaskModule |
| Manual registration | Optional | `ObjectMapper.registerModule(new MaskSerializer.MaskModule())` |

## Security Notes

- `@Mask` works at the serialization layer — the original value remains in the database
- Always use `@Encrypt` for sensitive data at rest; `@Mask` alone is not encryption
- Masked values are irreversible (one-way transformation)
- Test your mask configurations with representative data before deploying
