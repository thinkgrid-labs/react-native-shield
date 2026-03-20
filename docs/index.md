---
layout: home

hero:
  name: react-native-shield
  text: React Native Security Suite
  tagline: Root detection, SSL pinning, biometric auth, secure storage, and Play Integrity attestation — one TurboModule package for iOS and Android.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/device-integrity
    - theme: alt
      text: View on GitHub
      link: https://github.com/thinkgrid-labs/react-native-shield

features:
  - title: Device Integrity & Anti-Tampering
    details: Detect rooted/jailbroken devices, emulators, attached debuggers, Frida/Xposed hooking frameworks, and signature mismatches — with detailed reason codes.
  - title: Platform Attestation
    details: Request hardware-backed integrity tokens from Google Play Integrity API (Android) and Apple DeviceCheck (iOS) for server-side verification.
  - title: SSL / Certificate Pinning
    details: Pin your server's public key hash via TrustKit (iOS) and OkHttp (Android) to prevent Man-in-the-Middle attacks.
  - title: Biometric Authentication
    details: Native Face ID / Touch ID / Android Biometrics prompt with strength-level awareness — distinguish strong (secure enclave) from weak (2D camera) biometrics.
  - title: Secure Storage
    details: Store tokens and secrets in hardware-backed secure storage — Keychain on iOS, EncryptedSharedPreferences with Android Keystore on Android.
  - title: UI Privacy
    details: Block screenshots and screen recording, blur app content in the OS app switcher, and auto-clear the clipboard on background.
---
