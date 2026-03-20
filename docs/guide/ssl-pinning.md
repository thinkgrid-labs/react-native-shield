# SSL / Certificate Pinning

Prevent Man-in-the-Middle (MitM) attacks by verifying your server's certificate public key hash matches a predefined pin.

## Setup

Call `addSSLPinning` **early in your app lifecycle** — before any network requests are made.

```typescript
import { addSSLPinning } from '@thinkgrid/react-native-shield';

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

> Always provide at least one **backup pin**. A single pin + certificate expiry = production outage.

## Extracting your pin hash

```sh
openssl s_client -servername api.yourdomain.com -connect api.yourdomain.com:443 \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

## Rotating pins

```typescript
import { updateSSLPins } from '@thinkgrid/react-native-shield';

// Android: takes effect immediately at runtime
// iOS: throws SSL_PIN_UPDATE_UNSUPPORTED — new pins apply after next app launch
try {
  await updateSSLPins('api.yourdomain.com', [
    'sha256/CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC='
  ]);
} catch (e: any) {
  if (e.code === 'SSL_PIN_UPDATE_UNSUPPORTED') {
    // Expected on iOS — ship an app update to rotate pins
  }
}
```

### Platform differences

| | Android | iOS |
|---|---|---|
| Implementation | OkHttp `CertificatePinner` | TrustKit |
| Runtime pin update | Supported | Not supported — app update required |

## Use cases

- **Fintech / healthcare** — mandatory in PCI-DSS and HIPAA environments
- **Auth token endpoints** — pin only `/token` and `/refresh` to limit blast radius
- **Always provide a backup pin** — include at least one pin for your upcoming certificate
