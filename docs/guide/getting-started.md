# Getting Started

`react-native-shield` is a unified TurboModule package providing essential mobile security features for React Native apps on iOS and Android.

## Requirements

- React Native 0.73+ (New Architecture / TurboModules)
- iOS 14+
- Android API 24+

## Installation

```sh
npm install @thinkgrid/react-native-shield
# or
yarn add @thinkgrid/react-native-shield
# or
pnpm add @thinkgrid/react-native-shield
```

### iOS Setup

```sh
cd ios && pod install
```

TrustKit (SSL pinning) and DeviceCheck (attestation) are linked automatically via CocoaPods.

### Android Setup

No extra steps needed. `com.google.android.play:integrity` is bundled automatically.

## Quick reference

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
} from '@thinkgrid/react-native-shield';
```

## Recommended startup check

Run security checks early — before rendering any sensitive UI or making authenticated network requests:

```typescript
import { isRooted, isEmulator, isHooked, isDebuggerAttached } from '@thinkgrid/react-native-shield';

const runSecurityGate = () => {
  if (isRooted() || isEmulator() || isHooked() || isDebuggerAttached()) {
    // Block sensitive operations or terminate the session
    return false;
  }
  return true;
};
```

## What's included

| Module | Guide |
|---|---|
| Device Integrity & Anti-Tampering | [Guide](/guide/device-integrity) |
| Platform Attestation | [Guide](/guide/attestation) |
| SSL / Certificate Pinning | [Guide](/guide/ssl-pinning) |
| Biometric Authentication | [Guide](/guide/biometrics) |
| Secure Storage | [Guide](/guide/secure-storage) |
| UI Privacy | [Guide](/guide/ui-privacy) |
| App Environment (VPN, Clipboard) | [Guide](/guide/app-environment) |
