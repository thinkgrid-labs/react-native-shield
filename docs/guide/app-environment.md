# App Environment Security

## VPN detection

```typescript
import { isVPNDetected } from '@thinkgrid/react-native-shield';

if (isVPNDetected()) {
  // Traffic is routed through a VPN or proxy interface
}
```

**Use cases:**
- **Compliance apps** — some regulated environments prohibit VPN usage on managed devices
- **Warning UI** — inform users that certificate pinning may behave differently over a VPN

## Clipboard protection

Auto-clear the clipboard whenever the app goes to the background:

```typescript
import { protectClipboard } from '@thinkgrid/react-native-shield';

// Enable at startup
protectClipboard(true);

// Disable
protectClipboard(false);
```

**Use cases:**
- **Banking / password managers** — prevent a copied OTP or password from persisting after the user leaves the app
- **Healthcare** — prevent patient identifiers from leaking via clipboard
