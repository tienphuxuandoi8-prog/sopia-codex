import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Security Integration Tests', () => {
    it('should include correct security headers in response', async () => {
        const response = await request(app).get('/api/v1/health');
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['x-frame-options']).toMatch(/SAMEORIGIN/i);
        expect(response.headers['content-security-policy']).toBeDefined();
    });

    it('POST /api/v1/auth/login without CSRF token should return 403 CSRF_FAILED', async () => {
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        
        expect(response.status).toBe(403);
        // Depending on implementation, you might check body or text for CSRF_FAILED
        expect(JSON.stringify(response.body)).toContain('CSRF');
    });

    it('should return 404 for unknown endpoints', async () => {
        const response = await request(app).get('/api/v1/unknown-endpoint-xyz');
        expect(response.status).toBe(404);
    });
});
