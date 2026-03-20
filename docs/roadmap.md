# Roadmap

Planned features and enhancements for future releases.

## v0.3.0 — Expo Support

Make the library usable in Expo managed workflow without manual native project edits.

- Create `app.plugin.js` Expo config plugin
- Register plugin entry point in `package.json`
- Add `@expo/config-plugins` as a peer/optional dependency
- Test with `expo prebuild` on both platforms

> Expo Go will never be supported — native TurboModules require a custom dev build or bare workflow.

## v0.4.0 — RASP Event Emitter

React to security threats in real time without polling all checks manually.

- `ShieldEventEmitter` emitting `shield:threat_detected` events
- Background monitoring loop with configurable interval
- `useShieldMonitor()` React hook

## v0.5.0 — `<SecureView>` Component

Component-level screenshot protection rather than a global window flag.

- `<SecureView>` wraps any child subtree
- Android: `SurfaceView` with `setSecure(true)` scoped to that region
- iOS: `UITextField` secureTextEntry layer scoped to the view

## v0.6.0 — Biometric-Bound Key Encryption

Tie decryption to a successful biometric event at the OS level, not just JS level.

- `setBiometricString(key, value)` — encrypted with a key requiring biometric unlock
- `getBiometricString(key, prompt)` — triggers biometric prompt, decrypts only on success

## v0.7.0 — HTTP Proxy Detection

Detect manually configured HTTP proxies (current `isVPNDetected` only checks VPN transport layer).

- `isProxyDetected(): boolean`

## v0.8.0 — Accessibility Service Detection (Android)

Detect overlay-capable accessibility services (tapjacking, credential-harvesting vectors).

- `getActiveAccessibilityServices(): Promise<string[]>`
- `hasOverlayCapableService(): boolean`

## v0.9.0 — Root Confidence Score

Replace the binary `isRooted()` boolean with a numeric risk score.

- `getRootConfidenceScore(): number` — returns `0.0` to `1.0`
- Configurable signal weights via `ShieldConfig`

## v1.0.0 — Stable API + `ShieldConfig` Init

Lock the public API surface and introduce a configuration object.

- `Shield.configure(config)` call
- Stable semver-committed public API
- Integration test suite for physical rooted/jailbroken devices

## Backlog

| Feature | Notes |
|---|---|
| Reverse engineering tool detection | Detect jadx/apktool artifacts, active ADB reverse port forwards |
| Certificate Transparency enforcement | Complement SSL pinning by requiring CT log inclusion |
| App Attest (iOS) | Full Apple App Attest flow as a stronger alternative to DeviceCheck |
| Screen capture detection callback | `onScreenshotTaken` event without blocking |
| Secure keyboard detection (iOS) | Detect active third-party keyboard extensions |
| Play Integrity Standard API | Upgrade from Classic to Standard API for lower latency |
| Web support (react-native-web) | Stub implementations returning safe defaults |

---

Have a feature request or want to contribute? Open an issue at [github.com/thinkgrid-labs/react-native-shield](https://github.com/thinkgrid-labs/react-native-shield/issues).
