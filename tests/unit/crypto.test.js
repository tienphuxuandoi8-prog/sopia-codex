import { describe, it, expect } from 'vitest';
import { randomToken, sha256, hmacSha256, timingSafeCompare } from '../../src/lib/crypto.js';

describe('Crypto Utilities', () => {
    it('randomToken should return a hex string of expected length', () => {
        const bytes = 16;
        const token = randomToken(bytes);
        expect(typeof token).toBe('string');
        expect(token.length).toBe(bytes * 2);
        expect(token).toMatch(/^[0-9a-f]+$/i);
    });

    it('sha256 should return consistent hash', () => {
        const input = 'hello';
        const expectedHash = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
        expect(sha256(input)).toBe(expectedHash);
    });

    it('hmacSha256 should return valid HMAC hash', () => {
        const key = 'secret_key';
        const data = 'some_data';
        const hash = hmacSha256(key, data);
        expect(hash).toBeDefined();
        expect(typeof hash).toBe('string');
        expect(hash.length).toBeGreaterThan(0);
    });

    it('timingSafeCompare should return true for identical strings and false for different ones', () => {
        expect(timingSafeCompare('hello', 'hello')).toBe(true);
        expect(timingSafeCompare('hello', 'world')).toBe(false);
        expect(timingSafeCompare('hello', 'hello ')).toBe(false);
        expect(timingSafeCompare('hel', 'hello')).toBe(false);
    });
});
