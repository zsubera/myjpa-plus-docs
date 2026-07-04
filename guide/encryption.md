# Field Encryption

`@Encrypt` annotation with `EncryptConverter` provides transparent AES-GCM field-level encryption.

## Quick Start

### 1. Set Up Keys

```bash
# Environment variable (recommended)
export MYJPA_ENCRYPT_KEY=0123456789abcdef  # 16/24/32 bytes

# Or system property
java -Dmyjpa.encrypt.key=0123456789abcdef -jar app.jar
```

### 2. Mark Entity Fields

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

### 3. Automatic Encryption/Decryption

```java
// Auto-encrypted on write
user.setPhone("13812341234");
userRepository.save(user);
```

Generated SQL:
```sql
INSERT INTO users (phone, id_card) VALUES (?, ?)
-- phone value: 'v1:Base64-encoded-ciphertext'
```

```java
// Auto-decrypted on read
User found = userRepository.findById(id).orElseThrow();
String phone = found.getPhone();  // → "13812341234"
```

Generated SQL:
```sql
SELECT * FROM users WHERE id = ?
-- phone column contains encrypted value, auto-decrypted by EncryptConverter
```

## Encryption Algorithm

- **Algorithm**: AES/GCM/NoPadding (authenticated encryption)
- **IV**: Random 12-byte IV per encryption
- **Key derivation**: PBKDF2WithHmacSHA256 (600,000 iterations)
- **Output format**: `version:Base64(iv + ciphertext)`

## Key Configuration

### Environment Variable (Recommended)

```bash
export MYJPA_ENCRYPT_KEY=0123456789abcdef
```

### System Property

```bash
java -Dmyjpa.encrypt.key=0123456789abcdef -jar app.jar
```

### Key Length Requirements

- Minimum 16 bytes (UTF-8 encoded)
- Recommended 32 bytes
- Supports 16/24/32 bytes

## Multi-Version Key Rotation

Supports multi-version key configuration, format: `v1:key1,v2:key2`

```bash
export MYJPA_ENCRYPT_KEY="v1:old_key_16_bytes!,v2:new_key_16_bytes!"
export MYJPA_ENCRYPT_KEY_VERSION=v2
```

### Online Key Rotation

```java
// 1. Update environment variable to add new key version
// export MYJPA_ENCRYPT_KEY="v1:old_key,v2:new_key"
// export MYJPA_ENCRYPT_KEY_VERSION=v2

// 2. Refresh key version in runtime
EncryptConverter.refreshKeyVersion();

// 3. Re-encrypt existing data with new key
// Read old value (decrypted with old key)
User user = userRepository.findById(id).orElseThrow();
String oldValue = user.getPhone(); // auto-decrypted

// Re-encrypt with current key version
String reEncrypted = EncryptConverter.reEncrypt(oldValue);

// 4. Batch re-encryption (for key rotation across all records)
List<User> allUsers = userRepository.findAll();
for (User u : allUsers) {
    String decrypted = u.getPhone();
    if (decrypted != null) {
        u.setPhone(EncryptConverter.reEncrypt(decrypted));
    }
}
userRepository.saveAll(allUsers);
```

Generated SQL:
```sql
-- Step 3: Read old value
SELECT * FROM users WHERE id = ?

-- Step 4: Batch re-encryption
SELECT * FROM users
-- Then for each user:
UPDATE users SET phone = ? WHERE id = ?
-- phone value: 'v2:newly-encrypted-ciphertext'
```

## Tuning PBKDF2 Iterations

Configure key derivation iterations for your security/performance requirements:

```java
// Increase for higher security (slower key derivation)
EncryptConverter.setPbkdf2Iterations(1_000_000);

// Or via configuration
// myjpa-plus.query.pbkdf2-iterations=1000000
```

## Key Validation

Validate encryption key configuration at application startup:

```java
// Check key is properly configured
EncryptConverter.validateKeyConfiguration();

// Warm up key cache for better performance
EncryptConverter.warmUpKeyCache();      // async
EncryptConverter.warmUpKeyCacheSync();  // sync
```

## Salt Management

### Production (Must Configure)

```bash
export MYJPA_ENCRYPT_SALT=your_unique_salt_here
```

### Development

Uses a fixed development salt when not configured. For development use only.

## Virtual Thread Compatibility

`EncryptConverter` automatically registers transaction cleanup callbacks to prevent Cipher ThreadLocal memory leaks in virtual thread (Java 21+) scenarios.

## Security Notes

- Keys are derived via PBKDF2 with 600,000 iterations
- Random IV per encryption
- GCM mode provides authenticated encryption (integrity protection)
- Production must configure a unique salt
- Never hardcode keys in source code
