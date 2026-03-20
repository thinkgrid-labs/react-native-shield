# Device Integrity & Anti-Tampering

All integrity checks are **synchronous TurboModule calls** — safe to use before any sensitive operation without awaiting a promise.

## Basic checks

```typescript
import {
  isRooted,
  isEmulator,
  isDebuggerAttached,
  isDeveloperModeEnabled,
  isHooked,
  verifySignature,
  getRootReasons,
} from '@thinkgrid/react-native-shield';

const checkIntegrity = () => {
  if (isRooted()) {
    // Block sensitive actions or wipe session tokens
  }
  if (isEmulator()) {
    // Reject automated environments in production builds
  }
  if (isDebuggerAttached()) {
    // Halt execution to prevent runtime inspection
  }
  if (isDeveloperModeEnabled()) {
    // ADB/Developer Mode active (Android)
  }
  if (isHooked()) {
    // Frida/Xposed/Substrate detected — runtime may be instrumented
  }
  if (!verifySignature('YOUR_EXPECTED_SHA256_HASH')) {
    // APK may have been modified and redistributed
  }
};
```

## Root / Jailbreak reason codes

Instead of a plain boolean, get a list of **why** the device is flagged — useful for risk scoring, logging, or tuning sensitivity per environment.

```typescript
const reasons = getRootReasons();
// Android: ['su_binary', 'dangerous_packages']
// iOS:     ['jailbreak_files', 'sandbox_escape']

if (reasons.length > 0) {
  reportThreat({ reasons, platform: Platform.OS });
}
```

### Reason code reference

| Code | Platform | Meaning |
|---|---|---|
| `build_tags` | Android | `Build.TAGS` contains `test-keys` |
| `su_binary` | Android | `su` binary found in common paths |
| `su_command` | Android | `which su` command succeeded |
| `dangerous_packages` | Android | Known root manager apps installed (Magisk, SuperSU) |
| `mount_flags` | Android | `/system` mounted read-write |
| `jailbreak_files` | iOS | Cydia, Sileo, Zebra, MobileSubstrate, bash, sshd found |
| `sandbox_escape` | iOS | Write outside sandbox succeeded |
| `cydia_scheme` | iOS | `cydia://` URL scheme is openable |
| `substrate_loaded` | iOS | MobileSubstrate dylib loaded in process |

## Use cases

- **Banking / fintech** — block transactions when `su_binary` or `sandbox_escape` is present
- **DRM-protected content** — deny playback on devices with `dangerous_packages`
- **Risk-adaptive UX** — show a warning without blocking when only `build_tags` is set (mild signal)

## Implementation details

| Check | Android | iOS |
|---|---|---|
| Root | `Build.TAGS`, su binary scan, known root packages, `/proc/mounts` | Jailbreak files, sandbox write test, Cydia URL, dyld substrate scan |
| Emulator | `Build.FINGERPRINT/MODEL/HARDWARE/PRODUCT` patterns | `TARGET_OS_SIMULATOR` compile-time macro |
| Debugger | `android.os.Debug.isDebuggerConnected()` | `sysctl` `P_TRACED` flag |
| Signature | SHA-256 of `PackageManager` signing certs | Presence of `embedded.mobileprovision` |
| Hooking | ClassLoader probe (Xposed/Substrate), frida-server file | `dyld` image scan (Frida, Substrate, cycript, SSLKillSwitch) |
| Dev mode | `Settings.Global.DEVELOPMENT_SETTINGS_ENABLED`, `ADB_ENABLED` | Not supported — always `false` |
