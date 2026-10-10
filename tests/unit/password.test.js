import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/lib/password.js';

describe('Password Utilities', () => {
    it('hashPassword should return a valid argon2 hash starting with $argon2', async () => {
        const plain = 'mysecretpassword';
        const hash = await hashPassword(plain);
        expect(hash).toBeDefined();
        expect(hash).toMatch(/^\$argon2(?:id|i|d)\$/);
    });

    it('verifyPassword should return true for matching password', async () => {
        const plain = 'mysecretpassword';
        const hash = await hashPassword(plain);
        const isValid = await verifyPassword(hash, plain);
        expect(isValid).toBe(true);
    });

    it('verifyPassword should return false for incorrect password', async () => {
        const plain = 'mysecretpassword';
        const hash = await hashPassword(plain);
        const isValid = await verifyPassword(hash, 'wrongpassword');
        expect(isValid).toBe(false);
    });

    it('hashPassword with empty or invalid passwords should fail gracefully', async () => {
        await expect(hashPassword('')).rejects.toThrow();
        await expect(hashPassword(null)).rejects.toThrow();
    });
});
