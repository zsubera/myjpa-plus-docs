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
// 1. 更新环境变量以添加新密钥版本
// export MYJPA_ENCRYPT_KEY="v1:old_key,v2:new_key"
// export MYJPA_ENCRYPT_KEY_VERSION=v2

// 2. 在运行时刷新密钥版本
EncryptConverter.refreshKeyVersion();

// 3. 使用新密钥重新加密现有数据
// 读取旧值（使用旧密钥解密）
User user = userRepository.findById(id).orElseThrow();
String oldValue = user.getPhone(); // 自动解密

// 使用当前密钥版本重新加密
String reEncrypted = EncryptConverter.reEncrypt(oldValue);

// 4. 批量重新加密（对所有记录进行密钥轮换）
List<User> allUsers = userRepository.findAll();
for (User u : allUsers) {
    String decrypted = u.getPhone();
    if (decrypted != null) {
        u.setPhone(EncryptConverter.reEncrypt(decrypted));
    }
}
userRepository.saveAll(allUsers);
```

## 调整 PBKDF2 迭代次数

根据安全/性能需求配置密钥派生迭代次数：

```java
// 增加以提高安全性（更慢的密钥派生）
EncryptConverter.setPbkdf2Iterations(1_000_000);

// 或通过配置
// myjpa-plus.query.pbkdf2-iterations=1000000
```

## 密钥验证

在应用启动时验证加密密钥配置：

```java
// 检查密钥是否正确配置
EncryptConverter.validateKeyConfiguration();

// 预热密钥缓存以提高性能
EncryptConverter.warmUpKeyCache();      // 异步
EncryptConverter.warmUpKeyCacheSync();  // 同步
```

## 盐值管理

### 生产环境（必须配置）

```bash
export MYJPA_ENCRYPT_SALT=your_unique_salt_here
```

### 开发环境

未配置时使用固定的开发盐值，仅限开发使用。

## 虚拟线程兼容性

`EncryptConverter` 自动注册事务清理回调，防止虚拟线程（Java 21+）场景中的 Cipher ThreadLocal 内存泄漏。

## 安全说明

- 密钥通过 PBKDF2 派生，600,000 次迭代
- 每次加密使用随机 IV
- GCM 模式提供认证加密（完整性保护）
- 生产环境必须配置唯一盐值
- 不要在代码中硬编码密钥
