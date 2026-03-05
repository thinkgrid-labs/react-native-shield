# react-native-shield — React Native Security Suite

**The All-in-One Security Suite for React Native.**

[![npm version](https://badge.fury.io/js/%40think-grid-labs%2Freact-native-shield.svg)](https://badge.fury.io/js/%40think-grid-labs%2Freact-native-shield)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`react-native-shield` provides a unified, easy-to-use API for essential mobile security features. Instead of managing multiple fragmented libraries for SSL pinning, root detection, secure storage, and UI privacy, you get a single TurboModule package that "just works" on both Android and iOS.

## Features

- **✅ Device Integrity** — Detect if a device is **Rooted** (Android) or **Jailbroken** (iOS), with detailed reason codes.
- **🕵️ Anti-Tampering** — Detect **Emulator/Simulator**, attached **Debugger**, hooking frameworks (Frida/Xposed), and developer mode.
- **🔐 Platform Attestation** — Request a cryptographically signed **integrity token** from Google (Play Integrity API) or Apple (DeviceCheck) for server-side verification.
- **🔒 SSL Pinning** — Secure your network requests against Man-in-the-Middle (MitM) attacks by pinning your server's public key hash.
- **🔑 Secure Storage** — Store sensitive tokens in the device's secure hardware (Keychain on iOS, EncryptedSharedPreferences on Android), with full key enumeration and bulk wipe.
- **🤝 Biometric Authentication** — Native biometric prompt (Face ID / Touch ID / Android Biometrics) with strength-level awareness.
- **👁️ UI Privacy** — Prevent screenshots and screen recording. Automatically blur app content when backgrounded.
- **⚡ TurboModule API** — Built on the New Architecture (TurboModules) for synchronous access and optimal performance.

---

## Installation

```sh
npm install @think-grid-labs/react-native-shield
# or
yarn add @think-grid-labs/react-native-shield
# or
pnpm add @think-grid-labs/react-native-shield
```

### iOS Setup

The iOS implementation relies on TrustKit for SSL pinning and links DeviceCheck for attestation. Install CocoaPods dependencies:

```sh
cd ios && pod install
```

### Android Setup

No extra steps needed. Play Integrity (`com.google.android.play:integrity`) is bundled automatically.

---

## Modules & Usage

```typescript
import {
  isRooted,
  isEmulator,
  isDebuggerAttached,
  verifySignature,
  isHooked,
  isDeveloperModeEnabled,
  isVPNDetected,
  getRootReasons,
  protectClipboard,
  authenticateWithBiometrics,
  getBiometricStrength,
  addSSLPinning,
  updateSSLPins,
  preventScreenshot,
  setSecureString,
  getSecureString,
  removeSecureString,
  getAllSecureKeys,
  clearAllSecureStorage,
  requestIntegrityToken,
} from '@think-grid-labs/react-native-shield';
```

---

### 1. Device Integrity & Anti-Tampering

Check if the device environment is safe. All checks are synchronous TurboModule calls for immediate, blocking results — safe to use before any sensitive operation.

```typescript
const checkIntegrity = () => {
  if (isRooted()) {
    console.warn('Security Alert: Device is rooted or jailbroken.');
    // Block sensitive actions, wipe session tokens, or alert the user.
  }

  if (isEmulator()) {
    console.warn('Security Alert: App is running in an emulator.');
    // Reject automated testing environments in production builds.
  }

  if (isDebuggerAttached()) {
    console.warn('Security Alert: Debugger attached.');
    // Halt execution to prevent runtime inspection of secrets.
  }

  if (isDeveloperModeEnabled()) {
    console.warn('Security Alert: ADB/Developer Mode is enabled (Android).');
  }

  if (isHooked()) {
    console.warn('Security Alert: Injection framework detected (Frida/Xposed).');
    // Terminate the session — the runtime may be instrumented.
  }

  if (!verifySignature('YOUR_EXPECTED_SHA256_HASH')) {
    console.warn('Security Alert: App signature mismatch — possible repackaging.');
    // The APK may have been modified and redistributed. Refuse to run.
  }
};
```

#### Root / Jailbreak Reason Codes

Instead of a plain boolean, get a list of **why** the device is flagged — useful for risk scoring, logging, or tuning sensitivity per environment.

```typescript
const reasons = getRootReasons();
// Android example: ['su_binary', 'dangerous_packages']
// iOS example:     ['jailbreak_files', 'sandbox_escape']

if (reasons.length > 0) {
  // Send reasons to your security analytics backend
  reportThreat({ reasons, platform: Platform.OS });
}
```

**Possible reason codes:**

| Code | Platform | Meaning |
|---|---|---|
| `build_tags` | Android | `Build.TAGS` contains `test-keys` |
| `su_binary` | Android | `su` binary found in common paths |
| `su_command` | Android | `which su` command succeeded |
| `dangerous_packages` | Android | Known root manager apps installed (Magisk, SuperSU, etc.) |
| `mount_flags` | Android | `/system` partition mounted read-write |
| `jailbreak_files` | iOS | Cydia, Sileo, Zebra, MobileSubstrate, bash, sshd found |
| `sandbox_escape` | iOS | Write outside sandbox succeeded |
| `cydia_scheme` | iOS | `cydia://` URL scheme is openable |
| `substrate_loaded` | iOS | MobileSubstrate/Substrate dylib loaded into the process |

**Use cases:**
- **Banking / fintech apps** — block transactions when `su_binary` or `sandbox_escape` is present.
- **DRM-protected content** — deny playback on devices with `dangerous_packages`.
- **Risk-adaptive UX** — show a security warning without fully blocking when only `build_tags` is set (mild signal).

---

**Implementation Details:**

| Check | Android | iOS |
|---|---|---|
| Root | `Build.TAGS`, su binary scan, `which su`, known root package names, `/proc/mounts` flags | Jailbreak files, sandbox write test, Cydia URL scheme, dyld substrate scan |
| Emulator | `Build.FINGERPRINT/MODEL/HARDWARE/PRODUCT` patterns | `TARGET_OS_SIMULATOR` compile-time macro |
| Debugger | `android.os.Debug.isDebuggerConnected()` | `sysctl` `P_TRACED` flag |
| Signature | SHA-256 of `PackageManager` signing certs | Presence of `embedded.mobileprovision` |
| Hooking | ClassLoader probe (Xposed/Substrate), frida-server file | `dyld` image name scan (Frida, Substrate, cycript, SSLKillSwitch) |
| Dev mode | `Settings.Global.DEVELOPMENT_SETTINGS_ENABLED`, `ADB_ENABLED` | Not supported (always `false`) |

---

### 2. Platform Attestation

Request a **cryptographically signed integrity token** from Google or Apple that your server can verify. This is the only mechanism that provides hardware-backed, unforgeable proof of device and app integrity — something no local detection heuristic can match.

```typescript
// Call from your login or session-start flow.
// The nonce must be generated server-side (unique, unpredictable).
const verifyDeviceWithServer = async () => {
  try {
    const nonce = await fetchNonceFromServer(); // your API
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

**Platform behavior:**
- **Android** — Uses [Play Integrity API](https://developer.android.com/google/play/integrity). The returned token encodes: `appIntegrity` (cert match + install source), `deviceIntegrity` (hardware attestation), and `accountDetails` (licensed via Play). Verify server-side with `https://playintegrity.googleapis.com`.
- **iOS** — Uses [DeviceCheck](https://developer.apple.com/documentation/devicecheck). The returned token is a base64-encoded device attestation verifiable via Apple's DeviceCheck servers.

**Use cases:**
- **Prevent API abuse** — only honor requests from genuine, unmodified app installs.
- **Anti-bot for login flows** — rate-limit or block attestation failures.
- **High-value transactions** — require a fresh attestation token before wire transfers or crypto withdrawals.
- **License enforcement** — confirm the app was installed from the official store, not sideloaded.

> **Note:** The nonce should be a server-generated, single-use random value (minimum 16 bytes, base64-encoded). Reusing nonces defeats replay protection.

---

### 3. App Environment Security

```typescript
const protectAppEnvironment = () => {
  if (isVPNDetected()) {
    console.warn('Network path is routed through a VPN or proxy.');
    // Optionally warn users that certificate pinning may behave differently,
    // or block access to sensitive features in high-security contexts.
  }

  // Auto-clear clipboard whenever the app backgrounds
  protectClipboard(true);
};
```

**Use cases:**
- **Compliance apps** — some regulated environments prohibit VPN usage on managed devices.
- **Clipboard protection** — prevent a copied password or OTP from persisting after the user leaves the app (banking, password managers).

---

### 4. Biometric Authentication

#### Authenticate the user

```typescript
const loginWithBiometrics = async () => {
  const success = await authenticateWithBiometrics('Authenticate to continue');
  if (success) {
    // Unlock secure vault, proceed to dashboard, etc.
  } else {
    // User cancelled or biometric not matched — show fallback UI
  }
};
```

#### Check biometric strength before gating features

Different biometric sensors have very different security properties. Face Unlock on Android is classified as "weak" (2D camera, spoofable with a photo). Face ID on iOS and fingerprint readers are "strong" (secure enclave, spoof-resistant hardware).

```typescript
const enforceStrongBiometrics = async () => {
  const strength = await getBiometricStrength();
  // Returns: "strong" | "weak" | "none"

  if (strength === 'strong') {
    // Unlock cryptographic keys, allow high-value operations
  } else if (strength === 'weak') {
    // Allow login but require step-up auth for sensitive actions
    console.warn('Biometric strength is weak — consider requiring a PIN for payments.');
  } else {
    // No biometrics enrolled — fall back to password/PIN
  }
};
```

**Use cases:**
- **Tiered access control** — only allow `"strong"` biometrics to authorize payments or PII access; `"weak"` for general app unlock.
- **FIDO2 / passkey flows** — gate passkey creation on `"strong"` hardware.
- **Adaptive security UI** — surface a warning banner if only weak biometrics are available.

---

### 5. SSL / Certificate Pinning

Prevent MitM attacks by verifying that your server's certificate public key matches your predefined pins.

```typescript
// Call EARLY in your app lifecycle (e.g., App.tsx root useEffect or index.js).
useEffect(() => {
  const configurePinning = async () => {
    try {
      await addSSLPinning('api.yourdomain.com', [
        'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Primary pin
        'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB='  // Backup pin
      ]);
    } catch (e) {
      console.error('SSL pinning failed:', e);
    }
  };
  configurePinning();
}, []);
```

**Rotating pins (Android only):**

On Android, OkHttp allows the client factory to be replaced at runtime, so `updateSSLPins` takes effect immediately. On iOS, TrustKit locks its configuration at startup — `updateSSLPins` will **reject** with `SSL_PIN_UPDATE_UNSUPPORTED`. To rotate iOS pins, update `addSSLPinning` arguments and ship an app update (or restart).

```typescript
// Android: works at runtime
// iOS: throws SSL_PIN_UPDATE_UNSUPPORTED — catch it!
try {
  await updateSSLPins('api.yourdomain.com', [
    'sha256/CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC='
  ]);
} catch (e: any) {
  if (e.code === 'SSL_PIN_UPDATE_UNSUPPORTED') {
    // Expected on iOS — handled. New pins take effect after next app launch.
  }
}
```

**How to extract your pin hash:**

```sh
openssl s_client -servername api.yourdomain.com -connect api.yourdomain.com:443 \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

**Use cases:**
- **Fintech / healthcare** — mandatory in PCI-DSS and HIPAA environments to prevent intercepted API calls.
- **Auth token endpoints** — pin only your `/token` and `/refresh` endpoints to limit blast radius.
- **Always provide a backup pin** — a single pin + certificate expiry = production outage. Always include at least one backup.

---

### 6. Secure Storage

Store secrets (tokens, API keys, encryption keys) in the device's hardware-backed secure enclave.

```typescript
// Save
await setSecureString('access_token', 'eyJhbGci...');

// Read
const token = await getSecureString('access_token'); // string | null

// Delete one key
await removeSecureString('access_token');
```

#### Enumerate and audit stored keys

```typescript
const keys = await getAllSecureKeys();
// e.g. ['access_token', 'refresh_token', 'user_id']

// Useful for: migration scripts, key rotation, debugging storage state
console.log('Stored keys:', keys);
```

#### Bulk wipe on logout or account deletion

```typescript
const handleLogout = async () => {
  await clearAllSecureStorage();
  // All keys under this app's bundle ID are gone.
  // Safe to call even if storage is already empty.
};
```

**Implementation Details:**
- **Android** — `EncryptedSharedPreferences` with AES256-GCM, backed by Android Keystore master key.
- **iOS** — Keychain Services (`SecItemAdd` / `SecItemCopyMatching`) scoped to the app's bundle ID.

**Use cases:**
- `setSecureString` / `getSecureString` — persist OAuth tokens, refresh tokens, or biometric-bound keys.
- `getAllSecureKeys` — audit what's in storage before a migration; compare against an expected key manifest.
- `clearAllSecureStorage` — GDPR "right to erasure" flows, account deletion, forced logout on session invalidation.

---

### 7. UI Privacy

Prevent sensitive UI from being captured in screenshots, screen recordings, or the OS app switcher preview.

```typescript
// Enable — call once at app startup or when entering a sensitive screen
await preventScreenshot(true);

// Disable — call when leaving the sensitive context
await preventScreenshot(false);
```

**Use cases:**
- **Banking / wallet apps** — enable on balance screens, transaction history, and transfer confirmations.
- **Password managers** — enable globally; users won't be able to screenshot their vault.
- **Healthcare** — prevent patient data from appearing in OS recent-apps thumbnails.
- **Chat apps with disappearing messages** — enable on message screens to block screen recording.

**Platform Behavior:**

| | Android | iOS |
|---|---|---|
| Screenshot | Blocked via `FLAG_SECURE` | Not blockable (OS limitation) |
| Screen recording | Blocked via `FLAG_SECURE` | Content masked via `UITextField.secureTextEntry` layer hack |
| App switcher preview | Replaced with blank screen | Blur overlay injected on `WillResignActive` |

> ⚠️ **iOS limitation:** Hardware screenshots (Home + Power) cannot be blocked by any third-party app on iOS. `preventScreenshot` primarily protects against screen recording, AirPlay mirroring, and the app switcher preview.

---

## API Reference

### Device Integrity

| Method | Returns | Description |
|---|---|---|
| `isRooted()` | `boolean` | `true` if device is rooted (Android) or jailbroken (iOS) |
| `isEmulator()` | `boolean` | `true` if running in a simulator or emulator |
| `isDebuggerAttached()` | `boolean` | `true` if a debugger is attached to the process |
| `isDeveloperModeEnabled()` | `boolean` | `true` if ADB/developer options are active (Android only) |
| `isHooked()` | `boolean` | `true` if Frida, Xposed, Substrate, or similar is detected |
| `verifySignature(hash)` | `boolean` | `true` if the app's signing cert matches the expected hash |
| `getRootReasons()` | `string[]` | Array of reason codes explaining why the device is flagged |

### Network & Environment

| Method | Returns | Description |
|---|---|---|
| `isVPNDetected()` | `boolean` | `true` if traffic is routed through a VPN interface |
| `protectClipboard(protect)` | `Promise<void>` | Toggle auto-clear clipboard on app background |

### Platform Attestation

| Method | Returns | Description |
|---|---|---|
| `requestIntegrityToken(nonce)` | `Promise<string>` | Play Integrity token (Android) or DeviceCheck token (iOS) for server-side verification |

### Biometrics

| Method | Returns | Description |
|---|---|---|
| `authenticateWithBiometrics(prompt)` | `Promise<boolean>` | Launches native biometric prompt; resolves `true` on success |
| `getBiometricStrength()` | `Promise<string>` | `"strong"`, `"weak"`, or `"none"` based on enrolled biometric hardware |

### SSL Pinning

| Method | Returns | Description |
|---|---|---|
| `addSSLPinning(domain, hashes)` | `Promise<void>` | Enable certificate pinning for a domain |
| `updateSSLPins(domain, hashes)` | `Promise<void>` | Update pins at runtime (Android only; rejects with `SSL_PIN_UPDATE_UNSUPPORTED` on iOS) |

### Secure Storage

| Method | Returns | Description |
|---|---|---|
| `setSecureString(key, value)` | `Promise<boolean>` | Encrypt and store a string |
| `getSecureString(key)` | `Promise<string \| null>` | Decrypt and retrieve a stored string |
| `removeSecureString(key)` | `Promise<boolean>` | Delete a single key from secure storage |
| `getAllSecureKeys()` | `Promise<string[]>` | List all keys currently in secure storage |
| `clearAllSecureStorage()` | `Promise<boolean>` | Delete all keys from secure storage |

### UI Privacy

| Method | Returns | Description |
|---|---|---|
| `preventScreenshot(prevent)` | `Promise<void>` | Toggle screenshot/recording prevention and background blur |

---

## Security Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   react-native-shield                   │
├───────────────┬──────────────────┬──────────────────────┤
│ Device Check  │  Network Layer   │    Data Layer        │
│               │                  │                      │
│ isRooted()    │ addSSLPinning()  │ setSecureString()    │
│ isEmulator()  │ updateSSLPins()  │ getSecureString()    │
│ isHooked()    │ isVPNDetected()  │ removeSecureString() │
│ getRootReasons│                  │ getAllSecureKeys()    │
│               │  Attestation     │ clearAllSecureStorage│
│ isDebugger    │                  │                      │
│ Attached()    │ requestIntegrity │    UI Layer          │
│ verifySigna-  │ Token()          │                      │
│ ture()        │                  │ preventScreenshot()  │
│               │  Biometrics      │ protectClipboard()   │
│               │                  │                      │
│               │ authenticateWith │                      │
│               │ Biometrics()     │                      │
│               │ getBiometric     │                      │
│               │ Strength()       │                      │
└───────────────┴──────────────────┴──────────────────────┘
         ↓                  ↓                   ↓
    Android/iOS        OkHttp /           Keystore /
    System APIs        TrustKit           Keychain
                    Play Integrity /
                      DeviceCheck
```

---

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
