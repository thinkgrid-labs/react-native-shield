# Secure Storage

Store secrets in the device's hardware-backed secure enclave — Keychain on iOS, EncryptedSharedPreferences with Android Keystore on Android.

## Basic operations

```typescript
import {
  setSecureString,
  getSecureString,
  removeSecureString,
} from '@thinkgrid/react-native-shield';

// Store
await setSecureString('access_token', 'eyJhbGci...');

// Read
const token = await getSecureString('access_token'); // string | null

// Delete
await removeSecureString('access_token');
```

## Enumerate keys

```typescript
import { getAllSecureKeys } from '@thinkgrid/react-native-shield';

const keys = await getAllSecureKeys();
// ['access_token', 'refresh_token', 'user_id']
```

Useful for migration scripts, key rotation, or auditing storage state before a release.

## Bulk wipe

```typescript
import { clearAllSecureStorage } from '@thinkgrid/react-native-shield';

const handleLogout = async () => {
  await clearAllSecureStorage();
  // All keys under this app's bundle ID are deleted
};
```

Safe to call even when storage is already empty.

## Implementation details

| | Android | iOS |
|---|---|---|
| Storage backend | `EncryptedSharedPreferences` | Keychain Services |
| Encryption | AES256-GCM | Keychain item encryption |
| Key management | Android Keystore master key | Scoped to app bundle ID |

## Use cases

- **OAuth tokens** — `setSecureString` / `getSecureString` for access and refresh tokens
- **Key rotation auditing** — `getAllSecureKeys` to compare against an expected key manifest
- **GDPR right to erasure** — `clearAllSecureStorage` on account deletion
- **Forced logout** — `clearAllSecureStorage` on session invalidation or security event
