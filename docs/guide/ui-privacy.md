# UI Privacy

Prevent sensitive UI from being captured in screenshots, screen recordings, or the OS app switcher preview.

## Usage

```typescript
import { preventScreenshot } from '@thinkgrid/react-native-shield';

// Enable — call when entering a sensitive screen
await preventScreenshot(true);

// Disable — call when leaving the sensitive context
await preventScreenshot(false);
```

## Platform behavior

| | Android | iOS |
|---|---|---|
| Screenshot | Blocked via `FLAG_SECURE` | Not blockable (OS limitation) |
| Screen recording | Blocked via `FLAG_SECURE` | Content masked via `UITextField.secureTextEntry` layer |
| App switcher preview | Replaced with blank screen | Blur overlay on `WillResignActive` |

> **iOS limitation:** Hardware screenshots (Home + Power) cannot be blocked by any third-party app. `preventScreenshot` protects against screen recording, AirPlay mirroring, and the app switcher preview.

## Use cases

- **Banking / wallet apps** — enable on balance screens and transfer confirmations
- **Password managers** — enable globally; users cannot screenshot their vault
- **Healthcare** — prevent patient data from appearing in OS recent-apps thumbnails
- **Chat apps** — enable on message screens to block screen recording
