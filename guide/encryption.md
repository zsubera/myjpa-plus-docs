# 字段加密

`@Encrypt` 注解配合 `EncryptConverter` 提供透明的 AES-GCM 字段级加密存储。

## 快速开始

### 1. 设置密钥

```bash
# 环境变量（推荐）
export MYJPA_ENCRYPT_KEY=0123456789abcdef  # 16/24/32 字节

# 或系统属性
java -Dmyjpa.encrypt.key=0123456789abcdef -jar app.jar
```

### 2. 标记实体字段

```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Encrypt
    @Column(name = "phone")
    private String phone;

    @Encrypt
    @Column(name = "id_card")
    private String idCard;
}
```

### 3. 自动加解密

```java
// 写入时自动加密
user.setPhone("13812341234");
userRepository.save(user);
// 数据库存储: "v1:Base64编码的密文"

// 读取时自动解密
User found = userRepository.findById(id).orElseThrow();
String phone = found.getPhone();  // → "13812341234"
```

## 加密算法

- **算法**: AES/GCM/NoPadding（认证加密）
- **IV**: 每次加密使用随机 12 字节 IV
- **密钥派生**: PBKDF2WithHmacSHA256（600,000 次迭代）
- **输出格式**: `version:Base64(iv + ciphertext)`

## 密钥配置

### 环境变量（推荐）

```bash
export MYJPA_ENCRYPT_KEY=0123456789abcdef
```

### 系统属性

```bash
java -Dmyjpa.encrypt.key=0123456789abcdef -jar app.jar
```

### 密钥长度要求

- 最小 16 字节（UTF-8 编码）
- 推荐 32 字节
- 支持 16/24/32 字节

## 多版本密钥轮换

支持多版本密钥配置，格式：`v1:key1,v2:key2`

```bash
export MYJPA_ENCRYPT_KEY="v1:old_key_16_bytes!,v2:new_key_16_bytes!"
export MYJPA_ENCRYPT_KEY_VERSION=v2
```

### 在线密钥轮换

```java
// 1. 更新环境变量
// 2. 调用刷新方法
EncryptConverter.refreshKeyVersion();

// 3. 重新加密数据
String reEncrypted = EncryptConverter.reEncrypt(oldEncryptedValue);
```

## 盐值管理

### 生产环境（必须配置）

```bash
export MYJPA_ENCRYPT_SALT=your_unique_salt_here
```

### 开发环境

未配置时使用固定的开发盐值，仅限开发使用。

## 安全说明

- 密钥通过 PBKDF2 派生，600,000 次迭代
- 每次加密使用随机 IV
- GCM 模式提供认证加密（完整性保护）
- 生产环境必须配置唯一盐值
- 不要在代码中硬编码密钥
