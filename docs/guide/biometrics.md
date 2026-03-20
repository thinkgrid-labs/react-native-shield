# Biometric Authentication

Native biometric prompt (Face ID / Touch ID / Android Biometrics) with strength-level awareness.

## Authenticate the user

```typescript
import { authenticateWithBiometrics } from '@thinkgrid/react-native-shield';

const loginWithBiometrics = async () => {
  const success = await authenticateWithBiometrics('Authenticate to continue');
  if (success) {
    // Unlock secure vault, proceed to dashboard
  } else {
    // User cancelled or biometric not matched — show fallback UI
  }
};
```

## Check biometric strength

Different sensors have very different security properties. Face Unlock on Android is classified as "weak" (2D camera, spoofable with a photo). Face ID and fingerprint readers are "strong" (secure enclave, spoof-resistant hardware).

```typescript
import { getBiometricStrength } from '@thinkgrid/react-native-shield';

const enforceStrongBiometrics = async () => {
  const strength = await getBiometricStrength();
  // Returns: "strong" | "weak" | "none"

  if (strength === 'strong') {
    // Allow high-value operations: payments, PII access, crypto keys
  } else if (strength === 'weak') {
    // Allow app unlock but require step-up auth for sensitive actions
  } else {
    // No biometrics enrolled — fall back to password/PIN
  }
};
```

## Use cases

- **Tiered access control** — only `"strong"` biometrics authorize payments; `"weak"` for general unlock
- **FIDO2 / passkey flows** — gate passkey creation on `"strong"` hardware
- **Adaptive security UI** — surface a warning banner when only weak biometrics are available
