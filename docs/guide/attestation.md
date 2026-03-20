# Platform Attestation

Request a **cryptographically signed integrity token** from Google or Apple that your server can verify. This is the only mechanism that provides hardware-backed, unforgeable proof of device and app integrity.

## Usage

```typescript
import { requestIntegrityToken } from '@thinkgrid/react-native-shield';

const verifyDeviceWithServer = async () => {
  try {
    // Nonce must be generated server-side — unique, unpredictable, single-use
    const nonce = await fetchNonceFromServer();
    const token = await requestIntegrityToken(nonce);

    // Send token to your backend for verification
    await sendToBackend({ token, platform: Platform.OS });
    // Android: verify via Google Play Integrity API
    // iOS: verify via Apple DeviceCheck API
  } catch (e) {
    // 'INTEGRITY_NOT_SUPPORTED' — emulator or unsigned build
    // 'INTEGRITY_ERROR' — network or Play Services unavailable
    console.error('Attestation failed:', e);
  }
};
```

## Platform behavior

**Android** — Uses [Play Integrity API](https://developer.android.com/google/play/integrity). The token encodes:
- `appIntegrity` — certificate match and install source
- `deviceIntegrity` — hardware attestation level
- `accountDetails` — licensed via Play Store

Verify server-side with `https://playintegrity.googleapis.com`.

**iOS** — Uses [DeviceCheck](https://developer.apple.com/documentation/devicecheck). The token is a base64-encoded device attestation verifiable via Apple's DeviceCheck servers.

## Nonce requirements

- Generated server-side (never client-side)
- Single-use — reusing nonces defeats replay protection
- Minimum 16 bytes, base64-encoded
- Short-lived (expire after a few minutes)

## Use cases

- **Prevent API abuse** — only honor requests from genuine, unmodified installs
- **Anti-bot for login flows** — rate-limit or block attestation failures
- **High-value transactions** — require a fresh token before wire transfers or crypto withdrawals
- **License enforcement** — confirm the app was installed from the official store, not sideloaded
