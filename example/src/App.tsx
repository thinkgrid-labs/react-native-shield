import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  isRooted,
  isEmulator,
  isDebuggerAttached,
  isDeveloperModeEnabled,
  isHooked,
  isVPNDetected,
  getRootReasons,
  authenticateWithBiometrics,
  getBiometricStrength,
  addSSLPinning,
  preventScreenshot,
  protectClipboard,
  setSecureString,
  getSecureString,
  removeSecureString,
  getAllSecureKeys,
  clearAllSecureStorage,
  requestIntegrityToken,
} from '@think-grid-labs/react-native-shield';

type ResultMap = Record<string, string>;

export default function App() {
  const [results, setResults] = React.useState<ResultMap>({});

  const set = (key: string, value: string) =>
    setResults((prev) => ({ ...prev, [key]: value }));

  // ─── Device Integrity ──────────────────────────────────────────────────────

  const runIntegrityChecks = () => {
    set('rooted', isRooted() ? '🚨 YES' : '✅ NO');
    set('emulator', isEmulator() ? '🚨 YES' : '✅ NO');
    set('debugger', isDebuggerAttached() ? '🚨 YES' : '✅ NO');
    set('devMode', isDeveloperModeEnabled() ? '🚨 YES' : '✅ NO');
    set('hooked', isHooked() ? '🚨 YES' : '✅ NO');
    set('vpn', isVPNDetected() ? '⚠️ YES' : '✅ NO');

    const reasons = getRootReasons();
    set(
      'rootReasons',
      reasons.length > 0 ? `🚨 ${reasons.join(', ')}` : '✅ None'
    );
  };

  // ─── Platform Attestation ──────────────────────────────────────────────────

  const runAttestation = async () => {
    set('attestation', '⏳ Requesting...');
    try {
      // In production: fetch this nonce from your server
      const nonce = `nonce-${Date.now()}`;
      const token = await requestIntegrityToken(nonce);
      set('attestation', `✅ Token (${token.slice(0, 20)}...)`);
    } catch (e: any) {
      set('attestation', `⚠️ ${e?.message ?? 'Unsupported'}`);
    }
  };

  // ─── Biometrics ────────────────────────────────────────────────────────────

  const runBiometrics = async () => {
    set('biometricStrength', '⏳ Checking...');
    const strength = await getBiometricStrength();
    set('biometricStrength', `Strength: ${strength}`);

    set('biometricAuth', '⏳ Authenticating...');
    const success = await authenticateWithBiometrics(
      'Authenticate to test Shield'
    );
    set(
      'biometricAuth',
      success ? '✅ Authenticated' : '❌ Failed / Cancelled'
    );
  };

  // ─── SSL Pinning ───────────────────────────────────────────────────────────

  const runSSLPinning = async () => {
    set('sslPinning', '⏳ Configuring...');
    try {
      await addSSLPinning('httpbin.org', [
        'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // placeholder
      ]);
      set('sslPinning', '✅ Pinning active for httpbin.org');
    } catch (e: any) {
      set('sslPinning', `❌ ${e?.message}`);
    }
  };

  // ─── UI Privacy ────────────────────────────────────────────────────────────

  const toggleScreenshot = async () => {
    const current = results.screenshot;
    const enable = current !== '🔒 Protected';
    await preventScreenshot(enable);
    set('screenshot', enable ? '🔒 Protected' : '🔓 Unprotected');
  };

  const toggleClipboard = async () => {
    const current = results.clipboard;
    const enable = current !== '🔒 Protected';
    await protectClipboard(enable);
    set('clipboard', enable ? '🔒 Protected' : '🔓 Unprotected');
  };

  // ─── Secure Storage ────────────────────────────────────────────────────────

  const runStorage = async () => {
    set('storage', '⏳ Running...');
    try {
      await setSecureString('access_token', 'secret_abc123');
      await setSecureString('refresh_token', 'refresh_xyz789');

      const token = await getSecureString('access_token');
      const keys = await getAllSecureKeys();

      await removeSecureString('refresh_token');
      const keysAfter = await getAllSecureKeys();

      set(
        'storage',
        `✅ Stored → Retrieved: "${token}" | Keys: [${keys.join(
          ', '
        )}] → after delete: [${keysAfter.join(', ')}]`
      );
    } catch (e: any) {
      set('storage', `❌ ${e?.message}`);
    }
  };

  const runClearStorage = async () => {
    set('clearStorage', '⏳ Clearing...');
    try {
      await clearAllSecureStorage();
      const keys = await getAllSecureKeys();
      set('clearStorage', `✅ Cleared — Keys remaining: ${keys.length}`);
    } catch (e: any) {
      set('clearStorage', `❌ ${e?.message}`);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>react-native-shield demo</Text>
      <Text style={styles.platform}>Platform: {Platform.OS}</Text>

      <Section title="Device Integrity">
        <Button label="Run all checks" onPress={runIntegrityChecks} />
        <Result label="Rooted / Jailbroken" value={results.rooted} />
        <Result label="Emulator" value={results.emulator} />
        <Result label="Debugger attached" value={results.debugger} />
        <Result label="Developer mode" value={results.devMode} />
        <Result label="Hooked (Frida/Xposed)" value={results.hooked} />
        <Result label="VPN detected" value={results.vpn} />
        <Result label="Root reason codes" value={results.rootReasons} />
      </Section>

      <Section title="Platform Attestation">
        <Button label="Request integrity token" onPress={runAttestation} />
        <Result label="Token" value={results.attestation} />
      </Section>

      <Section title="Biometrics">
        <Button label="Check strength + authenticate" onPress={runBiometrics} />
        <Result label="Biometric strength" value={results.biometricStrength} />
        <Result label="Auth result" value={results.biometricAuth} />
      </Section>

      <Section title="SSL Pinning">
        <Button
          label="Enable pinning for httpbin.org"
          onPress={runSSLPinning}
        />
        <Result label="Status" value={results.sslPinning} />
      </Section>

      <Section title="UI Privacy">
        <Button
          label="Toggle screenshot prevention"
          onPress={toggleScreenshot}
        />
        <Result
          label="Screenshot"
          value={results.screenshot ?? '🔓 Unprotected'}
        />
        <Button label="Toggle clipboard protection" onPress={toggleClipboard} />
        <Result
          label="Clipboard"
          value={results.clipboard ?? '🔓 Unprotected'}
        />
      </Section>

      <Section title="Secure Storage">
        <Button label="Store, retrieve, delete keys" onPress={runStorage} />
        <Result label="Result" value={results.storage} />
        <Button label="Clear all storage" onPress={runClearStorage} />
        <Result label="Clear result" value={results.clearStorage} />
      </Section>
    </ScrollView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function Result({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.result}>
      <Text style={styles.resultLabel}>{label}:</Text>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0f0f0f',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  platform: {
    fontSize: 13,
    color: '#888',
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a78bfa',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  result: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
    gap: 4,
  },
  resultLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 12,
    color: '#e5e7eb',
    flexShrink: 1,
  },
});
