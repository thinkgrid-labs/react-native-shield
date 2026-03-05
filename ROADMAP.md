# Roadmap

This document tracks planned features, enhancements, and known limitations for future releases of `react-native-shield`.

---

## v0.3.0 — Expo Support

**Goal:** Make the library usable in Expo managed workflow without manual native project edits.

- [ ] Create `app.plugin.js` Expo config plugin
  - Android: inject `com.google.android.play:integrity` into `build.gradle`
  - Android: add `QUERY_ALL_PACKAGES` permission to `AndroidManifest.xml` (required for `getRootReasons` dangerous package check on API 30+)
  - iOS: link `DeviceCheck.framework` in Xcode project
  - iOS: add `TrustKit` to the generated Podfile
- [ ] Register plugin entry point in `package.json` (`"expo": { "plugin": "./app.plugin.js" }`)
- [ ] Add `@expo/config-plugins` as a peer/optional dependency
- [ ] Test with `expo prebuild` on both platforms
- [ ] Update README with Expo installation section

> **Note:** Expo Go will never be supported — native TurboModules require a custom dev build or bare workflow.

---

## v0.4.0 — RASP Event Emitter

**Goal:** Allow apps to react to security threats in real time without polling all checks manually.

- [ ] Add a `ShieldEventEmitter` that extends `RCTEventEmitter` (iOS) / `ReactContextBaseJavaModule` (Android)
- [ ] Emit `shield:threat_detected` events with payload `{ type: string, reason: string, platform: string }`
- [ ] Background monitoring loop: periodic re-check of root, debugger, hooking state (configurable interval)
- [ ] JS-side `useShieldMonitor()` React hook that subscribes and returns the latest threat event
- [ ] Configurable threat types to monitor (opt-in per check)

---

## v0.5.0 — `<SecureView>` Component

**Goal:** Component-level screenshot protection rather than a global window flag.

- [ ] React Native `<SecureView>` component that wraps any child subtree
- [ ] Android: render children inside a `SurfaceView` with `setSecure(true)` — only that region is protected
- [ ] iOS: apply the `UITextField` secureTextEntry layer trick scoped to the view's layer
- [ ] Useful for: banking PIN pads, PII fields, crypto seed phrase display, OTP screens

---

## v0.6.0 — Biometric-Bound Key Encryption

**Goal:** Tie decryption of a stored value to a successful biometric authentication event at the OS level, not just the JS level.

- [ ] `setBiometricString(key, value)` — stores value encrypted with a key that requires biometric unlock
- [ ] `getBiometricString(key, promptMessage)` — triggers biometric prompt, decrypts only on success
  - Android: `BiometricPrompt.CryptoObject` with `KeyStore` key using `setUserAuthenticationRequired(true)`
  - iOS: Keychain item with `kSecAccessControlBiometryAny` access control flag
- [ ] Survives app restart — the biometric binding is hardware-level, not session-level
- [ ] Falls back to an explicit rejection (not a PIN fallback) when biometrics are unavailable

---

## v0.7.0 — HTTP Proxy Detection

**Goal:** Detect manually configured HTTP proxies in addition to VPN interfaces (current `isVPNDetected` only checks VPN transport layer).

- [ ] Android: read `System.getProperty("http.proxyHost")` and `ProxySelector` for active proxies
- [ ] iOS: read `CFNetworkCopySystemProxySettings()` for `HTTPProxy` / `HTTPSProxy` keys
- [ ] New API: `isProxyDetected(): boolean`
- [ ] Update `isVPNDetected` docs to clarify it does not cover manual proxies

---

## v0.8.0 — Accessibility Service Detection (Android)

**Goal:** Detect overlay-capable accessibility services, which are a common vector for tapjacking and credential-harvesting attacks.

- [ ] New API: `getActiveAccessibilityServices(): Promise<string[]>` — returns package names of enabled services
- [ ] New API: `hasOverlayCapableService(): boolean` — quick boolean for "is anything dangerous active"
- [ ] Uses `AccessibilityManager.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)`
- [ ] iOS: Not applicable (returns empty array)

---

## v0.9.0 — Jailbreak / Root Confidence Score

**Goal:** Replace/augment the binary `isRooted()` boolean with a numeric risk score for risk-adaptive security policies.

- [ ] New API: `getRootConfidenceScore(): number` — returns `0.0` to `1.0`
- [ ] Score is a weighted sum of individual signals (e.g. `su_binary` = 0.9, `build_tags` = 0.3, `mount_flags` = 0.7)
- [ ] Weights configurable via an optional `ShieldConfig` object passed at init
- [ ] Enables soft blocking (warn user) vs hard blocking (terminate session) based on threshold

---

## v1.0.0 — Stable API + `ShieldConfig` Init

**Goal:** Lock the public API surface, introduce a configuration object, and add a comprehensive integration test suite.

- [ ] `ShieldConfig` init object:
  - `rootConfidenceThreshold: number` — threshold above which `isRooted()` returns `true`
  - `monitorInterval: number` — ms between background RASP checks
  - `enabledMonitors: string[]` — opt-in list of checks to run in background
- [ ] `Shield.configure(config)` call (must be called before any other API)
- [ ] Stable, semver-committed public API (no breaking changes after 1.0)
- [ ] Integration test suite runnable against physical rooted/jailbroken devices
- [ ] Complete Expo support validated

---

## Backlog / Under Consideration

These are not yet scheduled but are under consideration based on user needs and security landscape changes.

| Feature | Notes |
|---|---|
| **Reverse engineering tool detection** | Detect jadx/apktool artifacts, active ADB reverse port forwards |
| **Certificate Transparency enforcement** | Complement SSL pinning by requiring CT log inclusion |
| **App Attest (iOS)** | Full Apple App Attest flow (key generation + attestation + assertion) as an alternative to DeviceCheck for stronger per-device binding |
| **Screen capture detection callback** | `onScreenshotTaken` event — notify without blocking (Android `ContentObserver`, iOS `UIApplicationUserDidTakeScreenshotNotification`) |
| **Secure keyboard detection (iOS)** | Detect if a third-party keyboard extension is active (potential keylogger) |
| **Play Integrity Standard API** | Upgrade from Classic to Standard Integrity API for lower latency responses |
| **Web support (react-native-web)** | Stub implementations that return safe defaults on web platform |

---

## Contributing

Have a feature request or want to work on one of the above? Open an issue or PR at [github.com/ThinkGrid-Labs/react-native-shield](https://github.com/ThinkGrid-Labs/react-native-shield/issues).

Items marked with `[ ]` are open for contribution. Please open an issue first to discuss the approach before submitting a PR.
