import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Health Check API', () => {
    it('GET /api/v1/health should return HTTP 200 with status ok and version', async () => {
        const response = await request(app).get('/api/v1/health');
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            status: 'ok',
            version: '2.0.0'
        });
    });
});
