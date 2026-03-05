import Shield from './NativeShield';

export function isRooted(): boolean {
  return Shield.isRooted();
}

export function isEmulator(): boolean {
  return Shield.isEmulator();
}

export function isDebuggerAttached(): boolean {
  return Shield.isDebuggerAttached();
}

export function verifySignature(expectedHash: string): boolean {
  return Shield.verifySignature(expectedHash);
}

export function isHooked(): boolean {
  return Shield.isHooked();
}

export function isDeveloperModeEnabled(): boolean {
  return Shield.isDeveloperModeEnabled();
}

export function isVPNDetected(): boolean {
  return Shield.isVPNDetected();
}

export function protectClipboard(protect: boolean): Promise<void> {
  return Shield.protectClipboard(protect);
}

export function authenticateWithBiometrics(
  promptMessage: string
): Promise<boolean> {
  return Shield.authenticateWithBiometrics(promptMessage);
}

export function addSSLPinning(
  domain: string,
  publicKeyHashes: string[]
): Promise<void> {
  return Shield.addSSLPinning(domain, publicKeyHashes);
}

export function updateSSLPins(
  domain: string,
  publicKeyHashes: string[]
): Promise<void> {
  return Shield.updateSSLPins(domain, publicKeyHashes);
}

export function preventScreenshot(prevent: boolean): Promise<void> {
  return Shield.preventScreenshot(prevent);
}

export function setSecureString(key: string, value: string): Promise<boolean> {
  return Shield.setSecureString(key, value);
}

export function getSecureString(key: string): Promise<string | null> {
  return Shield.getSecureString(key);
}

export function removeSecureString(key: string): Promise<boolean> {
  return Shield.removeSecureString(key);
}

/**
 * Returns an array of reason strings for why the device is considered rooted
 * or jailbroken (e.g. "su_binary", "build_tags", "jailbreak_files").
 * Returns an empty array if no indicators are found.
 */
export function getRootReasons(): string[] {
  return Shield.getRootReasons();
}

/**
 * Returns all keys currently stored in secure storage.
 */
export function getAllSecureKeys(): Promise<string[]> {
  return Shield.getAllSecureKeys();
}

/**
 * Deletes all entries from secure storage.
 */
export function clearAllSecureStorage(): Promise<boolean> {
  return Shield.clearAllSecureStorage();
}

/**
 * Returns the strongest biometric authentication level available on the device:
 * "strong" (fingerprint / Face ID / iris), "weak" (face unlock), or "none".
 */
export function getBiometricStrength(): Promise<string> {
  return Shield.getBiometricStrength();
}

/**
 * Requests a platform integrity token.
 * - Android: Play Integrity API token (verify server-side with Google)
 * - iOS: DeviceCheck token (verify server-side with Apple)
 * @param nonce An unpredictable, server-generated value to bind the token.
 */
export function requestIntegrityToken(nonce: string): Promise<string> {
  return Shield.requestIntegrityToken(nonce);
}
