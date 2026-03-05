import {
  isRooted,
  addSSLPinning,
  preventScreenshot,
  setSecureString,
  getSecureString,
  removeSecureString,
  getRootReasons,
  getAllSecureKeys,
  clearAllSecureStorage,
  getBiometricStrength,
  requestIntegrityToken,
} from '../index';
import NativeShield from '../NativeShield';

jest.mock('../NativeShield', () => {
  return {
    __esModule: true,
    default: {
      isRooted: jest.fn(),
      addSSLPinning: jest.fn(),
      preventScreenshot: jest.fn(),
      setSecureString: jest.fn(),
      getSecureString: jest.fn(),
      removeSecureString: jest.fn(),
      getRootReasons: jest.fn(),
      getAllSecureKeys: jest.fn(),
      clearAllSecureStorage: jest.fn(),
      getBiometricStrength: jest.fn(),
      requestIntegrityToken: jest.fn(),
    },
  };
});

describe('react-native-shield', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Device Integrity', () => {
    it('isRooted calls NativeShield.isRooted', () => {
      (NativeShield.isRooted as jest.Mock).mockReturnValue(true);
      expect(isRooted()).toBe(true);
      expect(NativeShield.isRooted).toHaveBeenCalledTimes(1);
    });

    it('getRootReasons returns array of reason strings', () => {
      (NativeShield.getRootReasons as jest.Mock).mockReturnValue([
        'su_binary',
        'dangerous_packages',
      ]);
      const reasons = getRootReasons();
      expect(reasons).toEqual(['su_binary', 'dangerous_packages']);
      expect(NativeShield.getRootReasons).toHaveBeenCalledTimes(1);
    });

    it('getRootReasons returns empty array on clean device', () => {
      (NativeShield.getRootReasons as jest.Mock).mockReturnValue([]);
      expect(getRootReasons()).toEqual([]);
    });
  });

  describe('SSL Pinning', () => {
    it('addSSLPinning calls NativeShield.addSSLPinning', async () => {
      const domain = 'example.com';
      const hashes = ['sha256/123'];
      (NativeShield.addSSLPinning as jest.Mock).mockResolvedValue(undefined);

      await addSSLPinning(domain, hashes);

      expect(NativeShield.addSSLPinning).toHaveBeenCalledWith(domain, hashes);
    });
  });

  describe('UI Privacy', () => {
    it('preventScreenshot(true) calls NativeShield.preventScreenshot', async () => {
      (NativeShield.preventScreenshot as jest.Mock).mockResolvedValue(
        undefined
      );
      await preventScreenshot(true);
      expect(NativeShield.preventScreenshot).toHaveBeenCalledWith(true);
    });

    it('preventScreenshot(false) calls NativeShield.preventScreenshot', async () => {
      (NativeShield.preventScreenshot as jest.Mock).mockResolvedValue(
        undefined
      );
      await preventScreenshot(false);
      expect(NativeShield.preventScreenshot).toHaveBeenCalledWith(false);
    });
  });

  describe('Secure Storage', () => {
    it('setSecureString passes correct arguments', async () => {
      (NativeShield.setSecureString as jest.Mock).mockResolvedValue(true);
      const result = await setSecureString('key', 'value');
      expect(result).toBe(true);
      expect(NativeShield.setSecureString).toHaveBeenCalledWith('key', 'value');
    });

    it('getSecureString returns stored value', async () => {
      (NativeShield.getSecureString as jest.Mock).mockResolvedValue('secret');
      const result = await getSecureString('key');
      expect(result).toBe('secret');
      expect(NativeShield.getSecureString).toHaveBeenCalledWith('key');
    });

    it('removeSecureString calls native remove', async () => {
      (NativeShield.removeSecureString as jest.Mock).mockResolvedValue(true);
      const result = await removeSecureString('key');
      expect(result).toBe(true);
      expect(NativeShield.removeSecureString).toHaveBeenCalledWith('key');
    });

    it('getAllSecureKeys returns array of keys', async () => {
      (NativeShield.getAllSecureKeys as jest.Mock).mockResolvedValue([
        'token',
        'refresh_token',
      ]);
      const keys = await getAllSecureKeys();
      expect(keys).toEqual(['token', 'refresh_token']);
      expect(NativeShield.getAllSecureKeys).toHaveBeenCalledTimes(1);
    });

    it('getAllSecureKeys returns empty array when storage is empty', async () => {
      (NativeShield.getAllSecureKeys as jest.Mock).mockResolvedValue([]);
      expect(await getAllSecureKeys()).toEqual([]);
    });

    it('clearAllSecureStorage resolves true', async () => {
      (NativeShield.clearAllSecureStorage as jest.Mock).mockResolvedValue(true);
      const result = await clearAllSecureStorage();
      expect(result).toBe(true);
      expect(NativeShield.clearAllSecureStorage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Biometrics', () => {
    it('getBiometricStrength returns "strong"', async () => {
      (NativeShield.getBiometricStrength as jest.Mock).mockResolvedValue(
        'strong'
      );
      expect(await getBiometricStrength()).toBe('strong');
    });

    it('getBiometricStrength returns "weak"', async () => {
      (NativeShield.getBiometricStrength as jest.Mock).mockResolvedValue(
        'weak'
      );
      expect(await getBiometricStrength()).toBe('weak');
    });

    it('getBiometricStrength returns "none" when unavailable', async () => {
      (NativeShield.getBiometricStrength as jest.Mock).mockResolvedValue(
        'none'
      );
      expect(await getBiometricStrength()).toBe('none');
    });
  });

  describe('Platform Attestation', () => {
    it('requestIntegrityToken passes nonce and returns token string', async () => {
      const fakeToken = 'base64encodedtoken==';
      (NativeShield.requestIntegrityToken as jest.Mock).mockResolvedValue(
        fakeToken
      );
      const result = await requestIntegrityToken('server-nonce-xyz');
      expect(result).toBe(fakeToken);
      expect(NativeShield.requestIntegrityToken).toHaveBeenCalledWith(
        'server-nonce-xyz'
      );
    });

    it('requestIntegrityToken rejects when unsupported', async () => {
      (NativeShield.requestIntegrityToken as jest.Mock).mockRejectedValue(
        new Error('INTEGRITY_NOT_SUPPORTED')
      );
      await expect(requestIntegrityToken('nonce')).rejects.toThrow(
        'INTEGRITY_NOT_SUPPORTED'
      );
    });
  });
});
